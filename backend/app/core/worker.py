import json
import redis
from app.services.engine import chessEngine

r =  redis.Redis(host="localhost", port=6379, decode_responses=  True)

QUEUE_NAME = "analysis_queue"

print("Worker started. Listening on analysis_queue...")

while True:
    try:
        _, raw_job = r.blpop(QUEUE_NAME)
        raw_payload = json.loads(raw_job)
        game_id = raw_payload.get("game_id") or raw_payload.get("gameId")
        game_fen = raw_payload["fen"]
        
        print(f"Processing analysis for game: {game_id}")
        best_move_result = chessEngine(game_fen)
        
        final_payload = {
            "type": "analysis_result",
            "result": best_move_result
        }
        r.publish(f"game:{game_id}", json.dumps(final_payload))
        print(f"Published analysis result for game: {game_id}")
    except Exception as e:
        print(f"Error processing job: {e}")
    