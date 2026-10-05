from fastapi.testclient import TestClient
from app.tests.api.routes.test_game import create_active_game


def test_websocket_sends_initial_game_state(client: TestClient):
    game_id = create_active_game(client)

    with client.websocket_connect(
        f"/api/v1/games/{game_id}/ws"
    ) as websocket:
        message = websocket.receive_json()

    assert message["type"] == "game_state"
    assert message["game"]["id"] == game_id


def test_websocket_rejects_unknown_game(client: TestClient):
    with client.websocket_connect(
    "/api/v1/games/not-a-real-game/ws"
    ) as websocket:
        message = websocket.receive_json()

    assert message["type"] == "error"
    assert message["detail"] == "Game not found"
    
def test_ws_active_game(client: TestClient):
    game_id = create_active_game(client)
    with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as white_socket:
       
        with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as black_socket:
            white_socket.receive_json()
            black_socket.receive_json()
            response = client.post(
                f"/api/v1/games/{game_id}/moves",
                json={
                    "player_name": "WhitePlayer",
                    "from_square": "e2",
                    "to_square": "e4",
                },
            )
            
            assert response.status_code == 200

            white_update = white_socket.receive_json()
            black_update = black_socket.receive_json()
    # print("white --socket",white_update)
    # print("black --  socket",black_update)
    assert white_update["type"] == "game_state"
    assert black_update["type"] == "game_state"
    assert white_update["game"]["moves"][-1]["san"] == "e4"
    assert black_update["game"]["moves"][-1]["san"] == "e4"        
    
def test_ws_player_resgin(client: TestClient):
    game_id = create_active_game(client)
    with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as white_socket:
       
        with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as black_socket:
            white_socket.receive_json()
            black_socket.receive_json()
            response = client.post(
                f"/api/v1/games/{game_id}/resign",
                json={
                    "player_name": "WhitePlayer",
                },
            )
           
            assert response.status_code == 200

            white_update = white_socket.receive_json()
            black_update = black_socket.receive_json()
    # print("white --socket",white_update)
    # print("black --  socket",black_update)
    for update in (white_update, black_update):
        assert update["type"] == "game_state"
        assert update["game"]["status"] == "completed"
        assert update["game"]["termination"] == "resignation"
        assert update["game"]["result"] == "black_won"
        
        
def test_ws_player_draw_offer(client: TestClient):
    game_id = create_active_game(client)
    with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as white_socket:
       
        with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as black_socket:
            white_socket.receive_json()
            black_socket.receive_json()
            response = client.post(
                f"/api/v1/games/{game_id}/draw-offer",
                json={
                    "player_name": "WhitePlayer",
                },
            )
           
            assert response.status_code == 200

            white_update = white_socket.receive_json()
            black_update = black_socket.receive_json()
    # print("white --socket",white_update)
    # print("black --  socket",black_update)
    for update in (white_update, black_update):
        assert update["type"] == "game_state"
        assert update["game"]["status"] == "active"
        assert update["game"]["draw_offer"] == "white"
        
        
def test_ws_player_draw_offer_response(client: TestClient):
    game_id = create_active_game(client)
    with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as white_socket:
       
        with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as black_socket:
            white_socket.receive_json()
            black_socket.receive_json()
            
            
            response = client.post(
                f"/api/v1/games/{game_id}/draw-offer",
                json={
                    "player_name": "WhitePlayer",
                },
            )
           
            assert response.status_code == 200
            white_socket.receive_json()
            black_socket.receive_json()
            
            
            response = client.post(
                f"/api/v1/games/{game_id}/draw-response",
                json={
                    "player_name": "BlackPlayer",
                    "accept": True
                },
            )
            # print(response.json())
            assert response.status_code == 200

            white_update = white_socket.receive_json()
            black_update = black_socket.receive_json()
    # print("white --socket",white_update)
    # print("black --  socket",black_update)
    for update in (white_update, black_update):
        assert update["type"] == "game_state"
        # assert update["game"]["status"] == "active"
        assert update["game"]["status"] == "completed"
        assert update["game"]["result"] == "draw"
        assert update["game"]["termination"] == "draw_agreement"
        assert update["game"]["draw_offer"] is None
        
def test_ws_game_join(client: TestClient):
    response = client.post("/api/v1/games/")
    assert response.status_code == 200
    game_id = response.json()["id"]
    with client.websocket_connect(f"/api/v1/games/{game_id}/ws") as websocket:
            websocket.receive_json()
            response = client.post(
                f"/api/v1/games/{game_id}/join",
                json={
                    "player_name": "WhitePlayer",
                },
            )
           
            assert response.status_code == 200
            update =  websocket.receive_json()
            assert update["game"]["status"] == "waiting"
            assert len(update["game"]["players"])==1
            assert update["game"]["players"][0]["color"] == "white"
    
            response = client.post(
                f"/api/v1/games/{game_id}/join",
                json={
                    "player_name": "BlackPlayer",
                },
            )
            
            assert response.status_code == 200
            update =  websocket.receive_json()
            assert update["game"]["status"] == "active"
            assert len(update["game"]["players"]) == 2
            assert update["game"]["players"][1]["color"] == "black"
    

     