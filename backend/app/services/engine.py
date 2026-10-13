from app.core.config import setting
import chess
import chess.engine

stockfish_path = setting.STOCKFISH_PATH
def chessEngine(userFen:str):
    engine = chess.engine.SimpleEngine.popen_uci(stockfish_path)
    try:
        board = chess.Board(userFen)
        info = engine.analyse(board, chess.engine.Limit(time = 0.5))
        pv = info.get("pv", [])
        score = info["score"].pov(chess.WHITE)

        result = {
            "best_move": pv[0].uci() if pv else None,
            "evaluation": (
                {"type": "mate", "value": score.mate()}
                if score.is_mate()
                else {"type": "cp", "value": score.score()}
            ),
            "principal_variation": [move.uci() for move in pv]
        }

        return result
    finally :
        engine.quit()


def botService(botFen:str):
    board = chess.Board(botFen)
    if board.is_game_over():
            return None 
    engine = chess.engine.SimpleEngine.popen_uci(stockfish_path)
    try:
        info = engine.play(board, chess.engine.Limit(time = 0.2))
        chosen_moves = info.move.uci()
        return chosen_moves
    finally :
        engine.quit()


