import redis.asyncio as aioredis
# Async client for FastAPI WebSockets
async_client = aioredis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True
)
