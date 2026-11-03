import asyncio
import json
from uuid import UUID

from fastapi import WebSocket, WebSocketDisconnect

from app.core.redis import async_client


class ConnectionManager:
    def __init__(self):
        self.connections: dict[str, list[WebSocket]] = {}  # for shared room (game_id -> list of ws)
        self.sessions: dict[str, WebSocket] = {}            # for private user (session_id -> single ws)
        self.pubsub = async_client.pubsub()
        self.listener_task: asyncio.Task | None = None
        
    async def connect(self, game_id: str | UUID, session_id: str, websocket: WebSocket):
        game_id = str(game_id)
        await websocket.accept()
        channel = f"game:{game_id}"
        self.connections.setdefault(game_id, []).append(websocket)
        self.sessions[session_id] = websocket
        await self.pubsub.subscribe(channel, f"session:{session_id}")
        if self.listener_task is None or self.listener_task.done():
            self.listener_task = asyncio.create_task(self.listen_game())
        
    async def disconnect(self, game_id: str | UUID, session_id: str, websocket: WebSocket):
        game_id = str(game_id)
        channel = f"game:{game_id}"
        connections = self.connections.get(game_id, [])
        if websocket in connections:
            connections.remove(websocket)
        if not connections:
            self.sessions.pop(session_id, None)
            await self.pubsub.unsubscribe(channel)
        self.sessions.pop(session_id, None)
        await self.pubsub.unsubscribe(f"session:{session_id}")
    
    async def broadcast(self, game_id: str | UUID, message: dict): 
        channel = f"game:{game_id}"
        await async_client.publish(channel, json.dumps(message))
           
           
    async def listen_game(self):
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                channel = message["channel"]
                if channel.startswith("session:"):
                    target_session = channel.removeprefix("session:")
                    target_ws = self.sessions.get(target_session)
                    if target_ws:
                        try:
                            await target_ws.send_json(data)
                        except (WebSocketDisconnect, RuntimeError, OSError):
                            pass
                elif channel.startswith("game:"):
                    game_id = channel.removeprefix("game:")
                    for ws in list(self.connections.get(game_id, [])):
                        try:
                            await ws.send_json(data)
                        except (WebSocketDisconnect, RuntimeError, OSError):
                            pass


manager = ConnectionManager()