import json
import redis
from app.core.config import setting
from app.services.engine import chessEngine

r = redis.from_url(setting.REDIS_URL, decode_responses=True)

QUEUE_NAME = "analysis_queue"

print("Worker started. Listening on analysis_queue...")

while True:
    try:
        _, raw_job = r.blpop(QUEUE_NAME)
        raw_payload = json.loads(raw_job)
        game_id = raw_payload.get("game_id") or raw_payload.get("gameId")
        game_fen = raw_payload["fen"]
        session_id = raw_payload.get("session_id") or raw_payload.get("sessionId")
        target_channel = f"session:{session_id}" if session_id else f"game:{game_id}"
        print(f"Processing analysis for game: {game_id}")
        best_move_result = chessEngine(game_fen)
        
        final_payload = {
            "type": "analysis_result",
            "result": best_move_result
        }
        r.publish(target_channel, json.dumps(final_payload))
        print(f"Published analysis result for game: {game_id}")
    except Exception as e:
        print(f"Error processing job: {e}")
    