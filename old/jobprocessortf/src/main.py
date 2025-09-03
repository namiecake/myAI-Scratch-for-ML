from fastapi import FastAPI
from pydantic import BaseModel
from google.cloud import aiplatform
import os
from typing import Any, Dict, List, Literal
import json

app = FastAPI()

origins = [
    "*"
]

project_id = "cs194-449021"
project_region = "us-west1"
image_name = "myai-model-code"

# Define the structure for individual blocks in the pipeline
class Block(BaseModel):
    """
    Represents a single block in the pipeline.
    """
    block_id: str
    order: int
    params: Dict[str, Any]  # Parameters specific to the block

# Define the request schema for the API
class DiagramRequest(BaseModel):
    """
    Represents the structure of a diagram request.
    """
    # all blocks of the pipeline
    blocks: List[Block]  
    execution: Literal["eval", "train"]  
    dataset: str  # filename of dataset
    optimizer: str
    loss_fn: str
    evalFns: List[str]
    lr: float
    epochs: int
    callback_url: str

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/execute_task")
async def execute_task(request: DiagramRequest):
    diagram_request_json = request.json()
    diagram_config_string = json.dumps(diagram_request_json)
    print(f"Received training task: {diagram_config_string}")  # Log for debugging
    
    # example: https://pypi.org/project/google-cloud-aiplatform/
    staging_bucket = f"gs://{project_id}-vertex-ai-staging"
    aiplatform.init(
        project=project_id,
        location=project_region,
        staging_bucket=staging_bucket
        )

    # deploys a vertex AI node that runs the AI MODEL CREATOR code container (must deploy this first)
    job = aiplatform.CustomJob(
        display_name = "Model Execution Request",
        worker_pool_specs=[
            {
                "machine_spec": {
                    "machine_type": "n1-standard-4"
                },
                "replica_count": 1,
                "container_spec": {
                    "image_uri": f"{project_region}-docker.pkg.dev/{project_id}/{image_name}/{image_name}",
                    "args": ["--diagram-config", diagram_config_string],
                },
            }
        ]
    )

    model = job.run(sync=False)

    return {"message": "Execution started", "job_id": model}



""" if __name__ == "__main__":
    diagram_config_string = '''{
        "blocks": [
            {
            "block_id": "linear_layer",
            "order": 0,
            "params": { "out_features": 64 }
            },
            {
            "block_id": "relu_activation",
            "order": 0,
            "params": {}
            },
            {
            "block_id": "linear_layer",
            "order": 0,
            "params": { "out_features": 1 }
            },
            {
            "block_id": "sigmoid_activation",
            "order": 0,
            "params": {}
            }
        ],
        "execution": "train",
        "dataset": "emails",
        "optimizer": "adam",
        "loss_fn": "bce",
        "evalFns": [
            "accuracy"
        ],
        "lr": 0.001,
        "epochs": 1
        }'''
    
    staging_bucket = f"gs://{project_id}-vertex-ai-staging"
    aiplatform.init(
        project=project_id,
        location=project_region,
        staging_bucket=staging_bucket
        )

    # deploys a vertex AI node that runs the AI MODEL CREATOR code container (must deploy this first)
    job = aiplatform.CustomJob(
        display_name = "Model Execution Request",
        worker_pool_specs=[
            {
                "machine_spec": {
                    "machine_type": "n1-standard-4"
                },
                "replica_count": 1,
                "container_spec": {
                    "image_uri": f"{project_region}-docker.pkg.dev/{project_id}/{image_name}/{image_name}",
                    "args": ["--diagram-config", diagram_config_string]
                },
            }
        ]
    )

    model = job.run(sync=True)

    print(model) """