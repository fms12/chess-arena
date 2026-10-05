// =============================================================================
// Game API FUNCTIONS (src/api/game.ts)
// =============================================================================
// Functions for managing Game API's
//
// 🎓 FASTAPI ENDPOINTS WE CALL:

// =============================================================================

// export async function createSpaceApi(
//   payload: CreateSpacePayload,
// ): Promise<{ spaceId: string }> {
//   const { data } = await apiClient.post<{ spaceId: string }>("/api/v1/space", {
//     name: payload.name,
//     dimensions: `${payload.width}x${payload.height}`,
//     mapId: payload.mapElementId,
//   });
//   return data;
// }

import apiClient from "./client";

export async function createGameApi() {
  const { data } = await apiClient.post("/games/", {});
  return data;
}

export async function joinGameApi(gameId: string, playerName: string) {
  const { data } = await apiClient.post(`/games/${gameId}/join`, {
    player_name: playerName,
  });

  return data;
}


export async function submitMoveApi(gameId: string , playerName: string, fromSquare: string, toSquare: string) {
  console.log(typeof(fromSquare), typeof(toSquare));
  const { data } = await apiClient.post(`/games/${gameId}/moves`, {
    player_name: playerName,
    from_square: fromSquare,
    to_square: toSquare,
  });
  return data
}


export async function resignGameApi(gameId: string, playerName: string) {
  const { data } = await apiClient.post(`/games/${gameId}/resign`, {
    player_name: playerName,
  });
  return data;
}

export async function offerDrawApi(gameId: string, playerName: string) { 
  const {data} = await apiClient.post(`/games/${gameId}/draw-offer`, {
    player_name: playerName,
  });
  return data;
}

export async function acceptDrawApi(gameId: string, playerName: string,accept: boolean) {
  const { data } = await apiClient.post(`/games/${gameId}/draw-response`, {
    player_name: playerName,
    accept: accept
  });
  return data;
}