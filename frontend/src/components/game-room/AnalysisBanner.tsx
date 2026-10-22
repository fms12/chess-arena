import type { GameAnalysis } from "../../types/game";

type AnalysisBannerProps = {
  analysisData: GameAnalysis | null;
  onAnalyze: () => void;
  isLoading?: boolean;
  onClear?: () => void;
};

function AnalysisBanner({
  analysisData,
  onAnalyze,
  isLoading = false,
  onClear,
}: AnalysisBannerProps) {
  // Format the evaluation score with colors and labels like Chess.com
  function getEvalDetails() {
    if (!analysisData?.evaluation) return null;
    const { type, value } = analysisData.evaluation;

    if (type === "mate") {
      const isPositive = (value ?? 0) > 0;
      return {
        text: `Checkmate in ${Math.abs(value ?? 0)}`,
        badgeClass: isPositive
          ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
          : "bg-rose-950/80 border-rose-500/40 text-rose-300",
        label: isPositive ? "White is winning" : "Black is winning",
      };
    }

    // Centipawns: 100 cp = 1.0 pawn
    const numericScore = (value ?? 0) / 100;
    const sign = numericScore > 0 ? "+" : "";
    const formattedScore = `${sign}${numericScore.toFixed(2)}`;

    if (numericScore > 0.3) {
      return {
        text: `${formattedScore}`,
        badgeClass: "bg-emerald-950/80 border-emerald-500/40 text-emerald-400",
        label: "White advantage",
      };
    }
    if (numericScore < -0.3) {
      return {
        text: `${formattedScore}`,
        badgeClass: "bg-rose-950/80 border-rose-500/40 text-rose-400",
        label: "Black advantage",
      };
    }
    return {
      text: `${formattedScore}`,
      badgeClass: "bg-stone-800/90 border-stone-600/40 text-stone-300",
      label: "Equal position",
    };
  }

  const evalDetails = getEvalDetails();

  return (
    <div className="mt-3 bg-gradient-to-b from-[#2a2622] to-[#201d1a] border border-[#4a443d] rounded-2xl p-4 shadow-xl flex flex-col gap-3 animate-fadeIn">
      {/* ── STATE 1: Before Analysis (Action Button) ── */}
      {!analysisData ? (
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading}
          className="w-full cursor-pointer py-3.5 px-4 rounded-xl font-extrabold text-xs tracking-wider uppercase text-white bg-[#81b64c] hover:bg-[#95c954] active:bg-[#6c9d3d] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_3px_0_0_#457524] active:shadow-[0_1px_0_0_#457524] active:translate-y-[2px] transition-all flex items-center justify-center gap-2.5"
        >
          {isLoading ? (
            <>
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyze Best Move</span>
            </>
          ) : (
            <>
              <span className="text-base">💡</span>
              <span>Hint</span>
            </>
          )}
        </button>
      ) : (
        /* ── STATE 2: After Analysis Arrives (Chess.com Style Card) ── */
        <div className="flex flex-col gap-3">
          {/* Top Sub-bar: Title & Clear/Hide Arrow Button */}
          <div className="flex items-center justify-between border-b border-[#3d3731] pb-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-stone-400 font-bold uppercase tracking-wider">
              <span>🤖</span>
              <span>Stockfish 16 Analysis</span>
            </div>

            {onClear && (
              <button
                type="button"
                onClick={onClear}
                title="Hide arrow on board"
                className="text-stone-400 hover:text-white px-2 py-0.5 rounded-md hover:bg-[#332f2b] transition-colors cursor-pointer text-xs"
              >
                Clear Arrow ✕
              </button>
            )}
          </div>

          {/* Best Move Box */}
          <div className="bg-[#1a1816] rounded-xl p-3 border border-[#38332c] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                Recommended Move
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-emerald-400 text-sm">💡</span>
                <div className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-white">
                  <span className="bg-[#262421] px-2 py-0.5 rounded border border-[#3d3731]">
                    {analysisData.best_move?.slice(0, 2) ?? "--"}
                  </span>
                  <span className="text-[#81b64c]">➔</span>
                  <span className="bg-[#262421] px-2 py-0.5 rounded border border-[#3d3731]">
                    {analysisData.best_move?.slice(2, 4) ?? "--"}
                  </span>
                </div>
              </div>
            </div>

            {/* Color-coded Evaluation Badge */}
            {evalDetails && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-stone-400 font-semibold mb-0.5">
                  {evalDetails.label}
                </span>
                <span
                  className={`font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg border ${evalDetails.badgeClass}`}
                >
                  {evalDetails.text}
                </span>
              </div>
            )}
          </div>

          {/* Continuation Line (Principal Variation) */}
          {analysisData.principal_variation &&
            analysisData.principal_variation.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Engine Continuation Line:
                </span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[11px] text-stone-300">
                  {analysisData.principal_variation
                    .slice(0, 5)
                    .map((move, idx) => (
                      <span
                        key={`${move}-${idx}`}
                        className="bg-[#1a1816] px-2 py-0.5 rounded border border-[#38332c] text-stone-300"
                      >
                        {move}
                      </span>
                    ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default AnalysisBanner;
