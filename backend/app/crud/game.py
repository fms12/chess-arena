import uuid
from sqlmodel import Session
from app.model import Game



def createGame(session:Session) ->Game:
    
    game_obj = Game()
    session.add(game_obj)
    session.commit()
    session.refresh(game_obj)
    return game_obj 

def getGameById(session:Session,game_id:uuid.UUID) -> Game | None:
    game = session.get(Game,game_id)
    if not game:
        return None
    return game