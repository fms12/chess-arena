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