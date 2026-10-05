/** Shared top navigation bar used across all pages of the Chess Arena app. */

type NavbarProps = {
  /**
   * Variant changes the right-side content of the navbar.
   *  - "lobby"   – shows the player handle badge (used on the mode selection screen)
   *  - "game"    – shows the Share Room button + connection status pill (used in game room)
   */
  variant: "lobby" | "game";

  // ── Lobby variant props ───────────────────────────────────────────────────
  /** Current player's display name (lobby variant). */
  playerName?: string;

  // ── Game variant props ────────────────────────────────────────────────────
  /** Short badge label shown next to the "CHESS ARENA" title, e.g. "Live" or "Waiting". */
  statusBadge?: string;
  /** Full game room ID. A truncated version is displayed in the pill. */
  gameId?: string;
  /** Callback fired when the user clicks the Share Room button. */
  onShareRoom?: () => void;
  /** Whether the Share Room button has just been clicked (copied = true). */
  copiedLink?: boolean;
  /** WebSocket connection state label, e.g. "connected" | "connecting" | "error". */
  connectionState?: string;
};

export default function Navbar({
  variant,
  playerName = "",
  statusBadge,
  gameId,
  onShareRoom,
  copiedLink = false,
  connectionState = "idle",
}: NavbarProps) {
  const isConnected = connectionState.toLowerCase() === "connected";

  return (
    <header className="border-b border-[#3d3935] bg-[#262421]/95 backdrop-blur-md sticky top-0 z-30 shadow-md">
      <div
        className={`max-w-6xl mx-auto px-4 flex items-center justify-between ${
          variant === "lobby" ? "h-16" : "h-14"
        }`}
      >
        {/* ── Left: Brand Logo & Title ── */}
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl bg-gradient-to-b from-[#81b64c] to-[#608b35] flex items-center justify-center text-white font-bold shadow-md shadow-[#81b64c]/20 ${
              variant === "lobby" ? "w-10 h-10 text-2xl" : "w-8 h-8 text-lg"
            }`}
          >
            ♟
          </div>

          <div>
            <div
              className={`font-extrabold text-white tracking-tight flex items-center gap-2 ${
                variant === "lobby" ? "text-lg" : "text-sm"
              }`}
            >
              {variant === "lobby" ? "CHESS.COM ARENA" : "CHESS ARENA"}

              {/* Status / mode badge */}
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/30">
                {statusBadge ?? (variant === "lobby" ? "Online" : "Live")}
              </span>
            </div>

            {variant === "lobby" && (
              <p className="text-xs text-[#8c8883]">
                Select game mode & match settings
              </p>
            )}
          </div>
        </div>

        {/* ── Right: Variant-specific controls ── */}
        {variant === "lobby" && (
          /* Player handle badge */
          <div className="flex items-center gap-2.5 bg-[#211f1c] px-3.5 py-1.5 rounded-xl border border-[#3d3935]">
            <div className="w-6 h-6 rounded-lg bg-[#3b3835] flex items-center justify-center text-xs text-white font-bold">
              {playerName.trim() ? playerName.charAt(0).toUpperCase() : "G"}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-semibold text-[#8c8883] leading-none">
                Player
              </span>
              <span className="text-xs font-bold text-white max-w-[110px] truncate leading-tight">
                {playerName.trim() ? playerName : "Guest Player"}
              </span>
            </div>
          </div>
        )}

        {variant === "game" && (
          <div className="flex items-center gap-3">
            {/* Share Room button */}
            {gameId && onShareRoom && (
              <button
                type="button"
                onClick={onShareRoom}
                title="Click to copy invite URL"
                className="flex items-center gap-2 bg-[#211f1c] hover:bg-[#2c2926] border border-[#3d3935] px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 transition-colors cursor-pointer"
              >
                <span>{copiedLink ? "✓ Link Copied" : "🔗 Share Room"}</span>
                <span className="font-mono text-[11px] text-stone-400 bg-[#262421] px-1.5 py-0.5 rounded border border-[#3d3935]">
                  {gameId.slice(0, 6)}...
                </span>
              </button>
            )}

            {/* Connection status pill */}
            <div className="flex items-center gap-1.5 bg-[#211f1c] px-2.5 py-1.5 rounded-lg border border-[#3d3935]">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected
                    ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                    : "bg-red-400"
                }`}
              />
              <span className="text-[11px] font-semibold capitalize text-stone-400">
                {connectionState}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

