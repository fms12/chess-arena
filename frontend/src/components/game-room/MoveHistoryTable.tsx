import type { GameMove } from "../../types/game";

type MoveHistoryTableProps = {
  moves: GameMove[];
};

export default function MoveHistoryTable({ moves }: MoveHistoryTableProps) {
  // Format flat move array into standard chess pairs (e.g. 1. e4 e5)
  const movePairs: { number: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i].san,
      black: moves[i + 1]?.san,
    });
  }

  return (
    <div className="flex-1 flex flex-col min-h-[240px] max-h-[360px] overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 px-4 py-2 bg-[#211f1c] text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-[#3d3935]">
        <span className="col-span-2">#</span>
        <span className="col-span-5">White</span>
        <span className="col-span-5">Black</span>
      </div>

      {/* Move Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#3d3935]/40 font-mono text-xs">
        {movePairs.map((pair, idx) => {
          const isLatest = idx === movePairs.length - 1;
          return (
            <div
              key={pair.number}
              className={`grid grid-cols-12 px-4 py-2 hover:bg-[#2c2926] transition-colors ${
                isLatest ? "bg-[#81b64c]/10 text-white font-bold" : "text-stone-300"
              }`}
            >
              <span className="col-span-2 text-stone-500 font-sans">
                {pair.number}.
              </span>
              <span className="col-span-5 tracking-wide">
                {pair.white}
              </span>
              <span className="col-span-5 tracking-wide">
                {pair.black || ""}
              </span>
            </div>
          );
        })}

        {/* Empty state when game has just begun */}
        {movePairs.length === 0 && (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center text-stone-500 font-sans">
            <span className="text-3xl mb-2 opacity-40">♟</span>
            <p className="text-xs font-medium">Game in progress</p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              White makes the opening move
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
