import { useState } from "react";

export type GameMode = "online" | "bot";

export type TimeControlPreset = {
  id: string;
  name: string;
  time: string;
  category: "bullet" | "blitz" | "rapid";
  isPopular?: boolean;
};

export type BotProfile = {
  id: string;
  name: string;
  rating: number;
  tier: "Beginner" | "Intermediate" | "Advanced" | "Master";
  avatar: string;
  colorTheme: string;
  description: string;
  quote: string;
};

export type BotConfig = {
  bot: BotProfile;
  playerColor: "white" | "random" | "black";
  gameType: "friendly" | "challenge";
};

export type GameModeSelectionProps = {
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  gameId: string | null;
  onCreateGame: () => Promise<void> | void;
  onJoinGame: (gameId: string) => Promise<void> | void;
  onStartBotGame?: (config: BotConfig) => void;
};

const TIME_CONTROLS: TimeControlPreset[] = [
  { id: "1m", name: "1 min", time: "Bullet", category: "bullet" },
  { id: "2|1", name: "2 | 1", time: "Bullet", category: "bullet" },
  { id: "3m", name: "3 min", time: "Blitz", category: "blitz" },
  { id: "5m", name: "5 min", time: "Blitz", category: "blitz", isPopular: true },
  { id: "10m", name: "10 min", time: "Rapid", category: "rapid", isPopular: true },
  { id: "15|10", name: "15 | 10", time: "Rapid", category: "rapid" },
];

const BOTS: BotProfile[] = [
  {
    id: "martin",
    name: "Martin",
    rating: 250,
    tier: "Beginner",
    avatar: "🤖",
    colorTheme: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    description: "Friendly starter bot. Makes frequent mistakes and lets you explore ideas freely.",
    quote: "I'm still learning how the pieces move. Let's have a fun match!",
  },
  {
    id: "jimmy",
    name: "Jimmy",
    rating: 600,
    tier: "Beginner",
    avatar: "🧒",
    colorTheme: "border-teal-500/40 bg-teal-500/10 text-teal-400",
    description: "Casual junior player. Knows basic checkmates and principles, but misses tactics.",
    quote: "Watch out for my knights! I like attacking early.",
  },
  {
    id: "nelson",
    name: "Nelson",
    rating: 1300,
    tier: "Intermediate",
    avatar: "⚔️",
    colorTheme: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    description: "Aggressive tactical bot. Loves launching early queen attacks and sharp gambits.",
    quote: "My queen is already coming for your king. Can you defend?",
  },
  {
    id: "antonio",
    name: "Antonio",
    rating: 1500,
    tier: "Intermediate",
    avatar: "🧐",
    colorTheme: "border-indigo-500/40 bg-indigo-500/10 text-indigo-400",
    description: "Solid positional club player. Values pawn structures and punishing blunders.",
    quote: "Strategy wins games. Every piece should have a clear purpose.",
  },
  {
    id: "isabel",
    name: "Isabel",
    rating: 1800,
    tier: "Advanced",
    avatar: "🎯",
    colorTheme: "border-purple-500/40 bg-purple-500/10 text-purple-400",
    description: "Fierce calculation expert. Punishes positional mistakes with relentless combinations.",
    quote: "One imprecise move is all I need to seize the initiative.",
  },
  {
    id: "stockfish",
    name: "Komodo Grandmaster",
    rating: 2500,
    tier: "Master",
    avatar: "👑",
    colorTheme: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    description: "Maximum engine calculation depth. Ruthless positional and tactical mastery.",
    quote: "Evaluating millions of nodes per second. Zero margin for error.",
  },
];

