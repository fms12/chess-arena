import { useState } from "react";
import { TIME_CONTROLS, type TimeControlPreset } from "./types";

type OnlineModePanelProps = {
  selectedTimeControl: string;
  onSelectTimeControl: (id: string) => void;
  playerColor: "white" | "random" | "black";
  onSelectPlayerColor: (color: "white" | "random" | "black") => void;
  gameId: string | null;
  onCreateGame: () => Promise<void> | void;
  onJoinGame: (gameId: string) => Promise<void> | void;
  joinGameIdParam: string;
};

export default function OnlineModePanel({
  selectedTimeControl,
  onSelectTimeControl,
  playerColor,
  onSelectPlayerColor,
  gameId,
  onCreateGame,
  onJoinGame,
  joinGameIdParam,
}: OnlineModePanelProps) {
  const [tcCategory, setTcCategory] = useState<"all" | "bullet" | "blitz" | "rapid">("all");
  const [ratedMatch, setRatedMatch] = useState<boolean>(true);
  const [customRoomId, setCustomRoomId] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredTimeControls: TimeControlPreset[] =
    tcCategory === "all"
      ? TIME_CONTROLS
      : TIME_CONTROLS.filter((tc) => tc.category === tcCategory);

  const activeTc =
    TIME_CONTROLS.find((tc) => tc.id === selectedTimeControl) ?? TIME_CONTROLS[4];

  async function handleCopyLink() {
    if (!gameId) return;
    const inviteUrl = new URL(window.location.href);
    inviteUrl.searchParams.set("gameId", gameId);
    await navigator.clipboard.writeText(inviteUrl.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="space-y-5 transition-all duration-200">
      {/* Time Control Categories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c8883]">
            Time Control
          </span>
          <div className="flex gap-1 bg-[#1e1c1a] p-0.5 rounded-lg border border-[#3d3935]">
            {(["all", "bullet", "blitz", "rapid"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setTcCategory(cat)}
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  tcCategory === cat
                    ? "bg-[#36322d] text-white"
                    : "text-[#8c8883] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Time Presets Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {filteredTimeControls.map((tc) => {
            const isSelected = selectedTimeControl === tc.id;
            return (
              <button
                key={tc.id}
                type="button"
                onClick={() => onSelectTimeControl(tc.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#36322d] border-[#81b64c] text-white shadow-[0_0_12px_rgba(129,182,76,0.25)]"
                    : "bg-[#1e1c1a] border-[#3d3935] text-stone-300 hover:border-stone-500 hover:bg-[#22201d]"
                }`}
              >
                {tc.isPopular && (
                  <span className="absolute -top-2 right-2 bg-[#81b64c] text-[#1e1c1a] text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full tracking-wider shadow">
                    Popular
                  </span>
                )}
                <span className="text-sm font-bold tracking-tight">{tc.name}</span>
                <span className="text-[11px] text-[#8c8883] font-medium flex items-center gap-1 mt-0.5">
                  {tc.sublabel}
                  {tc.category === "bullet" && "⚡"}
                  {tc.category === "blitz" && "🔥"}
                  {tc.category === "rapid" && "⏱️"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Match Rating & Color Options */}
      <div className="grid grid-cols-2 gap-3">
        {/* Rated Toggle */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8c8883] mb-1.5">
            Game Rating
          </span>
          <div className="grid grid-cols-2 gap-1.5 bg-[#1e1c1a] p-1 rounded-xl border border-[#3d3935]">
            <button
              type="button"
              onClick={() => setRatedMatch(true)}
              className={`text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer ${
                ratedMatch
                  ? "bg-[#36322d] text-white shadow-sm"
                  : "text-[#8c8883] hover:text-white"
              }`}
            >
              Rated 🏆
            </button>
            <button
              type="button"
              onClick={() => setRatedMatch(false)}
              className={`text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer ${
                !ratedMatch
                  ? "bg-[#36322d] text-white shadow-sm"
                  : "text-[#8c8883] hover:text-white"
              }`}
            >
              Casual ☕
            </button>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8c8883] mb-1.5">
            Play Color
          </span>
          <div className="grid grid-cols-3 gap-1 bg-[#1e1c1a] p-1 rounded-xl border border-[#3d3935]">
            <button
              type="button"
              onClick={() => onSelectPlayerColor("white")}
              title="Play as White"
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                playerColor === "white"
                  ? "bg-[#36322d] text-white shadow-sm border border-[#81b64c]"
                  : "text-[#8c8883] hover:text-white"
              }`}
            >
              <span className="text-base leading-none">♔</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectPlayerColor("random")}
              title="Play as Random"
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                playerColor === "random"
                  ? "bg-[#36322d] text-white shadow-sm border border-[#81b64c]"
                  : "text-[#8c8883] hover:text-white"
              }`}
            >
              <span className="text-base leading-none">☯</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectPlayerColor("black")}
              title="Play as Black"
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                playerColor === "black"
                  ? "bg-[#36322d] text-white shadow-sm border border-[#81b64c]"
                  : "text-[#8c8883] hover:text-white"
              }`}
            >
              <span className="text-base leading-none">♚</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary CTA: 3D Beveled Green Button */}
      <div className="pt-2">
        {!gameId && !joinGameIdParam && (
          <button
            type="button"
            onClick={onCreateGame}
            className="w-full cursor-pointer py-4 px-6 rounded-xl font-extrabold text-base tracking-wide uppercase text-white bg-[#81b64c] hover:bg-[#95c954] active:bg-[#6c9d3d] shadow-[0_4px_0_0_#457524] active:shadow-[0_1px_0_0_#457524] active:translate-y-[3px] transition-all flex items-center justify-center gap-3"
          >
            <span>Play Online ({activeTc.name})</span>
            <span className="text-lg">⚔️</span>
          </button>
        )}

        {/* Room created: Share Room link */}
        {gameId && !joinGameIdParam && (
          <div className="space-y-3">
            <div className="p-3 bg-[#1e1c1a] rounded-xl border border-[#3d3935] flex items-center justify-between text-xs">
              <span className="text-[#8c8883]">Room Code:</span>
              <span className="font-mono font-bold text-white bg-[#262421] px-2.5 py-1 rounded border border-[#3d3935]">
                {gameId}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full cursor-pointer py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide text-white bg-[#3b3835] hover:bg-[#4a4642] active:bg-[#33302e] border border-stone-500/40 shadow-md transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <span className="text-emerald-400">✓</span>
                  <span>Invite Link Copied!</span>
                </>
              ) : (
                <>
                  <span>🔗</span>
                  <span>Share Invite Link</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Join game from URL */}
        {joinGameIdParam && (
          <button
            type="button"
            onClick={() => void onJoinGame(joinGameIdParam)}
            className="w-full cursor-pointer py-4 px-6 rounded-xl font-extrabold text-base tracking-wide uppercase text-white bg-[#81b64c] hover:bg-[#95c954] active:bg-[#6c9d3d] shadow-[0_4px_0_0_#457524] active:shadow-[0_1px_0_0_#457524] active:translate-y-[3px] transition-all flex items-center justify-center gap-3"
          >
            <span>Join Room ({joinGameIdParam.slice(0, 8)}...)</span>
            <span className="text-lg">→</span>
          </button>
        )}
      </div>

      {/* Join with Room ID Accordion */}
      {!joinGameIdParam && !gameId && (
        <div className="pt-2 border-t border-[#3d3935]">
          {!showJoinInput ? (
            <button
              type="button"
              onClick={() => setShowJoinInput(true)}
              className="text-xs text-[#8c8883] hover:text-white font-semibold flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <span>Have a Room ID from a friend?</span>
              <span className="text-[#81b64c] underline font-bold">Join match</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={customRoomId}
                onChange={(e) => setCustomRoomId(e.target.value)}
                className="flex-1 bg-[#1e1c1a] border border-[#3d3935] focus:border-[#81b64c] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#68645f] outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (customRoomId.trim()) {
                    void onJoinGame(customRoomId.trim());
                  }
                }}
                disabled={!customRoomId.trim()}
                className="cursor-pointer bg-[#3b3835] hover:bg-[#4a4642] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-stone-500/40 transition-colors"
              >
                Join
              </button>
              <button
                type="button"
                onClick={() => setShowJoinInput(false)}
                className="cursor-pointer text-[#8c8883] hover:text-white text-xs px-2"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
