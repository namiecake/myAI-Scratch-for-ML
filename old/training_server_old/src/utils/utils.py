import requests
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset, sampler
import torchvision.datasets as dset
import torchvision.transforms as T
import numpy as np
import pathlib as Path
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
import json
from threading import Thread
from typing import Dict
from google.cloud import storage

device = torch.device('cpu')
if torch.cuda.is_available():
    device = torch.device('cuda')


class DataLoaderCreator():
    def __init__(self, dataset, datasets_path, train_split=0.8):
        '''
        datasets: str, the dataset to load
        datasets_path: pathlib.PosixPath, path to dataset folder
        train_split: float, fraction of data to put in train. rest is put in Test

        This class assumes a predetermined structure to each dataset folder
        '''
        self.dataset = dataset
        self.datasets_path = datasets_path
        self.train_split = train_split
        self.test_split = 1 - train_split

        self.dataset_locations = {
            "emails": self.datasets_path / "emails" / "emails.csv",
            "mushrooms": self.datasets_path / "mushrooms" / "mushrooms.csv" 
        }
    
    def getLoaders(self):
        methods = {
            "shapes": self.loadShapesDataset,
            "emails": self.loadEmailsDataset,
            "mushrooms": self.loadMushroomsDataset
        }

        if self.dataset not in methods:
            print("Dataset not available")
            return None, None, None, None
        return methods[self.dataset]()

    def readIntoDf(self):
        file_path = self.dataset_locations[self.dataset]

        df = None
        try:
            # Read the CSV file into a pandas DataFrame
            df = pd.read_csv(file_path)
        except FileNotFoundError:
            print(f"Error: File not found at {file_path}")
        except pd.errors.ParserError:
            print(f"Error: Could not parse the CSV file at {file_path}. Check the file format.")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
        return df
    
    def loadShapesDataset(self):
        pass
    
    def returnDataLoaders(self, X_train, y_train, X_test, y_test):
        # Convert to PyTorch tensors
        X_train_tensor = torch.tensor(X_train, dtype=torch.float32)
        X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
        y_train_tensor = torch.tensor(y_train, dtype=torch.float32)
        y_test_tensor = torch.tensor(y_test, dtype=torch.float32)

        # Create DataLoader for batching
        train_data = TensorDataset(X_train_tensor, y_train_tensor)
        test_data = TensorDataset(X_test_tensor, y_test_tensor)
        train_loader = DataLoader(train_data, batch_size=2, shuffle=True)
        test_loader = DataLoader(test_data, batch_size=2, shuffle=False)

        return train_loader, test_loader

    def loadEmailsDataset(self):
        df = self.readIntoDf()

        x,y = df['text'], (df['label'] == "spam").astype(int).values
        # vectorize each separate value x
        vectorizer = CountVectorizer()
        X = vectorizer.fit_transform(x).toarray()

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=self.test_split, random_state=42)

        train_loader, test_loader = self.returnDataLoaders(X_train, y_train, X_test, y_test)
        
        input_shape, output_shape = X_train.shape[1], 1
        return train_loader, test_loader, input_shape, output_shape
    
    def loadMushroomsDataset(self):
        df = self.readIntoDf()

        df_cols = ['cap-shape', 'cap-surface', 'cap-color', 'bruises', 'odor', 
            'gill-attachment', 'gill-spacing', 'gill-size', 'gill-color',
            'stalk-shape', 'stalk-root', 'stalk-surface-above-ring',
            'stalk-surface-below-ring', 'stalk-color-above-ring',
            'stalk-color-below-ring', 'veil-color', 'ring-number',
            'ring-type', 'spore-print-color', 'population', 'habitat' ]

        for col in df_cols:
            encoder = LabelEncoder()
            df[col] = encoder.fit_transform(df[col])

        scaler = StandardScaler()
        X = df.drop(['class'], axis=1)

        # poisonous = 1, edible = 0
        X,y = scaler.fit_transform(X), (df['class'] == "p").astype(int).values
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        input_shape, output_shape = X.shape[1], 1
        train_loader, test_loader = self.returnDataLoaders(X_train, y_train, X_test, y_test)
        return train_loader, test_loader, input_shape, output_shape
    
