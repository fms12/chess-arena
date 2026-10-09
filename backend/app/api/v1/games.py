from fastapi import APIRouter,HTTPException,WebSocket, WebSocketDisconnect,Depends
from pydantic import BaseModel
import uuid
import chess
from app.realtime.manager import manager
from app.crud.game import createGame, getGameById, updateGame, createMove
from sqlmodel import Session
from app.core.db import get_session
from app.schema.game import GameRead, MoveRead


router = APIRouter(prefix="/games", tags=["games"])
wsRouter = APIRouter(tags=["WebSocket"])



class JoinGameRequest(BaseModel):
    player_name: str
    
    
class MoveRequest(BaseModel):
    player_name: str
    from_square: str
    to_square: str
    
    
class ResignGameRequest(BaseModel):
    player_name: str
    
    
class DrawOfferRequest(BaseModel):
    player_name: str
    
    
class DrawResponseRequest (BaseModel):
    player_name: str
    accept: bool
    
games ={}
# eg>
#  games ={
    #  1234:{id: 124,stauts,playes:[]}
# }



@router.post("/")
def create_game(session: Session = Depends(get_session)):
    # game_id = str(uuid.uuid4())
    # game = {
    #     "id":game_id,
    #     "status":"waiting",
    #     "players":[],
    #     "fen": chess.STARTING_FEN,
    #     "moves":[],
    #     "result": None,
    #     "termination": None,
    #     "draw_offer": None,
    # }
    # games[game_id] = game
    game = createGame(session)
    return game
    

@router.get("/{game_id}", response_model=GameRead)
def get_game_id(game_id: uuid.UUID, session: Session = Depends(get_session)):
    game = getGameById(session, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game 

@router.post("/{game_id}/join")
async def game_join(game_id:uuid.UUID, join_request: JoinGameRequest,session: Session = Depends(get_session) ):
    game = getGameById(session,game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.black_player_name!= None and game.white_player_name != None:
        raise HTTPException(status_code=409, detail="Game is full")
    if game.white_player_name  == None:
       game.white_player_name = join_request.player_name
    else:
        game.black_player_name = join_request.player_name
        game.status = "active"

    gameData = updateGame(session,game)
    
    # await manager.broadcast(
    #     game_id,{
    #     "type":"game_state",
    #     "game": gameData,
    #     },            
    # )
    
    return gameData

    
    
    
@router.post("/{game_id}/moves" , response_model=GameRead)
async def make_move(game_id:uuid.UUID, move_request: MoveRequest, session: Session = Depends(get_session)):
    game = getGameById(session,game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    # print(gameData)
    if game.status !="active":
        raise HTTPException(status_code=409, detail="Game is not active")
    board = chess.Board(game.fen)
    
    player = None
    if game.white_player_name == move_request.player_name:
        player  = "white"
    elif game.black_player_name == move_request.player_name:
        player = "black"
        
   
    
    if player is None :
        raise HTTPException(
            status_code=403,
            detail="You are not a player in this game",
        )

    current_color = "white" if board.turn else "black"

    if player != current_color:
        raise HTTPException(status_code=409, detail="Not your turn")

    try:
       chess_move = chess.Move.from_uci(
        move_request.from_square + move_request.to_square
        ) 
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid move format",
        ) from None
    if chess_move not in board.legal_moves:
        raise HTTPException(status_code=400, detail="Illegal move")

    uci = chess_move.uci()
    san = board.san(chess_move)
    board.push(chess_move)
    
    if board.is_insufficient_material():
        game.status = "completed"
        game.result = "draw"
        game.termination = "insufficient_material"
    
    
    elif board.is_checkmate():
        game.status = "completed"
        game.termination = "checkmate"
        game.result = f"{player}_won"
    
    elif board.is_stalemate():
        game.status = "completed"
        game.termination = "stalemate"
        game.result = "draw"
        
    game.fen= board.fen()
    gameMove = createMove(session, game, uci, san, board.fen(), len(game.moves)+1)
    gameData = updateGame(session,game)
    return gameData



@router.post("/{game_id}/resign")
async def player_resign(game_id: uuid.UUID, resign_request: ResignGameRequest,session:Session = Depends(get_session)):
    game = getGameById(session,game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.status != "active":
        raise HTTPException(status_code=409, detail="Game is not active")

    
    player = None
    if game.white_player_name == resign_request.player_name:
        player  = "white"
    elif game.black_player_name == resign_request.player_name:
        player = "black"
    if player is None:
        raise HTTPException(
            status_code=403,
            detail="You are not a player in this game",
        )
        
    game.status = "completed"
    game.termination = "resignation"
    game.result =  "white_won" if player == "black" else  "black_won"
    game = updateGame(session, game)
    # await manager.broadcast(
    # game_id,
    # {
    #     "type": "game_state",
    #     "game": gameData,
    # },
    #     )
    return game
    
    
@router.post("/{game_id}/draw-offer")
async def player_draw(game_id: uuid.UUID, draw_req:DrawOfferRequest,session:Session = Depends(get_session)):
    game = getGameById(session,game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.status != "active":
        raise HTTPException(status_code=409, detail="Game is not active")

    
    player = None
    if game.white_player_name == draw_req.player_name:
        player  = "white"
    elif game.black_player_name == draw_req.player_name:
        player = "black"
    if player is None:
        raise HTTPException(
            status_code=403,
            detail="You are not a player in this game",
        )
        
    game.draw_offer = player
    game = updateGame(session, game)
    # await manager.broadcast(
    # game_id,
    # {
    #     "type": "game_state",
    #     "game": gameData,
    # },
    #     )
    
    return  game


@router.post("/{game_id}/draw-response")
async def respond_to_draw_offer(game_id: uuid.UUID, draw_req:DrawResponseRequest, session: Session = Depends(get_session)):
    game = getGameById(session,game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.status != "active":
        raise HTTPException(status_code=409, detail="Game is not active")
    player = None
    if game.white_player_name == draw_req.player_name:
        player  = "white"
    elif game.black_player_name == draw_req.player_name:
        player = "black"
    if player is None:
        raise HTTPException(
            status_code=403,
            detail="You are not a player in this game",
        )
    if game.draw_offer is None:
        raise HTTPException(
            status_code=409,
            detail="No draw offer pending",
        )
    if player == game.draw_offer:
        raise HTTPException(
            status_code=409,
            detail="You cannot respond to your own draw offer",
        )
    if draw_req.accept :
        game.status="completed"
        game.result = "draw"
        game.termination = "draw_agreement"
    
        game.draw_offer = None
    else:
        game.draw_offer = None
    
    game = updateGame(session, game)
        
    # await manager.broadcast(
    # game_id,
    # {
    #     "type": "game_state",
    #     "game": gameData,
    # },
    # )
    return  game

