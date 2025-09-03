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
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler, OneHotEncoder
from sklearn.metrics import f1_score, precision_score, recall_score, accuracy_score, confusion_matrix, precision_recall_fscore_support
import json
from typing import Dict
from google.cloud import storage
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any, Optional
import logging
import re

device = torch.device('cpu')
if torch.cuda.is_available():
    device = torch.device('cuda')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class Block(BaseModel):
    block_id: str
    order: int
    params: Dict[str, Any]

class Diagram(BaseModel):
    blocks: List[Block]
    execution: str
    dataset: str
    optimizer: str
    loss_fn: str
    evalFns: List[str]
    lr: float
    epochs: int

class JobRequest(BaseModel):
    job_id: str
    callback_url: Optional[HttpUrl]  # URL validation, optional if empty
    dataset: str
    diagram: Diagram
    user_id: str


class DataLoaderCreator():
    def __init__(self, dataset, datasets_path, loss_fn, train_split=0.8):
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
        self.loss_fn = loss_fn

        self.dataset_locations = {
            "emails": self.datasets_path / "emails" / "emails.csv",
            "mushrooms": self.datasets_path / "mushrooms" / "mushrooms.csv", 
            "weather": self.datasets_path / "weather" / "weather.csv"
        }
    
    def getLoaders(self):
        methods = {
            "shapes": self.loadShapesDataset,
            "emails": self.loadEmailsDataset,
            "mushrooms": self.loadMushroomsDataset,
            "weather": self.loadWeatherDataset
        }

        if self.dataset not in methods:
            logger.info('dataset not available')
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
    
    def returnDataLoaders(self, X_train, y_train, X_test, y_test, x_dtype=torch.float32, y_dtype=torch.float32):
        # Convert to PyTorch tensors
        X_train_tensor = torch.tensor(X_train, dtype=x_dtype)
        X_test_tensor = torch.tensor(X_test, dtype=x_dtype)
        y_train_tensor = torch.tensor(y_train, dtype=y_dtype)
        y_test_tensor = torch.tensor(y_test, dtype=y_dtype)

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
        return train_loader, test_loader, input_shape, output_shape, 'binary_classification'
    
    def loadMushroomsDataset(self):
        df = self.readIntoDf()

        df_cols = ['cap-shape', 'cap-surface', 'cap-color', 'bruises', 'odor', 
            'gill-attachment', 'gill-spacing', 'gill-size', 'gill-color',
            'stalk-shape', 'stalk-root', 'stalk-surface-above-ring',
            'stalk-surface-below-ring', 'stalk-color-above-ring',
            'stalk-color-below-ring', 'veil-color', 'ring-number',
            'ring-type', 'spore-print-color', 'population', 'habitat' ]

        # Convert the DataFrame into a PyTorch tensor

        # Separate features and labels
        X_df = df[df_cols]  # Features
        y_df = (df['class'] == "p").astype(int).values
        if (self.loss_fn == 'hinge_loss'):
            y_df = 2*y_df - 1

        # Apply OneHotEncoder
        encoder = OneHotEncoder(sparse_output=False)  # sparse=False will return a dense array
        encoded_features = encoder.fit_transform(X_df)

        # Get feature names after encoding
        feature_names = encoder.get_feature_names_out(df_cols)

        # Create a DataFrame for the encoded features
        encoded_df = pd.DataFrame(encoded_features, columns=feature_names)

        # Add back the 'class' column (labels)
        encoded_df['class'] = y_df

        # train test split
        X_train, X_test, y_train, y_test = train_test_split(encoded_df.drop('class', axis=1), encoded_df['class'], test_size=0.2, random_state=42)
        input_shape, output_shape = X_train.shape[1], 1

        # Convert the DataFrame to PyTorch tensors
        train_loader, test_loader = self.returnDataLoaders(X_train.to_numpy(), y_train.to_numpy(), X_test.to_numpy(), y_test.to_numpy())
        return train_loader, test_loader, input_shape, output_shape, 'binary_classification'
    
    def loadWeatherDataset(self):
        df = self.readIntoDf()
        encoder = LabelEncoder()
        df['weather'] = encoder.fit_transform(df['weather'])

        scaler = StandardScaler()
        X = df.drop(['weather', 'date'], axis=1)
        X,y = scaler.fit_transform(X), df['weather'].astype(int).values

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        input_shape, output_shape = X.shape[1], 5

        train_loader, test_loader = self.returnDataLoaders(X_train, y_train, X_test, y_test, y_dtype=torch.int64)
        return train_loader, test_loader, input_shape, output_shape, 'multiclass_classification'


