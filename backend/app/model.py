import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, TIMESTAMP, text, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


def generate_uuid():
    # Auto-generate a unique UUID for every row.
    return uuid.uuid4()


class Game(SQLModel, table=True):
    __tablename__ = "games"

    id: uuid.UUID = Field(default_factory=generate_uuid, primary_key=True)
    status: str = Field(default="waiting")
    fen: str = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    
    # Relationship pointing to Move.game
    moves: list["Move"] = Relationship(back_populates="game")
    
    result: str | None = None
    termination: str | None = None
    draw_offer: str | None = None
    white_player_name: str | None = None
    black_player_name: str | None = None
    
    created_at: Optional[datetime] = Field(sa_column=Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    ))
    updated_at: Optional[datetime] = Field(sa_column=Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP"),
    ))


class Move(SQLModel, table=True):
    __tablename__ = "moves"
    
    # Required unique constraint for game_id + move_number
    __table_args__ = (
        UniqueConstraint("game_id", "move_number", name="uq_game_move"),
    )

    id: uuid.UUID = Field(default_factory=generate_uuid, primary_key=True)
    game_id: uuid.UUID = Field(foreign_key="games.id")
    
    # Required string and int fields (removed `| None = None`)
    uci: str
    san: str
    fen: str
    move_number: int
    
    created_at: Optional[datetime] = Field(sa_column=Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    ))
    
    # Relationship pointing back to Game.moves
    game: Optional[Game] = Relationship(back_populates="moves")