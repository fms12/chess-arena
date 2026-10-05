from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.api.v1.games import games
from app.realtime.manager import manager


router = APIRouter(tags=["WebSocket"])

@router.websocket("/games/{game_id}/ws")
async def game_websocket(websocket: WebSocket, game_id: str):
    if game_id not in games:
        await websocket.accept()
        await websocket.send_json({
            "type": "error",
            "detail": "Game not found",
        })
        await websocket.close(code=1008)
        return
    await manager.connect(game_id, websocket)
    await websocket.send_json({
        "type": "game_state",
        "game": games[game_id],
    })

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(game_id, websocket)