class EvalFns():
    @staticmethod
    def binary_classification_accuracy(model, test_loader, callback_url=None):
        correct = 0
        total = 0
        with torch.no_grad():  # No need to compute gradients during evaluation
            for inputs, labels in test_loader:
                outputs = model(inputs)
                predicted = (outputs.squeeze() > 0.5).float()  # Convert output to 0 or 1
                correct += (predicted == labels).sum().item()
                total += labels.size(0)
        accuracy = 100 * correct / total

        print(f"Test Accuracy: {accuracy:.2f}%")

        # If we are sending updates
        if callback_url:
            response = requests.post(callback_url, json={
                "message": f"Evaluation succeeded with accuracy: {accuracy:.2f}%",
                "update_type": "result"
            })

            print("Published evaluation update, received:", response)

    evalFnsDict = {
        'accuracy': binary_classification_accuracy.__func__
    }

class Diagram():
    moduleDict = {
        'flatten_layer': nn.Flatten,
        'linear_layer': nn.Linear,
        'relu_activation': nn.ReLU,
        'sigmoid_activation': nn.Sigmoid
    }

    optimizerDict = {
        'adam': optim.Adam,
        'sgd': optim.SGD
    }

    lossFnDict = {
        'bce': nn.BCELoss
    }

    def __init__(
        self,
        train_loader,
        test_loader,
        input_shape,
        output_shape
        ):
        '''
        output_shape: shape of the output. Based on the label shapes of the dataloader. This is also bundled with dataloader by design
        '''
        self.train_loader, self.test_loader = train_loader, test_loader
        self.blocks, self.execution, self.dataset = None, None, None
        self.input_shape = input_shape
        self.optimizer = None
        self.loss_fn = None
        self.model = None
        self.evalfns = None
        self.model_updated = False
        self.output_shape = output_shape
        self.epochs = None
        self.callback_url = None

    def digest_diagram_object(self, req):
        '''
        req is a json object which represents the received diagram response
        read it and get the variables required
        req has structure:
        {
        "blocks": [
            {
            "block_id": "string",
            "order": 0,
            "params": {}
            }
        ],
        "execution": "eval",
        "dataset": "string",
        "optimizer": "string",
        "loss_fn": "string",
        "evalFns": [
            "string"
        ],
        "lr": float,
        "epochs": int
        }
        '''
        new_blocks = sorted(req["blocks"],key=lambda x: x["order"])
        if new_blocks == self.blocks:
            self.model_updated = False
        else:
            self.model_updated = True
            self.blocks = new_blocks

        self.execution = req["execution"]
        self.optimizer_name = req["optimizer"]
        self.lr = req["lr"]
        self.loss_fn = self.lossFnDict[req["loss_fn"]]()
        self.evalfns = req["evalFns"]
        self.epochs = req["epochs"]
        self.callback_url = req["callback_url"]

    def create_model_from_inputs(self):
        '''
        layers: OrderedDict[str, Dict (params)]. First item is assumed to be input layer, last layer assumed to be output
        '''
        # do not recreate the model if it is the same
        if not self.model_updated:
            return

        model = nn.Sequential()
        # do we want output shape to be enforced
        in_size = self.input_shape
        for block in self.blocks:
            # if there are out_features, there must also be in_features to specify. Otherwise, we probably don't need either (i.e. in case of activation fcn)
            if "out_features" in block["params"]:
                model.add_module(block["block_id"] + str(block["order"]), self.moduleDict[block["block_id"]](in_features=in_size, **block["params"]))
                in_size = block["params"].get("out_features", in_size)
            else:
                model.add_module(block["block_id"] + str(block["order"]), self.moduleDict[block["block_id"]](**block["params"]))
        self.model = model
        self.model = self.model.to(device)
        self.model_updated = False

    def execute(self):
        '''
        Train or evaluate model based on execution
        '''
        if self.execution == "train":
            self.train()
            self.evaluate() # IDK IF THIS IS ASYNC
        elif self.execution == "eval":
            self.evaluate()
        else:
            raise Exception("Invalid execution type")

    def post_update(self, data: Dict):
        '''Function to send updates'''
        try:
            response = requests.post(self.callback_url, json=data)
            print("Published training update, received:", response)
        except Exception as e:
            print(f"Failed to send update: {e}")

    def train(self):
        '''
        TODO: ensure that this training loop works for every one of our datasets (hopefully squeeze not a problem)
        '''
        self.model.train()
        optimizer = self.optimizerDict[self.optimizer_name](self.model.parameters(), lr=self.lr)

        for epoch in range(self.epochs):
            running_loss = 0.0
            for data, labels in self.train_loader:
                optimizer.zero_grad()

                outputs = self.model(data)
                loss = self.loss_fn(outputs, labels.view_as(outputs))


                loss.backward()
                optimizer.step()

                running_loss += loss.item()
            print(f"Epoch {epoch+1}/{self.epochs}, Loss: {running_loss/len(self.train_loader):.4f}")
            
            # If we are sending updates
            if self.callback_url:
                update_data = {
                    "message": f"Epoch {epoch+1}/{self.epochs}, Loss: {running_loss/len(self.train_loader):.4f}",
                    "update_type": "progress"
                }
                # multithread the update if it is not the last epoch (so as to not slow down training)
                if epoch < self.epochs-1:
                    # Fire and forget in background thread
                    Thread(
                        target=self.post_update, 
                        args=(update_data, ),
                        daemon=True  # Makes thread exit when main program exits
                    ).start()
                else:
                    # if last epoch (training finished), simply post the request on this thread
                    response = requests.post(self.callback_url, json=update_data)
                    print("Published training update, received:", response)
    
    def evaluate(self):
        self.model.eval()
        for evalfn in self.evalfns:
            EvalFns.evalFnsDict[evalfn](self.model, self.test_loader, self.callback_url)


