type PlayerCardProps = {
  name?: string;
  color?: "white" | "black";
  rating?: string;
  isTurn: boolean;
  isGameActive: boolean;
  isLocalPlayer?: boolean;
  waitingMessage?: string;
};

export default function PlayerCard({
  name,
  color,
  rating = "1500",
  isTurn,
  isGameActive,
  isLocalPlayer = false,
  waitingMessage = "Waiting for player...",
}: PlayerCardProps) {
  const displayName = name || waitingMessage;
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        isTurn && isGameActive
          ? isLocalPlayer
            ? "bg-[#262421] border-[#81b64c] shadow-[0_0_15px_rgba(129,182,76,0.25)]"
            : "bg-[#262421] border-[#81b64c]/60 shadow-[0_0_12px_rgba(129,182,76,0.15)]"
          : "bg-[#262421] border-[#3d3935]"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shadow-inner ${
            isLocalPlayer
              ? "bg-gradient-to-br from-[#81b64c]/30 to-[#608b35]/20 border border-[#81b64c]/40 text-[#81b64c]"
              : "bg-[#211f1c] border border-[#3d3935] text-white"
          }`}
        >
          {initial}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white leading-tight">
              {displayName} {isLocalPlayer && "(You)"}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-stone-400">
              {rating}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-stone-400">
              {color === "white" ? "Playing White ♔" : "Playing Black ♚"}
            </span>

            {isTurn && isGameActive && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isLocalPlayer
                    ? "bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/30"
                    : "text-[#81b64c] bg-[#81b64c]/10 animate-pulse"
                }`}
              >
                {isLocalPlayer ? "Your Turn!" : "Thinking..."}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status Pill */}
      <div className="text-right">
        <div
          className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border ${
            isTurn && isGameActive && isLocalPlayer
              ? "bg-[#81b64c] text-white border-[#81b64c] shadow-md"
              : "bg-[#1e1c1a] text-stone-300 border-[#3d3935]"
          }`}
        >
          {isTurn && isGameActive ? (isLocalPlayer ? "Your Move" : "Active") : "Ready"}
        </div>
      </div>
    </div>
  );
}
