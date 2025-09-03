from fastapi import APIRouter
from google.cloud import tasks_v2
import json
import os
import time
from src.utils import DiagramRequest, WarningData, JobCancelRequest
import re
import requests
import logging
from ..websocket_manager import manager
import asyncio
from collections import defaultdict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

project = "cs194-449021"
project_number = "590321385188" # Associated with project, it's not publically exposed
location = "us-west1"
queue = "myapi-training-queue" 
TRAINING_SERVICE_URL = "https://training-server-590321385188.us-west1.run.app/train"

task_client = tasks_v2.CloudTasksClient()
queue_path = task_client.queue_path(project, location, queue)

# Initialize the FastAPI router
router = APIRouter()
# User jobs dictionary, lists user and their most recent job
userJobs = defaultdict(str) # user_id -> job_id

@router.post("/process-diagram/")
async def process_diagram(data: DiagramRequest):
    """
    Endpoint to process the pipeline diagram.
    Receives the blocks, execution type, and dataset and returns confirmation.
    """

    # Construct the URL for the REST API server
    service_name = os.environ.get('K_SERVICE')
    cloud_run_url = f"https://{service_name}-{project_number}.{location}.run.app"

    # Generate a unique job ID
    # job_id = f"training_job_{int(time.time())}"

    await handle_design_warnings(data.blocks, data.job_id, data.loss_fn)

    if data.user_id:
        userJobs[data.user_id] = data.job_id

    # encode the payload as bytes and send it as a job
    payload_dict = {
        "diagram": data.dict(),
        "callback_url": f"{cloud_run_url}/updates",
        "job_id": data.job_id,
        "user_id": data.user_id,
        "dataset": data.dataset,
    }
    task_payload = json.dumps(payload_dict).encode()

    # UNCOMMENT FOR GCP
    task = {
        "http_request": { 
            "http_method": tasks_v2.HttpMethod.POST,
            "url": TRAINING_SERVICE_URL,
            "body": task_payload,
        }
    }
    response = task_client.create_task(parent=queue_path, task=task)

    # sent post request to training server


    # no logging on response yet
    return {
        "message": "Diagram received",
        "job_id": data.job_id,
        "user_id": data.user_id,
        "data": data,
    }

@router.post("/cancel-job/")
async def cancel_job(req: JobCancelRequest):
    """
    Cancels the most recent job for a user.
    """
    userJobs[req.user_id] = ""
    return {
        "message": "Job cancelled",
        "user_id": req.user_id
    }

async def handle_design_warnings(blocks, job_id, loss_fn):
    '''
    Sends warnings. Does not interrupt flow of execution
    ''' 

    blocks = sorted(blocks, key=lambda x: x.order)
    update_data = WarningData(job_id=job_id).model_dump()

    def upgrade_to_warning(message, layer):
        """
        In-place update to the update_data object
        """
        update_data["update_type"] = "warning"
        update_data["message"] = message
        update_data["layer"] = layer

    n_layers = len(blocks)
    if n_layers == 0:
        update_data["message"] = "No layers added for model!"
        await manager.send_json(job_id, update_data)
        logging.info(update_data["message"])
        return

    previous_linear_layer = -2
    previous_activation_layer = -2
    previous_dropout_layer = -2
    for i in range(len(blocks)):
        name = blocks[i].block_id
        if name == "linear_layer":
            if previous_linear_layer == i-1:
                upgrade_to_warning(
                    f"Two linear layers in a row starting at layer: {previous_linear_layer+1}",
                    previous_linear_layer+1
                )
                break
            previous_linear_layer = i
        
        if name == "dropout_layer":
            previous_dropout_layer = i
        
        if name == "softmax_activation":
            if i != n_layers-1:
                upgrade_to_warning(
                    f"Softmax function in the middle of the network at layer: {i+1}",
                    i+1
                )
                break

        if re.compile(".*_activation").match(name):
            if previous_activation_layer == i-1:
                upgrade_to_warning(
                    f"Two activation layers in a row starting at layer: {previous_activation_layer+1}",
                    previous_activation_layer+1
                )
                break
            previous_activation_layer = i

    if loss_fn == 'hinge_loss' and (blocks[-1].block_id not in['linear_layer', 'tanh_activation']):
        upgrade_to_warning(
            "Hinge loss used, model predictions should be in range -1,1. Use tanh activation or a linear layer as the last layer to achieve this",
            n_layers
        )

    if previous_dropout_layer > previous_linear_layer:
        upgrade_to_warning(
            f"Dropout at layer {previous_dropout_layer+1} should be followed by a layer with learnable parameters, i.e. a linear layer",
            previous_dropout_layer+1
        )

    await manager.send_json(job_id, update_data)
    logging.info(update_data["message"])