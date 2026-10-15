from pydantic import BaseModel, Field
from uuid import UUID
import chess


class MoveRead(BaseModel):
        uci: str
        san: str
        fen: str
        move_number: int
        model_config = {"from_attributes": True}

class BotColor(BaseModel):
    color: str|  "white" |"black"

class GameRead(BaseModel):
        id: UUID
        status: str
        fen: str
        result: str | None = None
        termination: str | None = None
        white_player_name: str | None = None
        black_player_name: str | None = None
        moves: list[MoveRead] = Field(default_factory=list)
        model_config = {"from_attributes": True}
        draw_offer: str | None = None
        
        
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
    
    
def serializeGame(game) -> dict:
    return GameRead.model_validate(game).model_dump(mode="json")


def color_to_move(fen: str) -> str:
    board = chess.Board(fen)
    return "white" if board.turn else "black"


class Evaluation(BaseModel):
    type: str | None  = None
    value: int | None = None

#  stockfish game schema
class AnalysisGameRead(BaseModel):
    best_move:str | None = None
    evaluation: Evaluation 
    principal_variation:list[str] = Field(default_factory=list)
    
# Computer/bot game schema
class ComputerGameRequest(BaseModel):
        player_name: str
        player_color: str
        difficulty: str