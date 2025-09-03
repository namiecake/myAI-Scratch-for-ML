import os
from pathlib import Path
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import utils
import logging

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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def execute_model(diagram, dataset, callback_url, job_id, user_id):
    logger.info(f"Executing model with diagram: {diagram} and dataset {dataset}")
    
    # access the dataset path. uncomment and switch out second part for local
    local_datasets_path = Path("/tmp/datasets") # Path(__file__).parent / Path("tmp/datasets")
    
    # download data if needed
    utils.download_dataset(local_datasets_path, dataset)

    dataloader_creator = utils.DataLoaderCreator(
        dataset,
        local_datasets_path,
        diagram.loss_fn
    )

    logger.info(f"Retrieving dataset: {dataset}")

    # Get train and test loaders
    train_loader, test_loader, input_shape, output_shape, task_type = dataloader_creator.getLoaders()
    
    # Create the model and execute it
    executable_model = utils.Diagram(
        train_loader,
        test_loader,
        input_shape,
        output_shape,
        job_id,
        task_type,
        callback_url,
        user_id
    )
    
    executable_model.digest_diagram_object(diagram)
    executable_model.create_model_from_inputs()

    logger.info('Executing model')

    executable_model.execute()

    logger.info(f"Model execution complete for diagram: {diagram}")


@app.get("/")
def root():
    return {"message": "Hello World"}


# async to permit multiple requests
@app.post("/train")
async def handle_training_task(request: utils.JobRequest):
    """Endpoint that receives tasks from Cloud Tasks"""
    try:
        # Parse the request body
        job_id = request.job_id
        user_id = request.user_id
        diagram = request.diagram
        callback_url = request.callback_url
        dataset = request.dataset
        
        # Start training in the background using multiprocessing
        execute_model(diagram, dataset, callback_url, job_id, user_id)
        # future = process_pool.apply_async(execute_model, (diagram,dataset,callback_url, job_id))
        return {"status": "complete", "job_id": job_id, "callback_url": callback_url, "dataset": dataset, "diagram": diagram}, 200
    
    except Exception as e:
        return {"status": "error", "error": e}, 500


if __name__ == '__main__':
    # UNCOMMENT FOR GCP
    local_datasets_path = Path("/tmp/dataset") # Path(__file__).parent / 
    try:
        utils.download_dataset(local_datasets_path)
        logger.info("Successfully downloaded dataset")
    except Exception as e:
        logger.info(f"Failed to download datasets: {e}")