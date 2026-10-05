# Chess Game Frontend Architecture & Learning Guide

This guide maps out the backend contract and explains how to wire your learning-critical logic to the presentational UI components.

---

## 1. Backend Contract Reference

### REST Endpoints (`http://localhost:8000/api/v1/games`)

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/games/` | *(None)* | Creates a new game room. Returns initial `game` object. |
| `GET` | `/api/v1/games/{game_id}` | *(None)* | Retrieves current state of the game. |
| `POST` | `/api/v1/games/{game_id}/join` | `{"player_name": string}` | Joins the room (1st player is White, 2nd is Black). |
| `POST` | `/api/v1/games/{game_id}/moves` | `{"player_name": string, "from_square": string, "to_square": string}` | Submits a move (e.g. `e2` to `e4`). |
| `POST` | `/api/v1/games/{game_id}/resign` | `{"player_name": string}` | Resigns the match for the specified player. |
| `POST` | `/api/v1/games/{game_id}/draw-offer` | `{"player_name": string}` | Initiates a draw offer. |
| `POST` | `/api/v1/games/{game_id}/draw-response` | `{"player_name": string, "accept": boolean}` | Accepts or declines a pending draw offer. |

---

### WebSocket Endpoint

```
ws://localhost:8000/api/v1/games/{game_id}/ws
```

#### Incoming Server Messages:
1. **Game State Update** (broadcast upon join, moves, resign, draw events):
   ```json
   {
     "type": "game_state",
     "game": {
       "id": "uuid",
       "status": "waiting" | "active" | "completed",
       "players": [
         { "name": "Player1", "color": "white" },
         { "name": "Player2", "color": "black" }
       ],
       "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
       "moves": [
         { "number": 1, "uci": "e2e4", "san": "e4", "fen": "..." }
       ],
       "result": null | "white_won" | "black_won" | "draw",
       "termination": null | "checkmate" | "stalemate" | "insufficient_material" | "resignation" | "draw_agreement",
       "draw_offer": null | "white" | "black"
     }
   }
   ```

2. **Error Message**:
   ```json
   {
     "type": "error",
     "detail": "Game not found"
   }
   ```

---

## 2. UI Component Architecture

All UI components are 100% presentational and live in `src/components/`:

- [**`Navbar.tsx`**](file:///src/components/Navbar.tsx): Header brand, connection status badge (`live`, `connecting`, `offline`), Room ID 1-click copy, and Lobby modal launcher.
- [**`PlayerCard.tsx`**](file:///src/components/PlayerCard.tsx): Displays player avatars, name, active turn glow, digital chess clock, and captured pieces rack.
- [**`ChessboardView.tsx`**](file:///src/components/ChessboardView.tsx): High-fidelity board using `react-chessboard` (v5 options API), turn coordinates, last-move yellow highlights, check warning banner, and waiting overlay.
- [**`MoveHistory.tsx`**](file:///src/components/MoveHistory.tsx): SAN move notation table (White / Black plies) with navigation controls (⏮, ◀, ▶, ⏭).
- [**`GameControls.tsx`**](file:///src/components/GameControls.tsx): Resign button (with confirmation toggle), Offer Draw, Flip Perspective, and Invite Link copy.
- [**`DrawOfferBanner.tsx`**](file:///src/components/DrawOfferBanner.tsx): Notice banner showing when an opponent has offered a draw, with "Accept" & "Decline".
- [**`GameOverModal.tsx`**](file:///src/components/GameOverModal.tsx): Victory & draw announcement dialog with termination reason and "New Game" button.
- [**`LobbyModal.tsx`**](file:///src/components/LobbyModal.tsx): Tabs to generate new room or join existing room code with player name.

---

## 3. Checklist for Wiring Your Logic

### A. Implementing `useGameSocket` (`src/hooks/useGameSocket.ts`)
- Use `useRef` to hold the `WebSocket` instance.
- In `useEffect`:
  1. Guard against empty `gameId`.
  2. Instantiate `new WebSocket(url)`.
  3. Wire `ws.onopen` -> update connection status to `'connected'`.
  4. Wire `ws.onmessage` -> parse `JSON.parse(event.data)`, check `data.type === 'game_state'`, invoke callback.
  5. Wire `ws.onerror` and `ws.onclose` -> set status to `'disconnected'` or trigger reconnect attempt.
  6. **Cleanup**: return a function from `useEffect` that calls `ws.close()`.

### B. State Orchestration in `App.tsx`
- Replace demo `game` state with state synchronized from:
  1. Initial REST fetch (`GET /api/v1/games/{id}`)
  2. Real-time updates delivered by `useGameSocket`
- Wire `handlePieceDrop(sourceSquare, targetSquare)` to `POST /api/v1/games/{id}/moves`.
- Wire `handleResign()` to `POST /api/v1/games/{id}/resign`.
- Wire `handleOfferDraw()` to `POST /api/v1/games/{id}/draw-offer`.
- Wire `handleAcceptDraw()` & `handleDeclineDraw()` to `POST /api/v1/games/{id}/draw-response`.

