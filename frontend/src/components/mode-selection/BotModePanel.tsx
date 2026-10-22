import { BOTS, type BotProfile } from "./types";
import { ColorSelector } from "./ColorSelector";

type BotModePanelProps = {
  selectedBotId: string;
  onSelectBotId: (id: string) => void;
  playerColor: "white" | "random" | "black";
  onSelectPlayerColor: (color: "white" | "random" | "black") => void;
  botGameType: "friendly" | "challenge";
  onSelectBotGameType: (type: "friendly" | "challenge") => void;
  botFilterTier: string;
  onSelectBotFilterTier: (tier: string) => void;
  onStartBot: () => void;
  botStartedToast: boolean;
};

export function BotModePanel({
  selectedBotId,
  onSelectBotId,
  playerColor,
  onSelectPlayerColor,
  botGameType,
  onSelectBotGameType,
  botFilterTier,
  onSelectBotFilterTier,
  onStartBot,
  botStartedToast,
}: BotModePanelProps) {
  const selectedBot = BOTS.find((b) => b.id === selectedBotId) ?? BOTS[0];

  const filteredBots: BotProfile[] =
    botFilterTier === "all"
      ? BOTS
      : BOTS.filter((b) => b.tier.toLowerCase() === botFilterTier.toLowerCase());

  return (
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
                onClick={() => onSelectBotFilterTier(tier)}
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
                onClick={() => onSelectBotId(bot.id)}
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
      <ColorSelector
        selectedColor={playerColor}
        onChange={onSelectPlayerColor}
      />

      {/* Bot Game Type (Assistance mode) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
          Assistance Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSelectBotGameType("friendly")}
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
            onClick={() => onSelectBotGameType("challenge")}
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
          onClick={onStartBot}
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
  );
}
