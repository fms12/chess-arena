from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.main import api_router, ws_router
from app.core.config import setting
from app.core.db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # <--- Automatically creates PostgreSQL tables on cloud startup!
    yield
    
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,# In production, restrict to your frontend domain
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=setting.API_V1_STR)
app.include_router(ws_router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "chess-backend"}