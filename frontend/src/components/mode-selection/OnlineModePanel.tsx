import { useState } from "react";
import { TIME_CONTROLS, type TimeControlPreset } from "./types";

type OnlineModePanelProps = {
  selectedTimeControl: string;
  onSelectTimeControl: (id: string) => void;
  gameId: string | null;
  onCreateGame: () => Promise<void> | void;
  onJoinGame: (gameId: string) => Promise<void> | void;
  joinGameIdParam: string;
  copied: boolean;
  onCopyLink: () => void;
};

export function OnlineModePanel({
  selectedTimeControl,
  onSelectTimeControl,
  gameId,
  onCreateGame,
  onJoinGame,
  joinGameIdParam,
  copied,
  onCopyLink,
}: OnlineModePanelProps) {
  const [customRoomId, setCustomRoomId] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Time Control Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Time Control
          </span>
          <span className="text-xs text-stone-500">Standard formats</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {TIME_CONTROLS.map((tc: TimeControlPreset) => {
            const isSelected = selectedTimeControl === tc.id;
            return (
              <button
                key={tc.id}
                type="button"
                onClick={() => onSelectTimeControl(tc.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#36322d] border-[#81b64c] text-white shadow-[0_0_12px_rgba(129,182,76,0.25)]"
                    : "bg-[#1e1c1a] border-[#36322d] text-stone-300 hover:border-stone-500 hover:bg-[#22201d]"
                }`}
              >
                {tc.isPopular && (
                  <span className="absolute -top-2 right-2 bg-[#81b64c] text-[#1e1c1a] text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full tracking-wider">
                    Popular
                  </span>
                )}
                <span className="text-base font-bold tracking-tight">
                  {tc.name}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[11px] text-stone-400 font-medium">
                    {tc.time}
                  </span>
                  {tc.category === "bullet" && <span>⚡</span>}
                  {tc.category === "blitz" && <span>🔥</span>}
                  {tc.category === "rapid" && <span>⏱️</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Online Action: Create Game Button (Chess.com Green Button) */}
      <div className="pt-2">
        {!gameId && !joinGameIdParam && (
          <button
            type="button"
            onClick={onCreateGame}
            className="w-full cursor-pointer py-4 px-6 rounded-xl font-extrabold text-base tracking-wide uppercase text-white bg-[#81b64c] hover:bg-[#95c954] active:bg-[#6c9d3d] shadow-[0_4px_0_0_#457524] active:shadow-[0_1px_0_0_#457524] active:translate-y-[3px] transition-all flex items-center justify-center gap-3"
          >
            <span>Play Online</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        )}

        {/* If Room is already created, show Share Room Link */}
        {gameId && !joinGameIdParam && (
          <div className="space-y-3">
            <div className="p-3 bg-[#1e1c1a] rounded-xl border border-[#3b3836] flex items-center justify-between text-xs">
              <span className="text-stone-400">Room Code:</span>
              <span className="font-mono font-bold text-white bg-[#262421] px-2.5 py-1 rounded border border-[#36322d]">
                {gameId}
              </span>
            </div>

            <button
              type="button"
              onClick={onCopyLink}
              className="w-full cursor-pointer py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide text-white bg-[#3b3836] hover:bg-[#4a4642] active:bg-[#33302e] border border-stone-500/40 shadow-md transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <span className="text-emerald-400">✓</span>
                  <span>Link Copied to Clipboard!</span>
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

        {/* If URL contains join gameId */}
        {joinGameIdParam && (
          <button
            type="button"
            onClick={() => void onJoinGame(joinGameIdParam)}
            className="w-full cursor-pointer py-4 px-6 rounded-xl font-extrabold text-base tracking-wide uppercase text-white bg-[#81b64c] hover:bg-[#95c954] active:bg-[#6c9d3d] shadow-[0_4px_0_0_#457524] active:shadow-[0_1px_0_0_#457524] active:translate-y-[3px] transition-all flex items-center justify-center gap-3"
          >
            <span>Join Match ({joinGameIdParam.slice(0, 8)}...)</span>
            <span className="text-lg">→</span>
          </button>
        )}
      </div>

      {/* Join with Room ID Accordion / Option */}
      {!joinGameIdParam && !gameId && (
        <div className="pt-2 border-t border-[#36322d]">
          {!showJoinInput ? (
            <button
              type="button"
              onClick={() => setShowJoinInput(true)}
              className="text-xs text-stone-400 hover:text-stone-200 font-semibold flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <span>Have a Room ID from a friend?</span>
              <span className="text-[#81b64c] underline">Join directly</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste Room ID here"
                value={customRoomId}
                onChange={(e) => setCustomRoomId(e.target.value)}
                className="flex-1 bg-[#1e1c1a] border border-[#3b3836] focus:border-[#81b64c] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (customRoomId.trim()) {
                    void onJoinGame(customRoomId.trim());
                  }
                }}
                disabled={!customRoomId.trim()}
                className="cursor-pointer bg-[#3b3836] hover:bg-[#4a4642] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-stone-500/40 transition-colors"
              >
                Join Room
              </button>
              <button
                type="button"
                onClick={() => setShowJoinInput(false)}
                className="cursor-pointer text-stone-400 hover:text-stone-200 text-xs px-2"
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
