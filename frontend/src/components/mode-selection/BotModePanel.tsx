import { useState } from "react";
import { BOTS, type BotProfile, type BotConfig } from "./types";

type BotModePanelProps = {
  selectedBotId: string;
  onSelectBotId: (id: string) => void;
  playerColor: "white" | "random" | "black";
  onSelectPlayerColor: (color: "white" | "random" | "black") => void;
  onStartBotGame?: (config: BotConfig) => void;
};

export default function BotModePanel({
  selectedBotId,
  onSelectBotId,
  playerColor,
  onSelectPlayerColor,
  onStartBotGame,
}: BotModePanelProps) {
  const [botFilterTier, setBotFilterTier] = useState<string>("all");
  const [botGameType, setBotGameType] = useState<"friendly" | "challenge">("friendly");
  const [botNotification, setBotNotification] = useState<string | null>(null);

  const selectedBot = BOTS.find((b) => b.id === selectedBotId) ?? BOTS[0];

  const filteredBots: BotProfile[] =
    botFilterTier === "all"
      ? BOTS
      : BOTS.filter((b) => b.tier.toLowerCase() === botFilterTier.toLowerCase());

  function handleStartBot() {
    if (onStartBotGame) {
      onStartBotGame({
        bot: selectedBot,
        playerColor,
        gameType: botGameType,
      });
    } else {
      setBotNotification(`Match configured with ${selectedBot.name} (${selectedBot.rating})!`);
      setTimeout(() => setBotNotification(null), 3000);
    }
  }

  return (
    <div className="space-y-5 transition-all duration-200">
      {/* Bot Tier Filters */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c8883]">
            Choose Opponent Bot
          </span>
          <div className="flex gap-1 bg-[#1e1c1a] p-0.5 rounded-lg border border-[#3d3935]">
            {(["all", "beginner", "intermediate", "advanced", "master"] as const).map(
              (tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setBotFilterTier(tier)}
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    botFilterTier === tier
                      ? "bg-[#36322d] text-white"
                      : "text-[#8c8883] hover:text-white"
                  }`}
                >
                  {tier}
                </button>
              )
            )}
          </div>
        </div>

        {/* Bot Cards Grid */}
        <div className="grid grid-cols-3 gap-2">
          {filteredBots.map((bot) => {
            const isSelected = selectedBotId === bot.id;
            return (
              <button
                key={bot.id}
                type="button"
                onClick={() => onSelectBotId(bot.id)}
                className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-[#36322d] border-[#81b64c] shadow-[0_0_12px_rgba(129,182,76,0.25)]"
                    : "bg-[#1e1c1a] border-[#3d3935] hover:border-stone-500 hover:bg-[#22201d]"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#262421] border border-[#3d3935] flex items-center justify-center text-xl mb-1 shadow-inner">
                  {bot.avatar}
                </div>
                <div className="font-bold text-xs text-white leading-tight">
                  {bot.name}
                </div>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border mt-1 ${bot.badgeStyle}`}
                >
                  {bot.rating}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Bot Spotlight Bio */}
      <div className="bg-[#1e1c1a] border border-[#3d3935] rounded-xl p-3.5 flex gap-3.5 items-start">
        <div className="w-12 h-12 rounded-xl bg-[#262421] border border-[#3d3935] flex items-center justify-center text-2xl shadow-inner shrink-0">
          {selectedBot.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm">{selectedBot.name}</h4>
              <span className="text-[10px] text-[#8c8883]">
                • {selectedBot.tagline}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${selectedBot.badgeStyle}`}
            >
              {selectedBot.rating}
            </span>
          </div>
          <p className="text-[11px] text-stone-300 mt-1 leading-snug">
            {selectedBot.description}
          </p>
          <blockquote className="mt-2 text-[10px] text-[#81b64c] italic bg-[#262421] px-2 py-1 rounded border-l-2 border-[#81b64c]">
            "{selectedBot.quote}"
          </blockquote>
        </div>
      </div>

      {/* Assistance Mode & Color Selection */}
      <div className="grid grid-cols-2 gap-3">
        {/* Game Assistance */}
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8c8883] mb-1.5">
            Assistance Mode
          </span>
          <div className="grid grid-cols-2 gap-1.5 bg-[#1e1c1a] p-1 rounded-xl border border-[#3d3935]">
            <button
              type="button"
              onClick={() => setBotGameType("friendly")}
              title="Hints and takebacks enabled"
              className={`text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer ${
                botGameType === "friendly"
                  ? "bg-[#36322d] text-white shadow-sm"
                  : "text-[#8c8883] hover:text-white"
              }`}
            >
              Friendly 💡
            </button>
            <button
              type="button"
              onClick={() => setBotGameType("challenge")}
              title="Strict rules, no takebacks"
              className={`text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer ${
                botGameType === "challenge"
                  ? "bg-[#36322d] text-white shadow-sm"
                  : "text-[#8c8883] hover:text-white"
              }`}
            >
              Challenge ⚔️
            </button>
          </div>
        </div>

        {/* Color Preference */}
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

      {/* Primary Bot Action: 3D Beveled Green Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleStartBot}
          className="w-full cursor-pointer py-4 px-6 rounded-xl font-extrabold text-base tracking-wide uppercase text-white bg-[#81b64c] hover:bg-[#95c954] active:bg-[#6c9d3d] shadow-[0_4px_0_0_#457524] active:shadow-[0_1px_0_0_#457524] active:translate-y-[3px] transition-all flex items-center justify-center gap-3"
        >
          <span>Play vs {selectedBot.name}</span>
          <span className="text-lg">🤖</span>
        </button>

        {botNotification && (
          <div className="mt-3 p-2.5 bg-[#36322d] border border-[#81b64c]/40 rounded-xl text-center text-xs text-[#81b64c] font-bold">
            {botNotification}
          </div>
        )}
      </div>
    </div>
  );
}
