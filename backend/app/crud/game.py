import uuid
from sqlmodel import Session
from app.model import Game,Move



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


def updateGame(session:Session,game:Game):
    session.add(game)
    session.commit()
    session.refresh(game)
    return game


def createMove(session:Session,game:Game,uci:str,san:str,fen:str,move_number:int):
    move_obj = Move(game_id=game.id,uci=uci,san=san,fen=fen,move_number=move_number)
    session.add(move_obj)
    session.commit()
    session.refresh(move_obj)
    return move_obj
     