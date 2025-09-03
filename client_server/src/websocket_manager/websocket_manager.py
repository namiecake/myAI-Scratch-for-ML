from fastapi import APIRouter, WebSocket
from typing import  Dict
from starlette.websockets import WebSocketDisconnect
import logging
import asyncio

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

websocketRouter = APIRouter()

class WebSocketManager:
    def __init__(self):
        self._connections: Dict[str, WebSocket] = {}
        self._lock = asyncio.Lock()
        self.logger = logging.getLogger(__name__)

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            self._connections[client_id] = websocket
        self.logger.info(f"Client {client_id} connected")

    async def disconnect(self, client_id: str):
        async with self._lock:
            if client_id in self._connections:
                del self._connections[client_id]
        self.logger.info(f"Client {client_id} disconnected")

    async def send_json(self, client_id: str, message: dict):
        if client_id in self._connections:
            try:
                await self._connections[client_id].send_json(message)
                return True
            except Exception as e:
                self.logger.error(f"Error sending to client {client_id}: {str(e)}")
                await self.disconnect(client_id)
        return False

    def get_active_connections(self) -> Dict[str, WebSocket]:
        return dict(self._connections)

manager = WebSocketManager()

@websocketRouter.websocket("/updates-ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)
    
    try:
        await manager.send_json(client_id, {
            "status": "connected", 
            "client_id": client_id
        })
        
        while True:
            try:
                data = await websocket.receive_text()
                await manager.send_json(client_id, {"status": "received"})
            except WebSocketDisconnect:
                break
    except Exception as e:
        manager.logger.error(f"Error with client {client_id}: {str(e)}")
    finally:
        await manager.disconnect(client_id)