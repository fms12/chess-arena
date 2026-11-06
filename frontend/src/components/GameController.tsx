import { useState } from "react";
import { useGameSocket } from "../hooks/useGameSocket";
import GameRoom from "./GameRoom";
import Lobby from "./Lobby";
import type { BotConfig } from "./GameModeSelection";
import {
  acceptDrawApi,
  createComputerGameApi,
  joinGameApi,
  offerDrawApi,
  resignGameApi,
  submitMoveApi,
  gameAnalysis,
  joinMatchmakingApi,
  cancelMatchmakingApi
} from "../apis/game";

export function GameController() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");

  const { game, setGame, connectionState , analysisData, setAnalysisData, sessionId } = useGameSocket(gameId);

  async function handleCreateGame() {
    const effectivePlayerName =
      playerName.trim() || `Player-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!playerName.trim()) {
      setPlayerName(effectivePlayerName);
    }
    setIsSearching(true);
    try{
      const result = await joinMatchmakingApi(effectivePlayerName, sessionId);
      if(result.status ==="matched"){
        setGame(result.game);
        setGameId(result.game.id);
        // updateGameUrl(result.game.id);
        setPlayerColor(result.color);
        
      }
    } catch (error) {
      console.error("Error joining matchmaking:", error);
    } finally {
      setIsSearching(false);  
    }

    // const createdGame = await createGameApi();
    // const joinedGame = await joinGameApi(createdGame.id, effectivePlayerName);
    // setGame(joinedGame ?? createdGame);
    // setGameId(createdGame.id);
    // updateGameUrl(createdGame.id);
  }

  function updateGameUrl(gameId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("gameId", gameId);
    window.history.replaceState({}, "", url);
  }

  async function handleJoinGame(roomIdToJoin: string) {
    const effectivePlayerName =
      playerName.trim() || `Player-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!playerName.trim()) {
      setPlayerName(effectivePlayerName);
    }
    const joinedGame = await joinGameApi(roomIdToJoin, effectivePlayerName);
    setGame(joinedGame);
    setGameId(roomIdToJoin);
    updateGameUrl(roomIdToJoin);
  }

  async function handleGameMove(fromSquare: string, toSquare: string) {
    if (!gameId) return;
    const updatedGame = await submitMoveApi(gameId, playerName, fromSquare, toSquare);
    if (updatedGame) {
      setGame(updatedGame);
    }
  }

  async function handleResign() {
    if (!gameId) return;
    const updatedGame = await resignGameApi(gameId, playerName);
    if (updatedGame) {
      setGame(updatedGame);
    }
  }

  async function handleOfferDraw() {
    if (!gameId) return;
    const updatedGame = await offerDrawApi(gameId, playerName);
    if (updatedGame) {
      setGame(updatedGame);
    }
  }

  async function handleAcceptDraw() {
    if (!gameId) return;
    const updatedGame = await acceptDrawApi(gameId, playerName, true);
    if (updatedGame) {
      setGame(updatedGame);
    }
  }

  async function handleDeclineDraw() {
    if (!gameId) return;
    const updatedGame = await acceptDrawApi(gameId, playerName, false);
    if (updatedGame) {
      setGame(updatedGame);
    }
  }

  async function handleGameAnalysis() {
    if(!gameId) return
    await  gameAnalysis(gameId, sessionId);
  }

  async function handleCreateComputerGame(config: BotConfig) {
    const resolvedColor: "white" | "black" =
      config.playerColor === "random"
        ? Math.random() < 0.5
          ? "white"
          : "black"
        : config.playerColor;

    const resolvedDifficulty: "easy" | "medium" | "hard" =
      config.difficulty.toLowerCase() === "meduim"
        ? "medium"
        : config.difficulty;

    const effectivePlayerName =
      (config.playerName ?? "").trim() || playerName.trim() || "Player";
    if (!playerName.trim()) {
      setPlayerName(effectivePlayerName);
    }

    const createdGame = await createComputerGameApi(
      effectivePlayerName,
      resolvedColor,
      resolvedDifficulty
    );
    setGame(createdGame);
    setGameId(createdGame.id);
    updateGameUrl(createdGame.id);
    setPlayerColor(resolvedColor);
  }

  async function handleCancelSearch() {
    setIsSearching(false);
    try {
      await cancelMatchmakingApi(playerName, sessionId);
    } catch (error) {
      console.error("Error cancelling matchmaking:", error);
    }
  }



  // Step 1: Before a match starts (game is null), show the Lobby screen
  if (!game) {
    return (
      <Lobby
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
        onCreateGame={handleCreateGame}
        onJoinGame={handleJoinGame}
        onCreateComputerGame={handleCreateComputerGame}
        isSearching={isSearching}
        handleCancelSearch={handleCancelSearch}
      />
      
    );
  }

  // Step 2: After the user clicks "Play" and the match is created, show the GameRoom screen
  return (
    <GameRoom
      game={game}
      playerName={playerName}
      connectionState={connectionState}
      onMove={handleGameMove}
      onResign={handleResign}
      onOfferDraw={handleOfferDraw}
      onAcceptDraw={handleAcceptDraw}
      onDeclineDraw={handleDeclineDraw}
      onGameAnalysis={handleGameAnalysis}
      analysisData={analysisData}
      setAnalysisData={setAnalysisData}
      playerColor={playerColor}
    />
  );
}
