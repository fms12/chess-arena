import type { Game } from "../../types/game";

type MatchInfoPanelProps = {
  game: Game;
  playerName: string;
};

export default function MatchInfoPanel({ game, playerName }: MatchInfoPanelProps) {
  return (
    <div className="flex-1 p-4 space-y-3 font-sans text-xs">
      <div className="bg-[#1e1c1a] p-3 rounded-xl border border-[#3d3935] space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-stone-400">Match ID:</span>
          <span className="font-mono text-white font-bold">{game.id}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-stone-400">Status:</span>
          <span className="capitalize font-bold text-[#81b64c]">
            {game.status}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-stone-400">Total Moves:</span>
          <span className="font-bold text-white">{game.moves.length}</span>
        </div>
      </div>

      <div className="bg-[#1e1c1a] p-3 rounded-xl border border-[#3d3935] space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
          Participants
        </div>
        {game.players.map((p) => (
          <div
            key={p.name}
            className="flex justify-between items-center py-1 text-xs"
          >
            <span className="font-medium text-white flex items-center gap-1.5">
              <span>{p.color === "white" ? "♔" : "♚"}</span>
              <span>{p.name}</span>
              {p.name === playerName && (
                <span className="text-[10px] text-[#81b64c]">(You)</span>
              )}
            </span>
            <span className="capitalize text-stone-400 text-[11px]">
              {p.color}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