export default function GameModeSelection({
  playerName,
  onPlayerNameChange,
  gameId,
  onCreateGame,
  onJoinGame,
  onStartBotGame,
}: GameModeSelectionProps) {
  const joinGameIdParam =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("gameId") ?? ""
      : "";

  const [activeMode, setActiveMode] = useState<GameMode>("online");
  const [selectedTimeControl, setSelectedTimeControl] = useState<string>("10m");
  const [selectedBotId, setSelectedBotId] = useState<string>("martin");
  const [playerColor, setPlayerColor] = useState<"white" | "random" | "black">("random");
  const [botGameType, setBotGameType] = useState<"friendly" | "challenge">("friendly");
  const [botFilterTier, setBotFilterTier] = useState<string>("all");
  const [customRoomId, setCustomRoomId] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [botStartedToast, setBotStartedToast] = useState(false);

  const selectedBot = BOTS.find((b) => b.id === selectedBotId) ?? BOTS[0];

  const filteredBots =
    botFilterTier === "all"
      ? BOTS
      : BOTS.filter((b) => b.tier.toLowerCase() === botFilterTier.toLowerCase());

  async function handleCopyLink() {
    if (!gameId) return;
    const inviteUrl = new URL(window.location.href);
    inviteUrl.searchParams.set("gameId", gameId);
    await navigator.clipboard.writeText(inviteUrl.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleStartBot() {
    if (onStartBotGame) {
      onStartBotGame({
        bot: selectedBot,
        playerColor,
        gameType: botGameType,
      });
    } else {
      setBotStartedToast(true);
      setTimeout(() => setBotStartedToast(false), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-[#1e1c1a] text-stone-200 flex flex-col justify-between selection:bg-[#81b64c] selection:text-white font-sans antialiased">
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        {/* Game Mode Dual Tabs (Chess.com Style) */}
        <div className="w-full max-w-2xl mb-8">
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#262421] border border-[#36322d] rounded-2xl shadow-inner">
            {/* Tab: Play Online */}
            <button
              type="button"
              onClick={() => setActiveMode("online")}
              className={`group flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                activeMode === "online"
                  ? "bg-[#36322d] text-white shadow-md border border-stone-600/50"
                  : "text-stone-400 hover:text-white hover:bg-[#2c2926]"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  activeMode === "online"
                    ? "bg-[#81b64c] text-white"
                    : "bg-[#1e1c1a] text-stone-400 group-hover:text-stone-200"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <div className="leading-tight">Play Online</div>
                <div className="text-[11px] font-normal text-stone-400">
                  Vs real players
                </div>
              </div>
            </button>

            {/* Tab: Play with Bot */}
            <button
              type="button"
              onClick={() => setActiveMode("bot")}
              className={`group flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                activeMode === "bot"
                  ? "bg-[#36322d] text-white shadow-md border border-stone-600/50"
                  : "text-stone-400 hover:text-white hover:bg-[#2c2926]"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  activeMode === "bot"
                    ? "bg-[#81b64c] text-white"
                    : "bg-[#1e1c1a] text-stone-400 group-hover:text-stone-200"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <div className="leading-tight">Play with Bot</div>
                <div className="text-[11px] font-normal text-stone-400">
                  Practice vs AI
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="w-full max-w-2xl bg-[#262421] border border-[#36322d] rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle chess background watermark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -bottom-12 select-none text-9xl opacity-[0.03] font-serif text-white"
          >
            ♚
          </div>

          {/* Player Name Input (Shared across modes for clear identification) */}
          <div className="mb-6">
            <label
              htmlFor="modePlayerName"
              className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2"
            >
              Your Player Handle
            </label>
            <div className="relative">
              <input
                id="modePlayerName"
                type="text"
                placeholder="Enter your name (e.g. Magnus)"
                value={playerName}
                onChange={(e) => onPlayerNameChange(e.target.value)}
                maxLength={25}
                className="w-full bg-[#1e1c1a] border border-[#3b3836] focus:border-[#81b64c] rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-stone-500 outline-none transition-colors shadow-inner"
              />
              <div className="absolute right-3.5 top-3 text-xs text-stone-500">
                👤
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* VIEW 1: PLAY ONLINE MODE                                  */}
          {/* ========================================================= */}
          {activeMode === "online" && (
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
                  {TIME_CONTROLS.map((tc) => {
                    const isSelected = selectedTimeControl === tc.id;
                    return (
                      <button
                        key={tc.id}
                        type="button"
                        onClick={() => setSelectedTimeControl(tc.id)}
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

              {/* Color Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Choose Color
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlayerColor("white")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-xs transition-all cursor-pointer ${
                      playerColor === "white"
                        ? "bg-[#36322d] border-[#81b64c] text-white shadow-sm"
                        : "bg-[#1e1c1a] border-[#36322d] text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <span className="text-base">♔</span>
                    <span>White</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerColor("random")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-xs transition-all cursor-pointer ${
                      playerColor === "random"
                        ? "bg-[#36322d] border-[#81b64c] text-white shadow-sm"
                        : "bg-[#1e1c1a] border-[#36322d] text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <span className="text-base">☯</span>
                    <span>Random</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerColor("black")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-xs transition-all cursor-pointer ${
                      playerColor === "black"
                        ? "bg-[#36322d] border-[#81b64c] text-white shadow-sm"
                        : "bg-[#1e1c1a] border-[#36322d] text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <span className="text-base">♚</span>
                    <span>Black</span>
                  </button>
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
                      onClick={handleCopyLink}
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
          )}

          {/* ========================================================= */}
          {/* VIEW 2: PLAY WITH BOT MODE                                */}
          {/* ========================================================= */}
          {activeMode === "bot" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Bot Filter Tiers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Choose Bot Personality
                  </span>
                  <div className="flex gap-1">
                    {["all", "beginner", "intermediate", "advanced"].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setBotFilterTier(tier)}
                        className={`text-[11px] font-semibold capitalize px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                          botFilterTier === tier
                            ? "bg-[#36322d] text-white border border-stone-500/50"
                            : "text-stone-500 hover:text-stone-300"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bot Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {filteredBots.map((bot) => {
                    const isSelected = selectedBotId === bot.id;
                    return (
                      <button
                        key={bot.id}
                        type="button"
                        onClick={() => setSelectedBotId(bot.id)}
                        className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-[#36322d] border-[#81b64c] shadow-[0_0_12px_rgba(129,182,76,0.2)]"
                            : "bg-[#1e1c1a] border-[#36322d] hover:border-stone-500 hover:bg-[#22201d]"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-[#262421] border border-[#3b3836] flex items-center justify-center text-2xl mb-1.5 shadow-inner">
                          {bot.avatar}
                        </div>
                        <div className="font-bold text-sm text-white leading-tight">
                          {bot.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${bot.colorTheme}`}
                          >
                            {bot.rating}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Bot Spotlight / Bio Card */}
              <div className="bg-[#1e1c1a] border border-[#3b3836] rounded-xl p-4 flex gap-4 items-start">
                <div className="w-14 h-14 rounded-2xl bg-[#262421] border border-[#44403c] flex items-center justify-center text-3xl shadow-md shrink-0">
                  {selectedBot.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-white text-base">
                      {selectedBot.name}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border ${selectedBot.colorTheme}`}
                    >
                      Rating {selectedBot.rating}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    {selectedBot.description}
                  </p>
                  <blockquote className="mt-2 text-[11px] text-[#81b64c] italic bg-[#262421]/60 px-2.5 py-1 rounded border-l-2 border-[#81b64c]">
                    "{selectedBot.quote}"
                  </blockquote>
                </div>
              </div>

              {/* Bot Play Color Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Choose Color
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlayerColor("white")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-xs transition-all cursor-pointer ${
                      playerColor === "white"
                        ? "bg-[#36322d] border-[#81b64c] text-white shadow-sm"
                        : "bg-[#1e1c1a] border-[#36322d] text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <span className="text-base">♔</span>
                    <span>White</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerColor("random")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-xs transition-all cursor-pointer ${
                      playerColor === "random"
                        ? "bg-[#36322d] border-[#81b64c] text-white shadow-sm"
                        : "bg-[#1e1c1a] border-[#36322d] text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <span className="text-base">☯</span>
                    <span>Random</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerColor("black")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-xs transition-all cursor-pointer ${
                      playerColor === "black"
                        ? "bg-[#36322d] border-[#81b64c] text-white shadow-sm"
                        : "bg-[#1e1c1a] border-[#36322d] text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <span className="text-base">♚</span>
                    <span>Black</span>
                  </button>
                </div>
              </div>

              {/* Bot Game Type (Assistance mode) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Assistance Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBotGameType("friendly")}
                    className={`flex flex-col items-start p-3 rounded-xl border transition-all cursor-pointer ${
                      botGameType === "friendly"
                        ? "bg-[#36322d] border-[#81b64c] text-white"
                        : "bg-[#1e1c1a] border-[#36322d] text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <span>💡</span> Friendly Mode
                    </span>
                    <span className="text-[11px] text-stone-400 mt-0.5">
                      Hints and takebacks enabled
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBotGameType("challenge")}
                    className={`flex flex-col items-start p-3 rounded-xl border transition-all cursor-pointer ${
                      botGameType === "challenge"
                        ? "bg-[#36322d] border-[#81b64c] text-white"
                        : "bg-[#1e1c1a] border-[#36322d] text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <span>⚔️</span> Challenge Mode
                    </span>
                    <span className="text-[11px] text-stone-400 mt-0.5">
                      Strict rules, no takebacks
                    </span>
                  </button>
                </div>
              </div>

              {/* Primary Bot Action: Start Bot Match Button (Chess.com Green Button) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartBot}
                  className="w-full cursor-pointer py-4 px-6 rounded-xl font-extrabold text-base tracking-wide uppercase text-white bg-[#81b64c] hover:bg-[#95c954] active:bg-[#6c9d3d] shadow-[0_4px_0_0_#457524] active:shadow-[0_1px_0_0_#457524] active:translate-y-[3px] transition-all flex items-center justify-center gap-3"
                >
                  <span>Play vs {selectedBot.name}</span>
                  <span className="text-xl">🤖</span>
                </button>

                {botStartedToast && (
                  <div className="mt-3 p-3 bg-[#36322d] border border-[#81b64c]/40 rounded-xl text-center text-xs text-[#81b64c] font-semibold animate-pulse">
                    Bot match configured for {selectedBot.name} ({selectedBot.rating}) • Ready for bot engine
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#36322d] bg-[#262421]/60 py-4 text-center text-xs text-stone-500">
        <p>Chess Arena • Inspired by Chess.com mode selection UI</p>
      </footer>
    </div>
  );
}
