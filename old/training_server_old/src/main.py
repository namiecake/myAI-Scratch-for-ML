import os
import argparse
from pathlib import Path
import requests
import json
import ast
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from . import utils
from pydantic import BaseModel, json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))


project_id = "cs194-449021"
topic_id = "compute-updates"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change to specific origins for security)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def execute_model(diagram, dataset, callback_url):
    first_parse = json.loads(diagram)
    # sometimes needs second parse
    diagram_obj = first_parse
    if isinstance(first_parse, str):
        diagram_obj = json.loads(first_parse)

    # Download the dataset from GCS and store locally on machine
    local_datasets_path = Path("/tmp/dataset")
    utils.download_dataset(dataset, local_datasets_path)
    dataloader_creator = utils.DataLoaderCreator(
        dataset,
        local_datasets_path
    )

    # Get train and test loaders
    train_loader, test_loader, input_shape, output_shape = dataloader_creator.getLoaders()

    # Create the model and execute it
    executable_model = utils.Diagram(train_loader,test_loader,input_shape,output_shape)
    executable_model.digest_diagram_object(diagram_obj)
    executable_model.create_model_from_inputs()
    executable_model.execute()

@app.get("/")
async def root():
    return {"message": "Hello World"}


class TrainRequest(BaseModel):
    job_id: str
    diagram: str
    callback_url: str
    dataset: str


@app.post("/train")
async def handle_training_task(request: TrainRequest):
    """Endpoint that receives tasks from Cloud Tasks"""
    try:
        # Parse the request body
        job_id = request.job_id
        diagram = request.diagram
        callback_url = request.callback_url
        dataset = request.dataset

        # payload = await request.body()
        # payload = await json.loads(request.body())
        # job_id = payload["job_id"]
        # diagram = payload["diagram"]
        # callback_url = payload["callback_url"]
        # dataset = payload["dataset"]
        
        # Start training in the background
        # Note: In a production environment, you might want to use
        # background tasks or a proper task queue here
        print('about to execute model')
        await execute_model(diagram, dataset, callback_url)
        
        return {"status": "complete", "job_id": job_id}
    
    except Exception as e:
        return {"status": "error", "error": str(e)}, 500
