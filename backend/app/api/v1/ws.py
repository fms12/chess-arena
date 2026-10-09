from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import uuid 
from sqlmodel import Session

from app.crud.game import getGameById
from app.realtime.manager import manager
from app.core.db import get_session
from app.schema.game import GameRead

router = APIRouter(tags=["WebSocket"])


@router.websocket("/games/{game_id}/ws")
async def game_websocket(
    websocket: WebSocket, 
    game_id: uuid.UUID, 
    session: Session = Depends(get_session)
):
    # 1. Load Game and moves from PostgreSQL via CRUD
    game = getGameById(session, game_id)
    
    if not game:
        await websocket.accept()
        await websocket.send_json({
            "type": "error",
            "detail": "Game not found",
        })
        await websocket.close(code=1008)
        return

    # 2. Convert Game to GameRead JSON-compatible dictionary
    # Assuming `GameRead` is a SQLModel/Pydantic model
    game_read_data = GameRead.model_validate(game).model_dump(mode="json")

    # 3. Connect via the existing manager (which handles adding to broadcasts)
    await manager.connect(game_id, websocket)
    
    # Send initial state using the serialized GameRead model
    await websocket.send_json({
        "type": "game_state",
        "game": game_read_data,
    })

    # 4. Keep ConnectionManager only for broadcasts and lifecycle tracking
    try:
        while True:
            # Keep connection alive, listen for incoming messages if needed
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(game_id, websocket)