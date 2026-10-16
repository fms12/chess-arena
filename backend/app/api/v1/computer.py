from fastapi import APIRouter,HTTPException,Depends
from sqlmodel import Session
from app.core.db import get_session
from app.crud.game import createComputerGame, saveMoveGame
from app.schema.game import ComputerGameRequest
from app.schema.game import GameRead
from app.services.engine import botService
import chess

router = APIRouter(tags=["Computer"])



@router.post("/games/computer" ,response_model=GameRead)
def createGame(computerGameRequest: ComputerGameRequest, session: Session = Depends(get_session)):
    if computerGameRequest.player_color not in ["white", "black"]:
        raise HTTPException(status_code=400, detail="Invalid player color. Must be 'white' or 'black'.")
    if computerGameRequest.player_color == "white":
        white_player_name = computerGameRequest.player_name
        black_player_name = None
        bot_color = "black"
    else:
        white_player_name = None
        black_player_name = computerGameRequest.player_name
        bot_color = "white"
        
        
        
    bot_difficulty = computerGameRequest.difficulty
    game = createComputerGame(
        session,
        white_player_name,
        black_player_name,
        bot_color,
        bot_difficulty
        )
    
    board = chess.Board()
    if not game:
        raise HTTPException(status_code=500, detail="Error creating game")
    if bot_color == "white":
        botFen = board.fen()
        chosen_move = botService(botFen,bot_difficulty)
        move = chess.Move.from_uci(chosen_move)
        san = board.san(move)
        board.push(move)
        updatedGame = saveMoveGame(session, game, chosen_move, san, board.fen())
        return updatedGame
    else:
        pass
    return game
    
    
    
    