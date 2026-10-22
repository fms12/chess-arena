import { useState, useEffect } from "react";
import type { Game } from "../types/game";

const apiUrl = import.meta.env.VITE_WS_BASE_URL;

export function useGameSocket(gameId: string | null) {
  const [connectionState, setConnectionState] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");

  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!gameId) {
      setConnectionState("idle");
      setGame(null);
      return;
    }

    setConnectionState("connecting");

    const socket = new WebSocket(`${apiUrl}/games/${gameId}/ws`);

    socket.onopen = () => {
      setConnectionState("connected");
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "game_state") {
          setGame(message.game);
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

  return { game, setGame, connectionState };
}
