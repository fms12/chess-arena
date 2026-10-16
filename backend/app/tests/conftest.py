from collections.abc import Generator
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, delete

from app.core.config import setting
from app.core.db import get_session
from app.main import app
from app.model import Game, Move


@pytest.fixture(scope="session")
def db_engine():
    """Create the database engine once for the entire test session.

    `scope="session"` means this engine is created ONCE at the start of pytest,
    rather than reconnecting on every single individual test function.
    """
    engine = create_engine(setting.TEST_DATABASE_URL)
    # Test the connection to ensure Docker Postgres is up
    with engine.connect() as conn:
        pass
    # Ensure all tables exist in PostgreSQL
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture(name="session")
def session_fixture(db_engine) -> Generator[Session, None, None]:
    """Provide a clean, isolated database Session for each test function."""
    with Session(db_engine) as session:
        # Clean child table (Move) before parent table (Game) to respect foreign keys
        session.exec(delete(Move))
        session.exec(delete(Game))
        session.commit()

        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session) -> Generator[TestClient, None, None]:
    """Create a TestClient that overrides get_session with the test session."""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


# ==========================================
# Required shared helpers
# ==========================================

def create_normal_game(client: TestClient) -> dict:
    """Create a normal game and return its JSON representation."""
    response = client.post("/api/v1/games/")
    assert response.status_code == 200
    return response.json()


def join_players(
    client: TestClient,
    game_id: str,
    white_player_name: str = "WhitePlayer",
    black_player_name: str = "BlackPlayer",
) -> tuple[dict, dict]:
    """Join White and Black players to the game."""
    res_white = client.post(
        f"/api/v1/games/{game_id}/join",
        json={"player_name": white_player_name},
    )
    assert res_white.status_code == 200
    res_black = client.post(
        f"/api/v1/games/{game_id}/join",
        json={"player_name": black_player_name},
    )
    assert res_black.status_code == 200
    return res_white.json(), res_black.json()


def create_active_game(
    client: TestClient,
    white_player_name: str = "WhitePlayer",
    black_player_name: str = "BlackPlayer",
) -> str:
    """Create a normal game, join White and Black players, and return game_id."""
    game = create_normal_game(client)
    game_id = game["id"]
    join_players(client, game_id, white_player_name, black_player_name)
    return game_id


def create_computer_game(
    client: TestClient,
    player_name: str = "HumanPlayer",
    player_color: str = "white",
    difficulty: str = "easy",
) -> dict:
    """Create a computer opponent game and return its JSON representation."""
    response = client.post(
        "/api/v1/games/computer",
        json={
            "player_name": player_name,
            "player_color": player_color,
            "difficulty": difficulty,
        },
    )
    assert response.status_code == 200
    return response.json()


def submit_move(
    client: TestClient,
    game_id: str,
    player_name: str,
    from_square: str,
    to_square: str,
) -> dict:
    """Submit a legal move and return the updated game JSON representation."""
    response = client.post(
        f"/api/v1/games/{game_id}/moves",
        json={
            "player_name": player_name,
            "from_square": from_square,
            "to_square": to_square,
        },
    )
    assert response.status_code == 200
    return response.json()