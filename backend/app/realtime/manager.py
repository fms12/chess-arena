import asyncio
import json
from uuid import UUID

from fastapi import WebSocket, WebSocketDisconnect

from app.core.redis import async_client


class ConnectionManager:
    def __init__(self):
        self.connections: dict[str, list[WebSocket]] = {}
        self.pubsub = async_client.pubsub()
        self.listener_task: asyncio.Task | None = None
        
    async def connect(self, game_id: str | UUID, websocket: WebSocket):
        game_id = str(game_id)
        await websocket.accept()
        channel = f"game:{game_id}"
        self.connections.setdefault(game_id, []).append(websocket)
        await self.pubsub.subscribe(channel)
        if self.listener_task is None or self.listener_task.done():
            self.listener_task = asyncio.create_task(self.listen_game())
        
    async def disconnect(self, game_id: str | UUID, websocket: WebSocket):
        game_id = str(game_id)
        connections = self.connections.get(game_id, [])
        channel = f"game:{game_id}"

        if websocket in connections:
            connections.remove(websocket)

        if not connections:
            self.connections.pop(game_id, None)
            await self.pubsub.unsubscribe(channel)
    
    async def broadcast(self, game_id: str | UUID, message: dict): 
        channel = f"game:{game_id}"
        await async_client.publish(channel, json.dumps(message))
           
    async def listen_game(self):
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                channel = message["channel"]
                game_id = channel.removeprefix("game:")
                for ws in list(self.connections.get(game_id, [])):
                    try:
                        await ws.send_json(data)
                    except (WebSocketDisconnect, RuntimeError, OSError):
                        await self.disconnect(game_id, ws)


manager = ConnectionManager()