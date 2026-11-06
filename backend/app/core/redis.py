import redis.asyncio as aioredis
from app.core.config import setting

async_client = aioredis.from_url(
    setting.REDIS_URL,
    decode_responses=True
)