def pipeline_test(diagram):
    message = {'message': 'unknown'}
    try:
        download_dataset("shapes")

        message = {'message': 'success!'}
        
        print("dataset download success!")
    except:
        
        message = {'message': 'failure!'}
        
        print("dataset download failed")
    
    try:
        # json.loads handles escaped json objects (happens if modified by router or json object stringified many times)
        first_parse = json.loads(diagram)

        # sometimes needs second parse
        diagram_obj = first_parse
        if isinstance(first_parse, str):
            diagram_obj = json.loads(first_parse)
        
        # Test if we can access other keys too
        print("Keys in diagram_obj:", diagram_obj.keys())

        callback_url = diagram_obj["callback_url"]
        response = requests.post(callback_url, json=message)

        print("Published update successfully!", response)
    except Exception as e:
        print("Error while publishing message", e)
        return


def download_dataset(dataset_name, datasets_path):
    # GCS uses global namespace so the bucket name alone is specific enough
    BUCKET_NAME = "myai-datasets-bucket"

    # Structure: Bucket: [shapes/, emails/, mushrooms/]
    DATASET_PATHS = {
        "shapes": "shapes/",
        "emails": "emails/",
        "mushrooms": "mushrooms/",
    }

    dataset_local_path = datasets_path / dataset_name
    dataset_local_path.mkdir(parents=True, exist_ok=True)

    # Initialize GCS client
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    blobs = bucket.list_blobs(prefix=DATASET_PATHS[dataset_name])

    # Download each file in the folder
    for blob in blobs:

        # get the path of the folder in the bucket
        rel_path = blob.name[len(DATASET_PATHS[dataset_name]):]
        # copy the folder over to our desired location preserving the relative structure
        local_file_path = dataset_local_path / rel_path
        local_file_path.parent.mkdir(parents=True, exist_ok=True)
 
        blob.download_to_filename(str(local_file_path))

        print(f"Downloaded {blob.name} to {str(local_file_path)}")

    print("Dataset download complete!")
