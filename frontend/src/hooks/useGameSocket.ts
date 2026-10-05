import { useState, useEffect } from "react";
import type { Game } from "../types/game";


const apiUrl = import.meta.env.VITE_WS_BASE_URL

export function useGameSocket(gameId: string | null) {

    const [connectionState, setConnectionState] = useState<
      "idle" | "connecting" | "connected" | "error"
    >("idle");

    const [game, setGame] = useState<Game | null>(null);

    useEffect(()=>{

        if (!gameId) return;
        // setConnectionState("connecting");

        const socket = new WebSocket(`${apiUrl}/games/${gameId}/ws`);
        socket.onopen=()=>{
            setConnectionState("connected")
        }
        socket.onmessage = (event) => {
          const message = JSON.parse(event.data);

          if (message.type === "game_state") {
            setGame(message.game);
          }
        };

        socket.onerror =()=>{
            setConnectionState("error")
        }

        return()=>{
            socket.close();
        }

    },[gameId])


    return {game, connectionState}

}