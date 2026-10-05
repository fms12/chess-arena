import { Chessboard } from "react-chessboard";
import type { GameMode, BotProfile, TimeControlPreset } from "./types";

type BoardPreviewProps = {
  activeMode: GameMode;
  selectedBot: BotProfile;
  activeTc: TimeControlPreset;
  playerColor: "white" | "random" | "black";
  playerName: string;
};

export default function BoardPreview({
  activeMode,
  selectedBot,
  activeTc,
  playerColor,
  playerName,
}: BoardPreviewProps) {
  const previewOrientation: "white" | "black" =
    playerColor === "black" ? "black" : "white";

  return (
    <div className="w-full max-w-[460px] bg-[#262421] border border-[#3d3935] rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
      {/* Opponent Profile Header */}
      <div className="flex items-center justify-between px-1 py-0.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#211f1c] border border-[#3d3935] flex items-center justify-center text-xl shadow-inner">
            {activeMode === "online" ? "🌐" : selectedBot.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white leading-tight">
                {activeMode === "online" ? "Online Opponent" : selectedBot.name}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  activeMode === "online"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : selectedBot.badgeStyle
                }`}
              >
                {activeMode === "online" ? "~1500" : selectedBot.rating}
              </span>
            </div>
            <span className="text-[11px] text-[#8c8883]">
              {activeMode === "online"
                ? `${activeTc.name} • ${activeTc.sublabel} Match`
                : `${selectedBot.tagline} • ${selectedBot.tier}`}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-[#8c8883] bg-[#211f1c] px-2.5 py-1 rounded-lg border border-[#3d3935]">
            {activeMode === "online" ? activeTc.name : "No Clock"}
          </span>
        </div>
      </div>

      {/* The Chessboard Container */}
      <div className="rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-[#3d3935] relative bg-[#211f1c]">
        <Chessboard
          options={{
            position: "start",
            boardOrientation: previewOrientation,
            allowDragging: false,
            darkSquareStyle: { backgroundColor: "#739552" },
            lightSquareStyle: { backgroundColor: "#ebecd0" },
          }}
        />
      </div>

      {/* Player Profile Footer */}
      <div className="flex items-center justify-between px-1 py-0.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#81b64c]/20 border border-[#81b64c]/40 flex items-center justify-center text-sm font-extrabold text-[#81b64c]">
            {playerName.trim() ? playerName.charAt(0).toUpperCase() : "♔"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white leading-tight">
                {playerName.trim() ? playerName : "You (Guest)"}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-stone-300 border border-white/15">
                {playerColor === "random"
                  ? "Random ☯"
                  : playerColor === "white"
                  ? "White ♔"
                  : "Black ♚"}
              </span>
            </div>
            <span className="text-[11px] text-[#8c8883]">
              Playing as {previewOrientation === "white" ? "White" : "Black"}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-[#8c8883] bg-[#211f1c] px-2.5 py-1 rounded-lg border border-[#3d3935]">
            {activeMode === "online" ? activeTc.name : "Casual"}
          </span>
        </div>
      </div>
    </div>
  );
}
