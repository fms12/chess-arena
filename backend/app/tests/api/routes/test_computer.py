import uuid
import chess
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.model import Game
from app.tests.conftest import create_computer_game, submit_move


def test_create_computer_game_active_status(client: TestClient):
    """POST /api/v1/games/computer creates an active game."""
    game = create_computer_game(
        client,
        player_name="Alice",
        player_color="white",
        difficulty="easy",
    )
    assert game["status"] == "active"
    assert "id" in game
    assert "players" not in game


def test_computer_game_human_as_white(client: TestClient):
    """Human as White:
    - human name is white;
    - bot is black;
    - no initial bot move occurs.
    - bot configuration appears in response.
    """
    game = create_computer_game(
        client,
        player_name="Alice",
        player_color="white",
        difficulty="easy",
    )
    assert game["white_player_name"] == "Alice"
    assert game["black_player_name"] is None
    assert game["bot_color"] == "black"
    assert game["bot_difficulty"] == "easy"
    assert game["moves"] == []
    assert game["fen"] == chess.STARTING_FEN
    assert "players" not in game


def test_computer_game_human_as_black(client: TestClient):
    """Human as Black:
    - human name is black;
    - bot is white;
    - Stockfish move 1 is persisted.
    - bot configuration appears in response.
    """
    game = create_computer_game(
        client,
        player_name="Bob",
        player_color="black",
        difficulty="medium",
    )
    assert game["black_player_name"] == "Bob"
    assert game["white_player_name"] is None
    assert game["bot_color"] == "white"
    assert game["bot_difficulty"] == "medium"

    # Stockfish move 1 is persisted
    assert len(game["moves"]) == 1
    move1 = game["moves"][0]
    assert move1["move_number"] == 1
    assert isinstance(move1["uci"], str)
    assert isinstance(move1["san"], str)
    assert game["fen"] != chess.STARTING_FEN

    # Verify board turn is Black's turn (human next)
    board = chess.Board(game["fen"])
    assert board.turn == chess.BLACK
    assert "players" not in game


def test_bot_configuration_persisted_in_game_read(client: TestClient):
    """Bot configuration (bot_color, bot_difficulty) appears in GET /games/{id}."""
    game = create_computer_game(
        client,
        player_name="Charlie",
        player_color="white",
        difficulty="hard",
    )
    game_id = game["id"]

    response = client.get(f"/api/v1/games/{game_id}")
    assert response.status_code == 200
    persisted = response.json()
    assert persisted["bot_color"] == "black"
    assert persisted["bot_difficulty"] == "hard"


def test_invalid_player_color_is_rejected(client: TestClient):
    """Invalid player color is rejected with HTTP 422."""
    response = client.post(
        "/api/v1/games/computer",
        json={
            "player_name": "Alice",
            "player_color": "yellow",
            "difficulty": "easy",
        },
    )
    assert response.status_code == 422


def test_invalid_difficulty_is_rejected(client: TestClient):
    """Invalid difficulty is rejected with HTTP 422."""
    response = client.post(
        "/api/v1/games/computer",
        json={
            "player_name": "Alice",
            "player_color": "white",
            "difficulty": "impossible",
        },
    )
    assert response.status_code == 422


def test_human_move_ending_game_does_not_request_bot_reply(client: TestClient, session: Session):
    """When a human move ends the game (e.g. checkmate), no bot move is generated,
    status becomes completed, and HTTP 200 is returned without error.
    """
    game_data = create_computer_game(
        client,
        player_name="WhiteHuman",
        player_color="white",
        difficulty="easy",
    )
    game_id = uuid.UUID(game_data["id"])

    # Set up board with mate in 1 for White: Qxf7# (f3 to f7)
    mate_fen = "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1"
    db_game = session.get(Game, game_id)
    assert db_game is not None
    db_game.fen = mate_fen
    session.add(db_game)
    session.commit()

    # White plays checkmate move f3 -> f7
    response = client.post(
        f"/api/v1/games/{game_id}/moves",
        json={
            "player_name": "WhiteHuman",
            "from_square": "f3",
            "to_square": "f7",
        },
    )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "completed"
    assert res_data["termination"] == "checkmate"
    assert res_data["result"] == "white_won"
    # Exactly 1 move (the checkmate move), no subsequent bot move
    assert len(res_data["moves"]) == 1
    assert res_data["moves"][0]["uci"] == "f3f7"


def test_human_move_triggers_stockfish_reply(client: TestClient):
    """After a human move where the bot is next, the response contains both
    the human move and Stockfish reply.
    """
    game = create_computer_game(
        client,
        player_name="HumanWhite",
        player_color="white",
        difficulty="easy",
    )
    game_id = game["id"]

    # Human plays e2 to e4
    updated_game = submit_move(
        client,
        game_id,
        player_name="HumanWhite",
        from_square="e2",
        to_square="e4",
    )

    # Response must contain both human move (move 1) and Stockfish reply (move 2)
    assert len(updated_game["moves"]) == 2

    human_move = updated_game["moves"][0]
    assert human_move["move_number"] == 1
    assert human_move["uci"] == "e2e4"
    assert human_move["san"] == "e4"

    bot_move = updated_game["moves"][1]
    assert bot_move["move_number"] == 2
    assert isinstance(bot_move["uci"], str)
    assert isinstance(bot_move["san"], str)

    # Verify persisted state via GET
    persisted = client.get(f"/api/v1/games/{game_id}").json()
    assert len(persisted["moves"]) == 2
    assert persisted["moves"][0]["uci"] == "e2e4"
    assert persisted["moves"][1]["uci"] == bot_move["uci"]


def test_human_as_black_move_triggers_subsequent_stockfish_reply(client: TestClient):
    """When human is Black, after human's move 2, bot automatically plays move 3."""
    game = create_computer_game(
        client,
        player_name="HumanBlack",
        player_color="black",
        difficulty="easy",
    )
    game_id = game["id"]
    assert len(game["moves"]) == 1  # Bot move 1

    # Find a legal move for Black
    board = chess.Board(game["fen"])
    legal_move = next(iter(board.legal_moves))
    from_sq = chess.square_name(legal_move.from_square)
    to_sq = chess.square_name(legal_move.to_square)

    updated_game = submit_move(
        client,
        game_id,
        player_name="HumanBlack",
        from_square=from_sq,
        to_square=to_sq,
    )

    # Must contain move 1 (bot), move 2 (human), and move 3 (bot reply)
    assert len(updated_game["moves"]) == 3
    assert updated_game["moves"][1]["move_number"] == 2
    assert updated_game["moves"][2]["move_number"] == 3


def test_frontend_never_submits_move_as_bot(client: TestClient):
    """The frontend never submits a move as the bot; non-human player moves are rejected."""
    game = create_computer_game(
        client,
        player_name="Alice",
        player_color="white",
        difficulty="easy",
    )
    game_id = game["id"]

    # Attempting to move as 'bot', 'black', or any name other than Alice is forbidden
    for bot_pseudonym in ("bot", "Stockfish", "BlackPlayer", "black"):
        response = client.post(
            f"/api/v1/games/{game_id}/moves",
            json={
                "player_name": bot_pseudonym,
                "from_square": "e7",
                "to_square": "e5",
            },
        )
        assert response.status_code == 403
        assert response.json()["detail"] == "You are not a player in this game"

