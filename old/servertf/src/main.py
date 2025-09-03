from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
import base64
import ast
from typing import Any, Optional, Dict, List, Literal
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))
import json

from . import playground

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change to specific origins for security)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(playground.router, prefix="/playground")


# google pubsub sends messages like this
# the message within it is also base64 encoded
class PubSubMessage(BaseModel):
    data: str
    attributes: Optional[Dict[str, str]] = None

class PubSubPushBody(BaseModel):
    message: PubSubMessage
    subscription: str

class Update(BaseModel):
    message: str
    update_type: Literal["result", "progress"]

active_connections: List[WebSocket] = []

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/updates")
async def handle_updates(update: Update):
    '''
    Receives json object
    '''
    # Get the message data
    msg = update.message
    update_type = update.update_type

    if not msg:
        return {"error": "No message received"}
    
    for connection in active_connections:
        try:
            await connection.send_json({"message": msg, "update_type": update_type})
        except:
            active_connections.remove(connection)
    
    return {"result": msg, "number of connections": len(active_connections)}


@app.websocket("/updates-ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        active_connections.remove(websocket)