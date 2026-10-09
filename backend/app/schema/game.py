from pydantic import BaseModel, Field
from uuid import UUID

class MoveRead(BaseModel):
        uci: str
        san: str
        fen: str
        move_number: int
        model_config = {"from_attributes": True}
        
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