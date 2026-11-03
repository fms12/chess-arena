import { useState, useEffect } from "react";
import type { Game,GameAnalysis } from "../types/game";


const apiUrl = import.meta.env.VITE_WS_BASE_URL;

export function useGameSocket(gameId: string | null) {
  const [connectionState, setConnectionState] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");

   function getSessionId(): string {
     let id = sessionStorage.getItem("chess_session_id");
     if (!id) {
       id = crypto.randomUUID();
       sessionStorage.setItem("chess_session_id", id);
     }
     return id;
   }
  const [analysisData, setAnalysisData] = useState<GameAnalysis | null>(null);
  const [sessionId] = useState<string>(() => getSessionId());
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!gameId) {
      setConnectionState("idle");
      setGame(null);
      return;
    }

 

    setConnectionState("connecting");

    const socket = new WebSocket(
      `${apiUrl}/games/${gameId}/ws?session_id=${sessionId}`,
    );

    socket.onopen = () => {
      setConnectionState("connected");
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "game_state") {
          setGame(message.game);
        }
        else if (message.type === "analysis_result"){
          setAnalysisData(message.result)
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    socket.onerror = () => {
      setConnectionState("error");
    };

    socket.onclose = () => {
      setConnectionState("idle");
    };

    return () => {
      socket.close();
    };
  }, [gameId]);

  return {
    game,
    setGame,
    connectionState,
    analysisData,
    setAnalysisData,
    sessionId,
  };
}
