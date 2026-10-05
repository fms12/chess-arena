import chess
from fastapi.testclient import TestClient

def create_active_game(client: TestClient) -> str:
    response = client.post("/api/v1/games/")
    assert response.status_code == 200

    game_id = response.json()["id"]

    response = client.post(
        f"/api/v1/games/{game_id}/join",
        json={"player_name": "WhitePlayer"},
    )
    assert response.status_code == 200

    response = client.post(
        f"/api/v1/games/{game_id}/join",
        json={"player_name": "BlackPlayer"},
    )
    assert response.status_code == 200

    return game_id


def test_create_game(client: TestClient):
    response = client.post("/api/v1/games/")

    assert response.status_code == 200
    game = response.json()
    assert game["status"] == "waiting"
    assert game["players"] == []


def test_players_can_make_moves(client: TestClient):
    game_id = create_active_game(client)

    response = client.post(
        f"/api/v1/games/{game_id}/moves",
        json={
            "player_name": "WhitePlayer",
            "from_square": "e2",
            "to_square": "e4",
        },
    )
    assert response.status_code == 200

    response = client.post(
        f"/api/v1/games/{game_id}/moves",
        json={
            "player_name": "BlackPlayer",
            "from_square": "e7",
            "to_square": "e5",
        },
    )
    assert response.status_code == 200

    game = response.json()
    assert len(game["moves"]) == 2
    assert game["moves"][-1]["san"] == "e5"


def test_rejects_move_when_not_players_turn(client: TestClient):
    gameId = create_active_game(client)

    response = client.post(
        f"/api/v1/games/{gameId}/moves",
        json={
            "player_name": "BlackPlayer",
            "from_square": "e7",
            "to_square": "e5",
        },
    )

    assert response.status_code == 409
    content_moves = response.json()
    assert content_moves["detail"] == "Not your turn"
    
    response = client.get(f"/api/v1/games/{gameId}")
    assert response.status_code == 200

    game = response.json()
    assert game["moves"] == []
    assert game["status"] == "active"
    # assert content_moves["detail"] == "Not your turn"
    

def test_rejects_illegal_move_without_changing_game(client: TestClient):
    gameId = create_active_game(client)
    response = client.post(
        f"/api/v1/games/{gameId}/moves",
        json={
            "player_name": "WhitePlayer",
            "from_square": "e2",
            "to_square": "e5",
        },
    )

    assert response.status_code == 400
    content_moves = response.json()
    assert content_moves["detail"] == "Illegal move"

    response = client.get(f"/api/v1/games/{gameId}")
    assert response.status_code == 200

    game = response.json()
    assert game["moves"] == []
    assert game["status"] == "active"
    assert game["fen"] == chess.STARTING_FEN
    
def test_game_player_full(client: TestClient):
    
    gameId = create_active_game(client)
   
    response = client.post(
        f"/api/v1/games/{gameId}/join",
        json={
            "player_name": "ThirdPlayer",
        },
    )

    assert response.status_code == 409
    content_moves = response.json()
    assert content_moves["detail"] == "Game is full"
    response = client.get(f"/api/v1/games/{gameId}")
    assert response.status_code == 200

    game = response.json()
    assert len(game["players"]) == 2
    assert game["status"] == "active"
    
    
def test_player_resignation(client: TestClient):
   
    gameId = create_active_game(client)
    
    
    response = client.post(
        f"/api/v1/games/{gameId}/resign",
        json={
            "player_name": "WhitePlayer",
        },
    )
    
    assert response.status_code == 200
    game = response.json()
    assert game["status"] == "completed"
    assert game["termination"] == "resignation"
    assert game["result"] == "black_won"
    
    response = client.post(
        f"/api/v1/games/{gameId}/moves",
        json={
            "player_name": "WhitePlayer",
            "from_square": "e2",
            "to_square": "e4",
        },
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "Game is not active"
    
    
    
def test_player_draw_offer(client: TestClient):
   
    gameId = create_active_game(client)
 
    
    response = client.post(
        f"/api/v1/games/{gameId}/draw-offer",
        json={
            "player_name": "WhitePlayer",
        },
    )
    
    assert response.status_code == 200
    game = response.json()
    assert game["draw_offer"] == "white"
    assert game["status"] == "active"
    
    response = client.post(
        f"/api/v1/games/{gameId}/draw-response",
        json={
            "player_name": "BlackPlayer",
            "accept": True,
        },
    )
    assert response.status_code == 200
    game = response.json()
    assert game["status"] == "completed"
    assert game["result"] == "draw"
    assert game["termination"] == "draw_agreement"
    assert game["draw_offer"] is None
    
    


def test_player_draw_offer_rejected(client: TestClient):
   
    gameId = create_active_game(client)

    response = client.post(
        f"/api/v1/games/{gameId}/draw-offer",
        json={
            "player_name": "WhitePlayer",
        },
    )
    
    assert response.status_code == 200
    game = response.json()
    assert game["draw_offer"] == "white"
    assert game["status"] == "active"
    
    response = client.post(
        f"/api/v1/games/{gameId}/draw-response",
        json={
            "player_name": "BlackPlayer",
            "accept": False,
        },
    )
    assert response.status_code == 200
    game = response.json()
    assert game["status"] == "active"
    assert game["result"] is None
    assert game["termination"] is None
    assert game["draw_offer"] is None
    
    response = client.post(
    f"/api/v1/games/{gameId}/moves",
    json={
        "player_name": "WhitePlayer",
        "from_square": "e2",
        "to_square": "e4",
    },
    )

    assert response.status_code == 200
    game = response.json()
    assert len(game["moves"]) == 1
    assert game["moves"][0]["san"] == "e4"
    
    


