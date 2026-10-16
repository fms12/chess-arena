from uuid import uuid4
import chess
import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.tests.conftest import (
    create_normal_game,
    create_active_game,
    submit_move,
)


def test_websocket_sends_initial_game_state(client: TestClient):
    """Valid game socket receives initial game_state without players array."""
    game_id = create_active_game(client)
    with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as websocket:
        message = websocket.receive_json()

    assert message["type"] == "game_state"
    assert message["game"]["id"] == game_id
    assert message["game"]["status"] == "active"
    assert "players" not in message["game"]


def test_websocket_rejects_unknown_game(client: TestClient):
    """Unknown but valid UUID receives 'Game not found' and closes with 1008."""
    unknown_game_id = uuid4()
    with client.websocket_connect(f"/api/v1/games/{unknown_game_id}/ws") as websocket:
        message = websocket.receive_json()
        assert message["type"] == "error"
        assert message["detail"] == "Game not found"

        with pytest.raises(WebSocketDisconnect) as exc_info:
            websocket.receive_text()
        assert exc_info.value.code == 1008


def test_ws_broadcast_player_join(client: TestClient):
    """Joining a player broadcasts persisted white_player_name or black_player_name."""
    game = create_normal_game(client)
    game_id = game["id"]

    with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as websocket:
        initial = websocket.receive_json()
        assert initial["type"] == "game_state"
        assert initial["game"]["white_player_name"] is None
        assert initial["game"]["black_player_name"] is None
        assert "players" not in initial["game"]

        # Join White
        response = client.post(
            f"/api/v1/games/{game_id}/join",
            json={"player_name": "WhitePlayer"},
        )
        assert response.status_code == 200
        update1 = websocket.receive_json()
        assert update1["type"] == "game_state"
        assert update1["game"]["white_player_name"] == "WhitePlayer"
        assert update1["game"]["black_player_name"] is None
        assert update1["game"]["status"] == "waiting"
        assert "players" not in update1["game"]

        # Join Black
        response2 = client.post(
            f"/api/v1/games/{game_id}/join",
            json={"player_name": "BlackPlayer"},
        )
        assert response2.status_code == 200
        update2 = websocket.receive_json()
        assert update2["type"] == "game_state"
        assert update2["game"]["white_player_name"] == "WhitePlayer"
        assert update2["game"]["black_player_name"] == "BlackPlayer"
        assert update2["game"]["status"] == "active"
        assert "players" not in update2["game"]


def test_ws_broadcast_legal_move(client: TestClient):
    """A legal move broadcasts the updated FEN and move history."""
    game_id = create_active_game(client)
    with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as white_socket:
        with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as black_socket:
            white_socket.receive_json()
            black_socket.receive_json()

            submit_move(client, game_id, "WhitePlayer", "e2", "e4")

            white_update = white_socket.receive_json()
            black_update = black_socket.receive_json()

    for update in (white_update, black_update):
        assert update["type"] == "game_state"
        assert update["game"]["fen"] != chess.STARTING_FEN
        assert len(update["game"]["moves"]) == 1
        last_move = update["game"]["moves"][-1]
        assert last_move["san"] == "e4"
        assert last_move["uci"] == "e2e4"
        assert last_move["move_number"] == 1
        assert "players" not in update["game"]


def test_ws_player_resignation_broadcast(client: TestClient):
    """Resignation broadcasts completed state, winner, and termination."""
    game_id = create_active_game(client)
    with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as white_socket:
        with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as black_socket:
            white_socket.receive_json()
            black_socket.receive_json()

            response = client.post(
                f"/api/v1/games/{game_id}/resign",
                json={"player_name": "WhitePlayer"},
            )
            assert response.status_code == 200

            white_update = white_socket.receive_json()
            black_update = black_socket.receive_json()

    for update in (white_update, black_update):
        assert update["type"] == "game_state"
        assert update["game"]["status"] == "completed"
        assert update["game"]["termination"] == "resignation"
        assert update["game"]["result"] == "black_won"
        assert "players" not in update["game"]


def test_ws_player_draw_offer_broadcast(client: TestClient):
    """Draw offer broadcasts updated draw_offer field."""
    game_id = create_active_game(client)
    with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as white_socket:
        with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as black_socket:
            white_socket.receive_json()
            black_socket.receive_json()

            response = client.post(
                f"/api/v1/games/{game_id}/draw-offer",
                json={"player_name": "WhitePlayer"},
            )
            assert response.status_code == 200

            white_update = white_socket.receive_json()
            black_update = black_socket.receive_json()

    for update in (white_update, black_update):
        assert update["type"] == "game_state"
        assert update["game"]["status"] == "active"
        assert update["game"]["draw_offer"] == "white"
        assert "players" not in update["game"]


def test_ws_player_draw_acceptance_broadcast(client: TestClient):
    """Accepting draw offer broadcasts completed draw state."""
    game_id = create_active_game(client)
    with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as white_socket:
        with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as black_socket:
            white_socket.receive_json()
            black_socket.receive_json()

            # Offer draw
            client.post(
                f"/api/v1/games/{game_id}/draw-offer",
                json={"player_name": "WhitePlayer"},
            )
            white_socket.receive_json()
            black_socket.receive_json()

            # Accept draw
            response = client.post(
                f"/api/v1/games/{game_id}/draw-response",
                json={"player_name": "BlackPlayer", "accept": True},
            )
            assert response.status_code == 200

            white_update = white_socket.receive_json()
            black_update = black_socket.receive_json()

    for update in (white_update, black_update):
        assert update["type"] == "game_state"
        assert update["game"]["status"] == "completed"
        assert update["game"]["result"] == "draw"
        assert update["game"]["termination"] == "draw_agreement"
        assert update["game"]["draw_offer"] is None
        assert "players" not in update["game"]