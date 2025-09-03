from google.cloud import storage
import os
import argparse
from pathlib import Path
import requests
import json
import ast
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from . import utils


project_id = "cs194-449021"
topic_id = "compute-updates"

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

    # Structure: Bucket: [shapes/, emails/]
    DATASET_PATHS = {
        "shapes": "shapes/",
        "emails": "emails/"
    }
    # LOCAL_PATH = Path("/tmp/dataset") # use: Path.home() / "loc" to refer to a path in home directory

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

def execute_model(diagram, datasets_path):
    first_parse = json.loads(diagram)
    # sometimes needs second parse
    diagram_obj = first_parse
    if isinstance(first_parse, str):
        diagram_obj = json.loads(first_parse)
    download_dataset(diagram_obj["dataset"], datasets_path)
    dataloader_creator = utils.DataLoaderCreator(
        diagram_obj["dataset"],
        datasets_path
    )
    train_loader, test_loader, input_shape, output_shape = dataloader_creator.getLoaders()

    executable_model = utils.Diagram(train_loader,test_loader,input_shape,output_shape)
    executable_model.digest_diagram_object(diagram_obj)
    executable_model.create_model_from_inputs()
    executable_model.execute()

def main():
    parser = argparse.ArgumentParser(description="Run a model training with specified diagram configuration.")
    parser.add_argument("--diagram-config", type=str, required=True, help="Model configuration JSON string")
    
    args = parser.parse_args()

    datasets_path = Path("/tmp/dataset")
    execute_model(args.diagram_config, datasets_path)

if __name__ == "__main__":
    '''d = """
    {
    "blocks": [
        {
        "block_id": "linear_layer",
        "order": 0,
        "params": { "out_features": 64 }
        },
        {
        "block_id": "relu_activation",
        "order": 1,
        "params": {}
        },
        {
        "block_id": "linear_layer",
        "order": 2,
        "params": { "out_features": 1 }
        },
        {
        "block_id": "sigmoid_activation",
        "order": 3,
        "params": {}
        }
    ],
    "execution": "eval",
    "dataset": "mushrooms",
    "optimizer": "adam",
    "loss_fn": "bce",
    "evalFns": [
        "accuracy"
    ],
    "lr": 0.001,
    "epochs": 1,
    "callback_url": ""
    }
    """ '''
    """ datasets_path = Path("C:") / "Users" / "jhung" / "Desktop" / "Stanford" / "COLLEGE CS" / "Wearipedia" / "wearipedia-hee" / "win25-Team8" / "datasetstf" / "datasets"
    execute_model(d, datasets_path) """
    main()
