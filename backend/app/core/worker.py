import json
import asyncio  
import redis
from app.core.config import setting
from app.services.engine import chessEngine

r = redis.from_url(setting.REDIS_URL, decode_responses=True)

# Background worker that consumes analysis jobs from Redis inside the same container
async def analysis_worker_loop():
    print("Cloud Analysis Worker started listening on analysis_queue...")
    while True:
        try:
            # Pop job from Upstash Redis (blocks until a job arrives)
            job = await async_client.blpop("analysis_queue", timeout=0)
            if job:
                _, raw_payload = job
                payload = json.loads(raw_payload)
                game_id = payload.get("game_id") or payload.get("gameId")
                game_fen = payload["fen"]
                session_id = payload.get("session_id") or payload.get("sessionId")
                target_channel = f"session:{session_id}" if session_id else f"game:{game_id}"
                
                # Run Stockfish
                best_move_result = chessEngine(game_fen)
                
                final_payload = {
                    "type": "analysis_result",
                    "result": best_move_result
                }
                # Publish back to the player's WebSocket
                await async_client.publish(target_channel, json.dumps(final_payload))
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error in analysis worker: {e}")
            await asyncio.sleep(1)