class EvalFns():
    @staticmethod
    def get_all_metrics(model, test_loader, lossFn, task='binary_classification'):
        # choose get all multiclass or binary metrics function
        if task == 'binary_classification':
            return EvalFns.get_all_binary_metrics(model, test_loader, lossFn)
        else:
            return EvalFns.get_all_multiclass_metrics(model, test_loader, lossFn)

    @staticmethod
    def get_all_multiclass_metrics(model, test_loader, lossFn):
        model.eval()
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            for inputs, labels in test_loader:
                inputs = inputs.to(device)
                labels = labels.to(device)
                
                outputs = model(inputs)
                preds = torch.argmax(outputs, dim=1)
                
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
        output_metrics = {}

        # we average the standard metrics over all classes
        accuracy = accuracy_score(all_labels, all_preds)
        output_metrics['accuracy_metric'] = float('%.3f' % (accuracy * 100))
        precision, recall, f1, _ = precision_recall_fscore_support(
            all_labels, all_preds, average='macro', zero_division=0.0
        )
        output_metrics['f1_score_metric'] = float('%.3f' % f1)
        output_metrics['precision_metric'] = float('%.3f' % precision)
        output_metrics['recall_metric'] = float('%.3f' % recall)
        # output_metrics['confusion_matrix'] = confusion_matrix(all_labels, all_preds).tolist()
        return output_metrics

    @staticmethod
    def get_all_binary_metrics(model, test_loader, lossFn):

        model.eval()
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            for inputs, labels in test_loader:
                inputs = inputs.to(device)
                labels = labels.to(device)
                
                outputs = model(inputs)
                preds = None

                if (lossFn == 'bce'):
                    preds = (outputs > 0.5).long()  # For binary classification, use a 0.5 threshold
                elif (lossFn == 'hinge_loss'):
                    # models trained on hinge loss outputs between -1 and 1, however metrics for binary classification require 0 and 1
                    preds = (outputs > 0).long()  # For hinge loss, use 0 threshold
                    # models using hinge loss have labels -1 or 1
                    labels = ((labels+1)//2).long()  # Convert labels to 0 and 1
                else:
                    preds = (outputs > 0).long()  # For binary classification, use a 0.5 threshold
                

                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
        
        # calculate accuraacy manually
        accuracy = sum([1 for i in range(len(all_preds)) if all_preds[i] == all_labels[i]]) / len(all_preds)
        logging.info(f"Accuracy: {accuracy}")

        output_metrics = {}
        output_metrics['f1_score_metric'] = float('%.3f'%(f1_score(all_labels, all_preds, zero_division=0.0)))
        output_metrics['precision_metric'] = float('%.3f'%(precision_score(all_labels, all_preds, zero_division=0.0)))
        output_metrics['recall_metric'] = float('%.3f'%(recall_score(all_labels, all_preds, zero_division=0.0))) # True positive rate
        output_metrics['accuracy_metric'] = float('%.3f'%(accuracy_score(all_labels, all_preds)))
        # output_metrics['confusion_matrix_metric'] = confusion_matrix(all_labels, all_preds)
        
        # get false positive
        false_positive = np.sum((all_labels == 1) & (all_preds == 0))
        true_negative = np.sum((all_labels == 0) & (all_preds == 0))

        # Compute False Positive Rate (FPR)
        false_positive_rate = false_positive / (false_positive + true_negative) if (false_positive + true_negative) > 0 else 0
        output_metrics['false_positive_metric'] = false_positive_rate

        return output_metrics

class BinaryHingeLoss(nn.Module):
  def __init__(self):
    super(BinaryHingeLoss, self).__init__()

  def forward(self, inputs, targets):
    return torch.mean(torch.clamp(1 - inputs * targets, min=0))

class Diagram():
    moduleDict = {
        'flatten_layer': nn.Flatten,
        'linear_layer': nn.Linear,
        'relu_activation': nn.ReLU,
        'sigmoid_activation': nn.Sigmoid,
        'dropout_layer': nn.Dropout,
        'tanh_activation': nn.Tanh,
        'softmax_activation': nn.Softmax
    }

    optimizerDict = {
        'adam_algorithm': optim.Adam,
        'sgd_algorithm': optim.SGD,
        'momentum_algorithm': optim.SGD
    }

    lossFnDict = {
        'bce': nn.BCELoss,
        'hinge_loss': BinaryHingeLoss,
        'cross_entropy_loss': nn.CrossEntropyLoss
    }

    def __init__(
        self,
        train_loader,
        test_loader,
        input_shape,
        output_shape,
        job_id,
        task, # binary_classification or multiclass_classification
        callback_url=None,
        user_id=None
        ):
        '''
        output_shape: shape of the output. Based on the label shapes of the dataloader. This is also bundled with dataloader by design
        '''
        self.train_loader, self.test_loader, self.job_id = train_loader, test_loader, job_id
        self.blocks, self.execution, self.dataset = None, None, None
        self.input_shape = input_shape
        self.optimizer = None
        self.loss_fn = None
        self.loss_fn_string = None
        self.model = None
        self.evalfns = None
        self.model_updated = False
        self.output_shape = output_shape
        self.epochs = None
        self.callback_url = callback_url
        self.user_id = user_id
        self.task = task

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
        new_blocks = sorted(req.blocks,key=lambda x: x.order)
        if new_blocks == self.blocks:
            self.model_updated = False
        else:
            self.model_updated = True
            self.blocks = new_blocks

        self.execution = req.execution
        self.optimizer_name = req.optimizer
        self.lr = req.lr
        self.loss_fn_string = req.loss_fn
        self.loss_fn = self.lossFnDict[req.loss_fn]()
        self.evalfns = req.evalFns
        self.epochs = req.epochs

    def create_model_from_inputs(self):
        '''
        layers: OrderedDict[str, Dict (params)]. First item is assumed to be input layer, last layer assumed to be output
        '''
        # do not recreate the model if it is the same
        if not self.model_updated:
            return

        last_linear_layer_order = max([block.order for block in self.blocks if block.block_id == 'linear_layer'])
        model = nn.Sequential()
        # do we want output shape to be enforced
        in_size = self.input_shape
        for block in self.blocks:
            # if there are out_features, there must also be in_features to specify. Otherwise, we probably don't need either (i.e. in case of activation fcn)
            if "out_features" in block.params:
                # make last layer match the desired output size, which is based on the dataset
                if block.order == last_linear_layer_order:
                    block.params['out_features'] = self.output_shape
                model.add_module(block.block_id + str(block.order), self.moduleDict[block.block_id](in_features=in_size, **block.params))
                in_size = block.params.get("out_features", in_size)
            else:
                model.add_module(block.block_id + str(block.order), self.moduleDict[block.block_id](**block.params))
        self.model = model
        self.model = self.model.to(device)
        self.model_updated = False

    def execute(self, return_metrics=False):
        '''
        Train or evaluate model based on execution
        '''
        logger.info(f"Executing model with execution type: {self.execution}")
        if self.execution == "train":
            self.train()
            return self.evaluate()
        elif self.execution == "eval":
            return self.evaluate()
        else:
            raise Exception("Invalid execution type")

    def post_update(self, data: Dict):
        '''Function to send updates'''
        try:
            response = requests.post(self.callback_url, json=data)
            logging.info(f"Published training update, received: {response}")
            return response
        except Exception as e:
            logging.info(f"Failed to send update: {e}")

    def train(self):
        '''
        TODO: ensure that this training loop works for every one of our datasets (hopefully squeeze not a problem)
        '''
        self.model.train()
        optimizer = self.optimizerDict[self.optimizer_name](self.model.parameters(), lr=self.lr)
        
        try:
            for epoch in range(self.epochs):
                running_loss = 0.0
                for data, labels in self.train_loader:
                    optimizer.zero_grad()

                    outputs = self.model(data)
                    loss = None
                    if self.loss_fn_string == 'cross_entropy_loss':
                        # in cross entropy loss scenario, we don't require the labels and outputs to have same shape
                        loss = self.loss_fn(outputs, labels)
                    else:
                        loss = self.loss_fn(outputs, labels.view_as(outputs))

                    loss.backward()
                    optimizer.step()

                    running_loss += loss.item()
                    
                # logging.info(f"running loss: {running_loss}")
                # logging.info(f"Epoch {epoch+1}/{self.epochs}, Loss: {running_loss/len(self.train_loader):.4f}")
                
                # If we are sending updates
                if self.callback_url:
                    update_data = {
                        "message": f"Epoch {epoch+1}/{self.epochs}, Loss: {running_loss/len(self.train_loader):.4f}",
                        "metrics": {
                            "loss": running_loss/len(self.train_loader),
                            "epoch": epoch+1
                        },
                        "update_type": "progress",
                        "job_id": self.job_id,
                        "user_id": self.user_id
                    }
                    response = self.post_update(update_data)
                    if response.json().get("stop_training", False):
                        logging.info("Training stopped by user") # should we raise an interrupt exception here?
                        break
                    logging.info(f"Published training update, received: {response}")
        
        except Exception as e:
            self.errorHandler(e)
            raise e
    
    
    def evaluate(self):
        self.model.eval()
        
        logger.info('Evaluating model')
        try:
            return_metrics = EvalFns.get_all_metrics(self.model, self.test_loader, self.loss_fn_string, self.task)
        except Exception as e:
            logger.info('Error evaluating model')
            self.errorHandler(e)
            raise e

        # convert to float    
        for metric in return_metrics:
            return_metrics[metric] = float(return_metrics[metric])
        
        if self.callback_url:
            logging.info(f"Sending evaluation update: {return_metrics}")
            response = requests.post(self.callback_url, json={
                "message": "Evaluation complete",
                "update_type": "result",
                "metrics": return_metrics,
                "job_id": self.job_id,
                "user_id": self.user_id
            })
            logging.info(f"Published evaluation update, received: {response}")
        
        return return_metrics
    
    def errorHandler(self, err):
        '''
        Returns explanations for known errors
        '''
        if not self.callback_url:
            return
        
        errMessage = str(err)
        update_data = {
            "message": errMessage,
            "update_type": "error",
            "layer": -1,
            "job_id": self.job_id,
            "user_id": self.user_id
        }

        if errMessage == "all elements of input should be between 0 and 1":
            update_data["message"] = "Selected loss function requires model outputs to be between 0 and 1. Apply an appropriate activation function as the last layer to achieve this range!"
            update_data["layer"] = len(self.blocks)
            logging.info("Loss error caught!") 
        elif re.compile("shape '.*' is invalid for input of size .*").match(errMessage):
            update_data["message"] = "Final layer of the model outputs an unexpected number of predictions. Choose an output shape that matches the prediction labels!"
            update_data["layer"] = len(self.blocks)
            logging.info("Shape error caught!")
        elif (errMessage == "expected scalar type Long but found Float" or
        re.compile("Using a target size \(torch\.Size\(\[(.*?)\]\)\) that is different to the input size \(torch\.Size\(\[(.*?)\]\)\) is deprecated\. Please ensure they have the same size\.").match(errMessage) or
        re.compile("The size of tensor a \(.*?\) must match the size of tensor b \(.*?\) at non-singleton dimension .*").match(errMessage)):
            update_data["message"] = f"Loss function does not work with specified task due to different expected outputs. For this challenge, choose a loss function that works with {self.task}!"
            update_data["layer"] = len(self.blocks)
            logging.info("Output to loss shape error caught")
        else:
            logging.info(f"Unknown error caught!: {errMessage}")

        self.post_update(update_data)

def download_dataset(datasets_path, dataset_name):
    '''
    This function looks at datasets_path / dataset_name and sees if the folder already exists (it has been downloaded)
    If not, it will retrieve and download all the items in the folder /dataset_name/ in the gcs bucket to local
    '''
    logging.info(f"Starting download for dataset: {dataset_name}")
    
    BUCKET_NAME = "myai-datasets-bucket"
    dataset_folder = datasets_path / dataset_name

    # Check if entire dataset folder already exists
    if dataset_folder.exists():
        logging.info(f"Dataset {dataset_name} already exists at {dataset_folder}. Skipping download.")
        return
    
    try:
        # Initialize GCS client
        client = storage.Client()
        bucket = client.bucket(BUCKET_NAME)
        
        # List only blobs in the specified dataset folder
        blobs = bucket.list_blobs(prefix=f"{dataset_name}/")
        
        # Track if we found any files
        files_found = False
        
        # Download each file in the dataset folder
        for blob in blobs:
            # Skip if the blob is a directory marker
            if blob.name.endswith('/'):
                continue
                
            files_found = True
            
            # Create the full local path maintaining the bucket structure
            local_file_path = datasets_path / blob.name
            
            # Ensure parent directory exists
            local_file_path.parent.mkdir(parents=True, exist_ok=True)
            
            logging.info(f"Downloading {blob.name} to {str(local_file_path)}")
            
            try:
                blob.download_to_filename(str(local_file_path))
                logging.info(f"Successfully downloaded {blob.name}")
            except Exception as e:
                logging.error(f"Error downloading {blob.name}: {str(e)}")
                # If any file fails to download, cleanup the partial dataset
                if dataset_folder.exists():
                    import shutil
                    shutil.rmtree(dataset_folder)
                raise  # Re-raise the exception to indicate failure
        
        if not files_found:
            logging.warning(f"No files found in dataset folder: {dataset_name}")
            raise ValueError(f"Dataset {dataset_name} not found in bucket")
            
        logging.info(f"Download complete for dataset: {dataset_name}")
    
    except Exception as e:
        logging.error(f"Error during dataset download: {str(e)}")
        raise

