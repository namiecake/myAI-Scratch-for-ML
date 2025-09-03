from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
from typing import  List, Literal, Optional, Dict, Union
import logging
from . import playground, database
from .websocket_manager import manager, websocketRouter
from starlette.websockets import WebSocketDisconnect


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Configure FastAPI
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change to specific origins for security)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(playground.router, prefix="/playground")
app.include_router(database.router, prefix="/database")
app.include_router(websocketRouter)

class Update(BaseModel):
    '''
    Update type sent to websocket that can be a training outcome or error
    '''
    message: str
    update_type: Literal["result", "progress", "error"]
    metrics: Optional[Dict[str, float]] = None
    layer: Optional[int] = -1 # layer update pertains to, usually as a result of error/warnings
    job_id: str
    user_id: str

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/updates")
async def handle_updates(update: Update):
    '''
    Receives json object
    '''
    active_connections = manager.get_active_connections()
    logging.info(f"Received update: {update}")
    logging.info(f"Number of active connections: {len(active_connections)}")

    # Get the message data
    msg = update.message
    update_type = update.update_type
    metrics = update.metrics
    job_id = update.job_id

    if not msg:
        return {"error": "No message received"}
    
    cancel_task = False
    # if the user's most recent job is not the current job, cancel the task
    if playground.userJobs[update.user_id] != job_id:
        cancel_task = True

    await manager.send_json(update.user_id, {"message": msg, "update_type": update_type, "metrics": metrics, "stop_training": cancel_task})

    return {"result": msg, "number of connections": len(active_connections), "stop_training": cancel_task}