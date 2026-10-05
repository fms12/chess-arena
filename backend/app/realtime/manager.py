from fastapi import WebSocket



class ConnectionManager:
    def __init__(self):
        self.connections: dict[str, list[WebSocket]] = {}
        
    async def connect(self, game_id: str, websocket: WebSocket):
        await websocket.accept()
        self.connections.setdefault(game_id, []).append(websocket)
        
    
    def disconnect(self, game_id: str, websocket: WebSocket):
        connections = self.connections.get(game_id, [])

        if websocket in connections:
            connections.remove(websocket)

        if not connections:
            self.connections.pop(game_id, None)
    
    async def broadcast(self, game_id: str, message: dict):
        if game_id in self.connections:
            for connection in self.connections[game_id]:
                await connection.send_json(message)



manager = ConnectionManager()