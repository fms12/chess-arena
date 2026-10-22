export type Player = {
  name: string;
  color: "white" | "black";
};

export type GameMove = {
  number?: number;
  move_number?: number;
  uci: string;
  san: string;
  fen: string;
};

export type Game = {
  id: string;
  status: "waiting" | "active" | "completed";
  players?: Player[];
  white_player_name?: string | null;
  black_player_name?: string | null;
  bot_color?: "white" | "black" | null;
  bot_difficulty?: "easy" | "medium" | "hard" | null;
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

export type ComputerPlayer = {
  name: string;
  color: "white" | "black";
  difficulty: "easy" | "medium" | "hard";
};

export type Evaluation = {
  type: "cp" | "mate" | null;
  value: number | null;
};
export type GameAnalysis = {
  best_move: string | null;
  evaluation: Evaluation;
  principal_variation: string[];
};