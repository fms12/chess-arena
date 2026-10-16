from uuid import uuid4
from unittest.mock import patch
import chess.engine
from fastapi.testclient import TestClient

from app.tests.conftest import create_active_game, submit_move


def test_analysis_returns_best_move_evaluation_and_pv(client: TestClient):
    """POST /api/v1/games/{game_id}/analysis returns:
    - best_move
    - evaluation with type ('cp' or 'mate') and numeric value
    - non-empty principal_variation
    """
    game_id = create_active_game(client)
    submit_move(client, game_id, "WhitePlayer", "e2", "e4")

    response = client.post(f"/api/v1/games/{game_id}/analysis")
    assert response.status_code == 200
    data = response.json()

    # best_move verification
    assert "best_move" in data
    assert isinstance(data["best_move"], str)
    assert len(data["best_move"]) >= 4

    # evaluation verification
    assert "evaluation" in data
    assert isinstance(data["evaluation"], dict)
    assert data["evaluation"]["type"] in ("cp", "mate")
    assert isinstance(data["evaluation"]["value"], int)

    # principal_variation verification
    assert "principal_variation" in data
    assert isinstance(data["principal_variation"], list)
    assert len(data["principal_variation"]) > 0
    assert all(isinstance(move, str) for move in data["principal_variation"])


def test_analysis_unknown_game_returns_404(client: TestClient):
    """Unknown game returns 404."""
    unknown_id = uuid4()
    response = client.post(f"/api/v1/games/{unknown_id}/analysis")
    assert response.status_code == 404
    assert response.json()["detail"] == "Game not found"


def test_analysis_does_not_change_fen_or_add_moves(client: TestClient):
    """Analysis does not change the game FEN or add a move."""
    game_id = create_active_game(client)
    submit_move(client, game_id, "WhitePlayer", "e2", "e4")

    # Capture state before analysis
    game_before = client.get(f"/api/v1/games/{game_id}").json()
    fen_before = game_before["fen"]
    moves_before = game_before["moves"]

    # Run analysis
    analysis_res = client.post(f"/api/v1/games/{game_id}/analysis")
    assert analysis_res.status_code == 200

    # Capture state after analysis
    game_after = client.get(f"/api/v1/games/{game_id}").json()
    assert game_after["fen"] == fen_before
    assert game_after["moves"] == moves_before


def test_analysis_stockfish_engine_error_returns_503(client: TestClient):
    """Mock Stockfish startup/engine failure and verify HTTP 503."""
    game_id = create_active_game(client)

    with patch("app.api.v1.analysis.chessEngine", side_effect=chess.engine.EngineError("Mock engine failure")):
        response = client.post(f"/api/v1/games/{game_id}/analysis")
        assert response.status_code == 503
        assert response.json()["detail"] == "Chess analysis service unavailable"


def test_analysis_stockfish_file_not_found_returns_503(client: TestClient):
    """Mock Stockfish executable missing and verify HTTP 503."""
    game_id = create_active_game(client)

    with patch("app.api.v1.analysis.chessEngine", side_effect=FileNotFoundError("Executable not found")):
        response = client.post(f"/api/v1/games/{game_id}/analysis")
        assert response.status_code == 503
        assert response.json()["detail"] == "Chess analysis service unavailable"

