import { useState } from "react";
import { useGameSocket } from "../hooks/useGameSocket";
import GameRoom from "./GameRoom";
import Lobby from "./Lobby";
import { acceptDrawApi, createGameApi,joinGameApi,offerDrawApi,resignGameApi,submitMoveApi } from "../apis/game";


export function GameController() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");

  const { game, connectionState } = useGameSocket(gameId);

  async function handleCreateGame() {
    const createdGame = await createGameApi();

    await joinGameApi(createdGame.id, playerName);

    setGameId(createdGame.id);
     updateGameUrl(createdGame.id);
  }
  function updateGameUrl(gameId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("gameId", gameId);

    window.history.replaceState({}, "", url);
  }

async function handleJoinGame(roomIdToJoin: string) {
  await joinGameApi(roomIdToJoin, playerName);
  setGameId(roomIdToJoin);
  updateGameUrl(roomIdToJoin);
 
}

async function handleGameMove(fromSquare: string, toSquare: string) {
  if (!gameId) return;
  console.log(fromSquare,toSquare)
  await submitMoveApi(gameId,playerName,fromSquare,toSquare);
}

async function handleResign() {
  if (!gameId) return;
  await resignGameApi(gameId, playerName);
}
async function handleOfferDraw() {
  if (!gameId) return;
  await offerDrawApi(gameId, playerName);
}


async function handleAcceptDraw() {
  if (!gameId) return;
  await acceptDrawApi(gameId, playerName, true);
}

async function handleDeclineDraw() {
  if (!gameId) return;
  await acceptDrawApi(gameId, playerName, false);
}

  return game ? (
    <GameRoom
      game={game}
      playerName={playerName}
      connectionState={connectionState}
      onMove={handleGameMove}
      onResign={handleResign}
      onOfferDraw={handleOfferDraw}
      onAcceptDraw={handleAcceptDraw}
      onDeclineDraw={handleDeclineDraw}
    />
  ) : (
    <Lobby
      gameId={gameId}
      playerName={playerName}
      onPlayerNameChange={setPlayerName}
      onCreateGame={handleCreateGame}
      onJoinGame={handleJoinGame}
    />
  );
}
