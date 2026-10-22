import { useState } from "react";
import {
  BOTS,
  TIME_CONTROLS,
  type BotConfig,
  type BotProfile,
  type GameMode,
  type TimeControlPreset,
} from "./mode-selection/types";
import { OnlineModePanel } from "./mode-selection/OnlineModePanel";
import { BotModePanel } from "./mode-selection/BotModePanel";

export type {
  GameMode,
  TimeControlPreset,
  BotProfile,
  BotConfig,
};

export { TIME_CONTROLS, BOTS };

export type LobbyProps = {
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onCreateGame: () => Promise<void> | void;
  onJoinGame: (gameId: string) => Promise<void> | void;
  onCreateComputerGame: (config: BotConfig) => void | Promise<void>;
};

export default function Lobby({
  playerName,
  onPlayerNameChange,
  onCreateGame,
  onJoinGame,
  onCreateComputerGame,
}: LobbyProps) {
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
  const [copied, setCopied] = useState(false);

  const selectedBot = BOTS.find((b) => b.id === selectedBotId) ?? BOTS[0];

  async function handleCopyLink() {
    const inviteUrl = new URL(window.location.href);
    await navigator.clipboard.writeText(inviteUrl.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleStartBot() {
    const difficulty = (
      selectedBot.tier.toLowerCase() === "meduim" ? "medium" : selectedBot.tier.toLowerCase()
    ) as "easy" | "medium" | "hard";

    const config: BotConfig = {
      playerName,
      playerColor,
      difficulty,
    };

    onCreateComputerGame(config);
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

          {/* VIEW 1: PLAY ONLINE MODE (Human vs Human) */}
          {activeMode === "online" && (
            <OnlineModePanel
              selectedTimeControl={selectedTimeControl}
              onSelectTimeControl={setSelectedTimeControl}
              gameId={null}
              onCreateGame={onCreateGame}
              onJoinGame={onJoinGame}
              joinGameIdParam={joinGameIdParam}
              copied={copied}
              onCopyLink={handleCopyLink}
            />
          )}

          {/* VIEW 2: PLAY WITH BOT MODE (Human vs Bot) */}
          {activeMode === "bot" && (
            <BotModePanel
              selectedBotId={selectedBotId}
              onSelectBotId={setSelectedBotId}
              playerColor={playerColor}
              onSelectPlayerColor={setPlayerColor}
              botGameType={botGameType}
              onSelectBotGameType={setBotGameType}
              botFilterTier={botFilterTier}
              onSelectBotFilterTier={setBotFilterTier}
              onStartBot={handleStartBot}
              botStartedToast={false}
            />
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
