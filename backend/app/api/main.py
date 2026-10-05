from fastapi import APIRouter
from app.api.v1.games import router as games_router
from app.api.v1.ws import router as ws_router

api_router = APIRouter()

api_router.include_router(games_router)
api_router.include_router(ws_router)