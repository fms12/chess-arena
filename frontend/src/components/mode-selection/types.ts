export type GameMode = "online" | "bot";

export type TimeControlPreset = {
  id: string;
  name: string;
  sublabel: string;
  category: "bullet" | "blitz" | "rapid";
  isPopular?: boolean;
};

export type BotProfile = {
  id: string;
  name: string;
  rating: number;
  tier: "Beginner" | "Intermediate" | "Advanced" | "Master";
  avatar: string;
  badgeStyle: string;
  tagline: string;
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

export const TIME_CONTROLS: TimeControlPreset[] = [
  { id: "1m", name: "1 min", sublabel: "Bullet", category: "bullet" },
  { id: "2|1", name: "2 | 1", sublabel: "Bullet", category: "bullet" },
  { id: "3m", name: "3 min", sublabel: "Blitz", category: "blitz" },
  { id: "5m", name: "5 min", sublabel: "Blitz", category: "blitz", isPopular: true },
  { id: "10m", name: "10 min", sublabel: "Rapid", category: "rapid", isPopular: true },
  { id: "15|10", name: "15 | 10", sublabel: "Rapid", category: "rapid" },
];

export const BOTS: BotProfile[] = [
  {
    id: "martin",
    name: "Martin",
    rating: 250,
    tier: "Beginner",
    avatar: "🤖",
    badgeStyle: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    tagline: "Friendly Learner",
    description: "Makes frequent tactical oversights and lets you explore attacks freely.",
    quote: "I'm still learning how the pieces move. Let's have fun!",
  },
  {
    id: "jimmy",
    name: "Jimmy",
    rating: 600,
    tier: "Beginner",
    avatar: "🧒",
    badgeStyle: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    tagline: "Casual Junior",
    description: "Knows basic checkmates and principles, but still misses tactical tricks.",
    quote: "Watch out for my knights! I like jumping them early.",
  },
  {
    id: "nelson",
    name: "Nelson",
    rating: 1300,
    tier: "Intermediate",
    avatar: "⚔️",
    badgeStyle: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    tagline: "Queen Attacker",
    description: "Aggressive tactical bot. Loves launching early queen raids and sharp gambits.",
    quote: "My queen is on the prowl. Can you defend your king?",
  },
  {
    id: "antonio",
    name: "Antonio",
    rating: 1500,
    tier: "Intermediate",
    avatar: "🧐",
    badgeStyle: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    tagline: "Positional Master",
    description: "Solid strategic play. Values strong pawn structures and punishing blunders.",
    quote: "Strategy wins games. Every piece should have a purpose.",
  },
  {
    id: "isabel",
    name: "Isabel",
    rating: 1800,
    tier: "Advanced",
    avatar: "🎯",
    badgeStyle: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    tagline: "Tactical Calculator",
    description: "Deep calculation. Punishes any positional mistake with relentless combinations.",
    quote: "One imprecise move is all I need to seize the win.",
  },
  {
    id: "komodo",
    name: "Komodo Master",
    rating: 2500,
    tier: "Master",
    avatar: "👑",
    badgeStyle: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    tagline: "Grandmaster AI",
    description: "Grandmaster engine calculation depth with near-zero positional error.",
    quote: "Evaluating millions of nodes per second. Zero mercy.",
  },
];
