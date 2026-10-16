import uuid
import chess
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.model import Game, Move
from app.tests.conftest import (
    create_normal_game,
    join_players,
    create_active_game,
    submit_move,
)


def test_database_starts_empty(session: Session):
    """Every test starts with empty games and moves tables."""
    games = session.exec(select(Game)).all()
    moves = session.exec(select(Move)).all()
    assert games == []
    assert moves == []


def test_create_game_initial_state(client: TestClient):
    """Create game returns waiting status, starting FEN, no players, no moves."""
    game = create_normal_game(client)

    assert game["status"] == "waiting"
    assert game["fen"] == chess.STARTING_FEN
    assert game["white_player_name"] is None
    assert game["black_player_name"] is None
    assert game["moves"] == []
    assert game["result"] is None
    assert game["termination"] is None
    assert game["draw_offer"] is None
    assert "players" not in game


def test_get_existing_game_returns_persisted_state(client: TestClient):
    """Get existing game returns persisted state."""
    created = create_normal_game(client)
    game_id = created["id"]

    response = client.get(f"/api/v1/games/{game_id}")
    assert response.status_code == 200
    retrieved = response.json()

    assert retrieved["id"] == game_id
    assert retrieved["status"] == "waiting"
    assert retrieved["fen"] == chess.STARTING_FEN
    assert retrieved["white_player_name"] is None
    assert retrieved["black_player_name"] is None
    assert retrieved["moves"] == []
    assert "players" not in retrieved


