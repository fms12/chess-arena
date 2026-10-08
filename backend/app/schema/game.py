from pydantic import BaseModel, Field


class CreateGame(BaseModel):
        status=None,
        players=None,
        fen= None,
        moves=None,
        result= None,
        termination= None,
        draw_offer= None,
    