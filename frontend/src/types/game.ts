export type Player = {
  name: string;
  color: "white" | "black";
};

export type GameMove = {
  number: number;
  uci: string;
  san: string;
  fen: string;
};

export type Game = {
  id: string;
  status: "waiting" | "active" | "completed";
  players: Player[];
  fen: string;
  moves: GameMove[];
  result: "white_won" | "black_won" | "draw" | null;
  termination:
    | "checkmate"
    | "stalemate"
    | "insufficient_material"
    | "resignation"
    | "draw_agreement"
    | null;
  draw_offer: "white" | "black" | null;
};

