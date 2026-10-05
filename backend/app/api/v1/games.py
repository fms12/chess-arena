from fastapi import APIRouter,HTTPException,WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import uuid
import chess
from app.realtime.manager import manager

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
def create_game():
    game_id = str(uuid.uuid4())
    game = {
        "id":game_id,
        "status":"waiting",
        "players":[],
        "fen": chess.STARTING_FEN,
        "moves":[],
        "result": None,
        "termination": None,
        "draw_offer": None,
    }
    games[game_id] = game
    return game

@router.get("/{game_id}")
def get_game_id(game_id: str):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    return games[game_id]

@router.post("/{game_id}/join")
async def game_join(game_id:str, join_request: JoinGameRequest):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    game = games[game_id]
    if len(game["players"]) >= 2:
        raise HTTPException(status_code=409, detail="Game is full")
    color = "white" if len(game["players"]) == 0 else "black"
    player = {"name":join_request.player_name,"color":color}
    game["players"].append(player)
    # print(game)
    if len(game["players"]) == 2:
        game["status"] = "active"
    await manager.broadcast(
    game_id,
    {
        "type": "game_state",
        "game": game,
    },  
    )
    return game

    
    
    
@router.post("/{game_id}/moves")
async def make_move(game_id:str, move_request: MoveRequest):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    gameData= games[game_id]
    # print(gameData)
    if gameData["status"] !="active":
        raise HTTPException(status_code=409, detail="Game is not active")
    board = chess.Board(gameData["fen"])
    
    player = next(
        (
            player
            for player in gameData["players"]
            if player["name"] == move_request.player_name
        ),
        None,
    )
   
    
    if player is None:
        raise HTTPException(
            status_code=403,
            detail="You are not a player in this game",
        )

    current_color = "white" if board.turn else "black"

    if player["color"] != current_color:
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
        gameData["status"] = "completed"
        gameData["result"] = "draw"
        gameData["termination"] = "insufficient_material"
    
    
    elif board.is_checkmate():
        gameData["status"] = "completed"
        gameData["termination"] = "checkmate"
        gameData["result"] = f"{player['color']}_won"
    
    elif board.is_stalemate():
        gameData["status"] = "completed"
        gameData["termination"] = "stalemate"
        gameData["result"] = "draw"
        
    gameData["fen"] = board.fen()
    
    movesData = {
        "number":len(gameData["moves"])+1,
        "uci": uci,
        "san":san,
        "fen": board.fen()
    }
    gameData["moves"].append(movesData)
    
    await manager.broadcast(
        game_id,{
        "type":"game_state",
        "game": gameData,
        },            
    )
    return gameData



@router.post("/{game_id}/resign")
async def player_resign(game_id: str, resign_request: ResignGameRequest):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    gameData= games[game_id]
    if gameData["status"] !="active":
        raise HTTPException(status_code=409, detail="Game is not active")
    
    player = next(
        
       ( player
        for player in gameData["players"]
        if player["name"] == resign_request.player_name),
        None,
    )
    if player is None:
        raise HTTPException(
            status_code=403,
            detail="You are not a player in this game",
        )
        
    gameData["status"] = "completed"
    gameData["termination"] = "resignation"
    gameData["result"] =  "white_won" if player["color"] == "black" else  "black_won"
    
    # if player["color"] == "white":
    #     gameData["result"] = "black_won"
    # else:
    #     gameData["result"] = "white_won"
    
    await manager.broadcast(
    game_id,
    {
        "type": "game_state",
        "game": gameData,
    },
        )
    return gameData
    
    
@router.post("/{game_id}/draw-offer")
async def player_draw(game_id: str, draw_req:DrawOfferRequest):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    gameData= games[game_id]
    if gameData["status"] !="active":
        raise HTTPException(status_code=409, detail="Game is not active")
    
    player = next(
        
       ( player
        for player in gameData["players"]
        if player["name"] == draw_req.player_name),
        None,
    )
    if player is None:
        raise HTTPException(
            status_code=403,
            detail="You are not a player in this game",
        )
        
    gameData["draw_offer"] = player["color"]
    
    await manager.broadcast(
    game_id,
    {
        "type": "game_state",
        "game": gameData,
    },
        )
    
    return  gameData


@router.post("/{game_id}/draw-response")
async def respond_to_draw_offer(game_id: str, draw_req:DrawResponseRequest):
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    gameData= games[game_id]
    if gameData["status"] !="active":
        raise HTTPException(status_code=409, detail="Game is not active")
    
    player = next(
        
       ( player
        for player in gameData["players"]
        if player["name"] == draw_req.player_name),
        None,
    )
    if player is None:
        raise HTTPException(
            status_code=403,
            detail="You are not a player in this game",
        )
    if gameData["draw_offer"] is None:
        raise HTTPException(
            status_code=409,
            detail="No draw offer pending",
        )
    if player["color"] == gameData["draw_offer"]:
        raise HTTPException(
            status_code=409,
            detail="You cannot respond to your own draw offer",
        )
    if draw_req.accept :
        gameData["status"] ="completed"
        gameData["result"] = "draw"
        gameData["termination"] = "draw_agreement"
    
        gameData["draw_offer"] = None
    else:
        gameData["draw_offer"] = None
        
        
    await manager.broadcast(
    game_id,
    {
        "type": "game_state",
        "game": gameData,
    },
    )
    return  gameData