def test_get_unknown_uuid_returns_404(client: TestClient):
    """Get unknown UUID returns 404."""
    unknown_id = uuid.uuid4()
    response = client.get(f"/api/v1/games/{unknown_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Game not found"


def test_first_join_assigns_white(client: TestClient):
    """First join assigns White."""
    game = create_normal_game(client)
    game_id = game["id"]

    response = client.post(
        f"/api/v1/games/{game_id}/join",
        json={"player_name": "WhitePlayer"},
    )
    assert response.status_code == 200
    joined = response.json()
    assert joined["white_player_name"] == "WhitePlayer"
    assert joined["black_player_name"] is None
    assert joined["status"] == "waiting"


def test_second_join_assigns_black_and_activates_game(client: TestClient):
    """Second join assigns Black and activates game."""
    game = create_normal_game(client)
    game_id = game["id"]

    client.post(
        f"/api/v1/games/{game_id}/join",
        json={"player_name": "WhitePlayer"},
    )
    response = client.post(
        f"/api/v1/games/{game_id}/join",
        json={"player_name": "BlackPlayer"},
    )
    assert response.status_code == 200
    joined = response.json()
    assert joined["white_player_name"] == "WhitePlayer"
    assert joined["black_player_name"] == "BlackPlayer"
    assert joined["status"] == "active"


def test_third_join_returns_409(client: TestClient):
    """Third join returns 409."""
    game_id = create_active_game(client)

    response = client.post(
        f"/api/v1/games/{game_id}/join",
        json={"player_name": "ThirdPlayer"},
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "Game is full"

    # Verify state remains active with original two players
    game = client.get(f"/api/v1/games/{game_id}").json()
    assert game["white_player_name"] == "WhitePlayer"
    assert game["black_player_name"] == "BlackPlayer"
    assert game["status"] == "active"


def test_non_player_move_returns_403(client: TestClient):
    """Non-player move returns 403."""
    game_id = create_active_game(client)

    response = client.post(
        f"/api/v1/games/{game_id}/moves",
        json={
            "player_name": "Spectator",
            "from_square": "e2",
            "to_square": "e4",
        },
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "You are not a player in this game"


def test_wrong_turn_move_returns_409(client: TestClient):
    """Wrong-turn move returns 409."""
    game_id = create_active_game(client)

    response = client.post(
        f"/api/v1/games/{game_id}/moves",
        json={
            "player_name": "BlackPlayer",
            "from_square": "e7",
            "to_square": "e5",
        },
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "Not your turn"

    game = client.get(f"/api/v1/games/{game_id}").json()
    assert game["moves"] == []
    assert game["status"] == "active"


def test_invalid_uci_returns_400(client: TestClient):
    """Invalid UCI returns 400."""
    game_id = create_active_game(client)

    response = client.post(
        f"/api/v1/games/{game_id}/moves",
        json={
            "player_name": "WhitePlayer",
            "from_square": "zz",
            "to_square": "99",
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid move format"


def test_illegal_move_returns_400_and_leaves_state_unchanged(client: TestClient):
    """Illegal move returns 400 and leaves FEN/move history unchanged."""
    game_id = create_active_game(client)

    response = client.post(
        f"/api/v1/games/{game_id}/moves",
        json={
            "player_name": "WhitePlayer",
            "from_square": "e2",
            "to_square": "e5",
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Illegal move"

    game = client.get(f"/api/v1/games/{game_id}").json()
    assert game["moves"] == []
    assert game["status"] == "active"
    assert game["fen"] == chess.STARTING_FEN


def test_legal_moves_persist_uci_san_fen_and_sequential_move_number(client: TestClient):
    """Legal move persists UCI, SAN, FEN, and sequential move_number."""
    game_id = create_active_game(client)

    game_after_m1 = submit_move(
        client,
        game_id,
        player_name="WhitePlayer",
        from_square="e2",
        to_square="e4",
    )
    assert len(game_after_m1["moves"]) == 1
    m1 = game_after_m1["moves"][0]
    assert m1["move_number"] == 1
    assert m1["uci"] == "e2e4"
    assert m1["san"] == "e4"
    assert "fen" in m1

    game_after_m2 = submit_move(
        client,
        game_id,
        player_name="BlackPlayer",
        from_square="e7",
        to_square="e5",
    )
    assert len(game_after_m2["moves"]) == 2
    m2 = game_after_m2["moves"][1]
    assert m2["move_number"] == 2
    assert m2["uci"] == "e7e5"
    assert m2["san"] == "e5"
    assert "fen" in m2

    game_after_m3 = submit_move(
        client,
        game_id,
        player_name="WhitePlayer",
        from_square="g1",
        to_square="f3",
    )
    assert len(game_after_m3["moves"]) == 3
    m3 = game_after_m3["moves"][2]
    assert m3["move_number"] == 3
    assert m3["uci"] == "g1f3"
    assert m3["san"] == "Nf3"


def test_resignation_persists_completed_state_winner_and_termination(client: TestClient):
    """Resignation persists completed state, winner, and termination."""
    game_id = create_active_game(client)

    response = client.post(
        f"/api/v1/games/{game_id}/resign",
        json={"player_name": "WhitePlayer"},
    )
    assert response.status_code == 200
    game = response.json()
    assert game["status"] == "completed"
    assert game["termination"] == "resignation"
    assert game["result"] == "black_won"

    # Attempting move in completed game returns 409
    move_res = client.post(
        f"/api/v1/games/{game_id}/moves",
        json={
            "player_name": "WhitePlayer",
            "from_square": "e2",
            "to_square": "e4",
        },
    )
    assert move_res.status_code == 409
    assert move_res.json()["detail"] == "Game is not active"

    # Test Black resignation in a new game
    game_id_2 = create_active_game(client)
    res_black = client.post(
        f"/api/v1/games/{game_id_2}/resign",
        json={"player_name": "BlackPlayer"},
    )
    assert res_black.status_code == 200
    game2 = res_black.json()
    assert game2["status"] == "completed"
    assert game2["termination"] == "resignation"
    assert game2["result"] == "white_won"


def test_draw_offer_persists(client: TestClient):
    """Draw offer persists."""
    game_id = create_active_game(client)

    response = client.post(
        f"/api/v1/games/{game_id}/draw-offer",
        json={"player_name": "WhitePlayer"},
    )
    assert response.status_code == 200
    game = response.json()
    assert game["draw_offer"] == "white"
    assert game["status"] == "active"

    # Verify persisted via separate GET
    get_res = client.get(f"/api/v1/games/{game_id}")
    assert get_res.status_code == 200
    assert get_res.json()["draw_offer"] == "white"


def test_accepting_draw_completes_game(client: TestClient):
    """Accepting draw completes game."""
    game_id = create_active_game(client)

    client.post(
        f"/api/v1/games/{game_id}/draw-offer",
        json={"player_name": "WhitePlayer"},
    )

    response = client.post(
        f"/api/v1/games/{game_id}/draw-response",
        json={"player_name": "BlackPlayer", "accept": True},
    )
    assert response.status_code == 200
    game = response.json()
    assert game["status"] == "completed"
    assert game["result"] == "draw"
    assert game["termination"] == "draw_agreement"
    assert game["draw_offer"] is None


def test_rejecting_draw_clears_offer_and_leaves_game_active(client: TestClient):
    """Rejecting draw clears the offer and leaves game active."""
    game_id = create_active_game(client)

    client.post(
        f"/api/v1/games/{game_id}/draw-offer",
        json={"player_name": "WhitePlayer"},
    )

    response = client.post(
        f"/api/v1/games/{game_id}/draw-response",
        json={"player_name": "BlackPlayer", "accept": False},
    )
    assert response.status_code == 200
    game = response.json()
    assert game["status"] == "active"
    assert game["result"] is None
    assert game["termination"] is None
    assert game["draw_offer"] is None

    # Game continues and players can move
    move_res = submit_move(
        client,
        game_id,
        player_name="WhitePlayer",
        from_square="e2",
        to_square="e4",
    )
    assert len(move_res["moves"]) == 1
    assert move_res["moves"][0]["san"] == "e4"


def test_persistence_game_and_moves_retrievable_through_new_request(client: TestClient):
    """A game created through HTTP remains retrievable through a new request.
    Moves remain in history after fetching the game again.
    Move history uses move_number, uci, san, and fen.
    """
    game_id = create_active_game(client)

    submit_move(client, game_id, player_name="WhitePlayer", from_square="e2", to_square="e4")
    submit_move(client, game_id, player_name="BlackPlayer", from_square="c7", to_square="c5")

    # Fetch game via a brand new request
    response = client.get(f"/api/v1/games/{game_id}")
    assert response.status_code == 200
    persisted = response.json()

    assert persisted["id"] == game_id
    assert persisted["status"] == "active"
    assert persisted["white_player_name"] == "WhitePlayer"
    assert persisted["black_player_name"] == "BlackPlayer"
    assert len(persisted["moves"]) == 2

    m1 = persisted["moves"][0]
    assert m1["move_number"] == 1
    assert m1["uci"] == "e2e4"
    assert m1["san"] == "e4"
    assert isinstance(m1["fen"], str) and len(m1["fen"]) > 0

    m2 = persisted["moves"][1]
    assert m2["move_number"] == 2
    assert m2["uci"] == "c7c5"
    assert m2["san"] == "c5"
    assert isinstance(m2["fen"], str) and len(m2["fen"]) > 0

    # Ensure no legacy in-memory 'players' field
    assert "players" not in persisted

    m2 = persisted["moves"][1]
    assert m2["move_number"] == 2
    assert m2["uci"] == "c7c5"
    assert m2["san"] == "c5"
    assert isinstance(m2["fen"], str) and len(m2["fen"]) > 0

    # Ensure no legacy in-memory 'players' field
    assert "players" not in persisted

