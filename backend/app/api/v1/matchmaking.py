from fastapi import APIRouter, Depends
from sqlmodel import Session
import json
from app.core.db import get_session
from app.core.redis import async_client
from app.crud.game import createGame, updateGame
from app.schema.game import MatchmakingRequest, serializeGame


router = APIRouter(prefix = "/matchmaking", tags=["Matchmaking"])

@router.post("/join")
async def create_matchmaking_game( req: MatchmakingRequest, session: Session = Depends(get_session)):
    
    QUEUE_KEY  = "matchmaking_queue"
    raw_opponent = await async_client.lpop(QUEUE_KEY)
    if raw_opponent:
        opponent = json.loads(raw_opponent)
        # 2. Opponent found! Create a match in PostgreSQL
        game = createGame(session)
        game.white_player_name = opponent["player_name"]
        game.black_player_name = req.player_name
        game.status = "active"
        game = updateGame(session, game)
        game_data = serializeGame(game)
        
        # 3. Notify the waiting opponent via their private Redis list
        match_payload ={
            "game": game_data,
            "color": "white"
        }
        await async_client.rpush(f"match:{opponent['session_id']}", json.dumps(match_payload))
        return {
            "status": "matched",
            "game": game_data,
            "color": "black"
        }
    else:
         # 5. Nobody is waiting. Push current player into the queue
        my_ticket ={
            "player_name": req.player_name,
            "session_id": req.session_id
        }
        await async_client.rpush(QUEUE_KEY, json.dumps(my_ticket))
        result = await async_client.blpop(f"match:{req.session_id}", timeout=30)
        if result:
            _, match_data = result
            matched = json.loads(match_data)
            return {
                "status": "matched",
                "game": matched["game"],
                "color": matched["color"]
            }
        else:
            # Timed out waiting (remove from queue if still there)
            await async_client.lrem(QUEUE_KEY, 0, json.dumps(my_ticket))
            return {"status": "timeout", "message": "No opponent found. Try again!"}
        
@router.post("/cancel")
async def cancel_matchmaking(req: MatchmakingRequest):
    my_ticket = {
        "player_name": req.player_name,
        "session_id": req.session_id
    }
    await async_client.lrem("matchmaking_queue", 0, json.dumps(my_ticket))
    return {"status": "cancelled"}