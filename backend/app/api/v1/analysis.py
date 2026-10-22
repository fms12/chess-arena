from fastapi import APIRouter,HTTPException,Depends
from app.services.engine import chessEngine
from sqlmodel import Session
from app.core.db import get_session
from app.crud.game import getGameById
from app.schema.game import AnalysisGameRead 
import uuid
import chess

router = APIRouter(tags=["Analysis"])

@router.post("/games/{game_id}/analysis", response_model=AnalysisGameRead )
async def chessGameAnalysis(
    game_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    game = getGameById(session, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    try:
        board = chess.Board(game.fen)
        if not board.is_valid():
            raise ValueError("Invalid chess position")
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=500,
            detail="Stored game FEN is invalid"
        )

    # 503: Stockfish startup or process failure
    try:
        analysisGameData = chessEngine(game.fen)
    except (FileNotFoundError, chess.engine.EngineError):
        raise HTTPException(
            status_code=503,
            detail="Chess analysis service unavailable"
        )

    return analysisGameData


    
    