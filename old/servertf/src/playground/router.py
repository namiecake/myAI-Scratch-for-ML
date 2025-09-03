from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List, Literal
from google.cloud import tasks_v2
import json
import os

client = tasks_v2.CloudTasksClient()
project = "cs194-449021"
project_number = "590321385188" # Associated with project, it's not publically exposed
location = "us-west1"
queue = "test-queue-asjdjkasdjaaspsb" # vertex-ai-queue by default
# construct queue name
parent = client.queue_path(project, location, queue)

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

# Initialize the FastAPI router
router = APIRouter()

@router.post("/process-diagram/")
def process_diagram(data: DiagramRequest):
    """
    Endpoint to process the pipeline diagram.
    Receives the blocks, execution type, and dataset and returns confirmation.
    """

    # PUT JOB PROCESSOR ENDPOINT HERE
    processor_endpoint_url = "https://job-processor-cloud-run-590321385188.us-west1.run.app" # "https://dummy.com"
    job_processor_endpoint = f"{processor_endpoint_url}/execute_task"

    # send info back here
    service_name = os.environ.get('K_SERVICE')

    # Construct the URL
    cloud_run_url = f"https://{service_name}-{project_number}.{location}.run.app"

    # encode the payload as bytes and send it as a job
    payload_dict = data.dict()
    payload_dict["callback_url"] = f"{cloud_run_url}/updates"
    task_payload = json.dumps(payload_dict).encode()

    task = {
        "http_request": {  # Replace with "http_request" if using Cloud Run
            "http_method": tasks_v2.HttpMethod.POST,
            "url": job_processor_endpoint,
            "body": task_payload,
        }
    }
    response = client.create_task(parent=parent, task=task)
    # no logging on response yet
    return {
        "message": "Diagram received",
        "data": data,
    }

