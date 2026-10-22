export type GameMode = "online" | "bot";

export type TimeControlPreset = {
  id: string;
  name: string;
  time: string;
  sublabel?: string;
  category: "bullet" | "blitz" | "rapid";
  isPopular?: boolean;
};

export type BotProfile = {
  id: string;
  name: string;
  rating: number;
  tier: "easy" | "medium" | "hard" | "Master" | "meduim";
  avatar: string;
  colorTheme: string;
  description: string;
  quote: string;
  badgeStyle?: string;
  tagline?: string;
};

export type BotConfig = {
  playerName: string;
  playerColor: "white" | "random" | "black";
  difficulty: "easy" | "medium" | "hard";
};

export type GameModeSelectionProps = {
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  gameId: string | null;
  onCreateGame: () => Promise<void> | void;
  onJoinGame: (gameId: string) => Promise<void> | void;
  onCreateComputerGame: (config: BotConfig) => Promise<void> | void;
};

export const TIME_CONTROLS: TimeControlPreset[] = [
  { id: "1m", name: "1 min", time: "Bullet", sublabel: "Bullet", category: "bullet" },
  { id: "2|1", name: "2 | 1", time: "Bullet", sublabel: "Bullet", category: "bullet" },
  { id: "3m", name: "3 min", time: "Blitz", sublabel: "Blitz", category: "blitz" },
  { id: "5m", name: "5 min", time: "Blitz", sublabel: "Blitz", category: "blitz", isPopular: true },
  { id: "10m", name: "10 min", time: "Rapid", sublabel: "Rapid", category: "rapid", isPopular: true },
  { id: "15|10", name: "15 | 10", time: "Rapid", sublabel: "Rapid", category: "rapid" },
];

export const BOTS: BotProfile[] = [
  {
    id: "martin",
    name: "Martin",
    rating: 250,
    tier: "easy",
    avatar: "🤖",
    colorTheme: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    badgeStyle: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    tagline: "Friendly Learner",
    description: "Friendly starter bot. Makes frequent mistakes and lets you explore ideas freely.",
    quote: "I'm still learning how the pieces move. Let's have a fun match!",
  },
  {
    id: "jimmy",
    name: "Jimmy",
    rating: 600,
    tier: "easy",
    avatar: "🧒",
    colorTheme: "border-teal-500/40 bg-teal-500/10 text-teal-400",
    badgeStyle: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    tagline: "Casual Junior",
    description: "Casual junior player. Knows basic checkmates and principles, but misses tactics.",
    quote: "Watch out for my knights! I like attacking early.",
  },
  {
    id: "nelson",
    name: "Nelson",
    rating: 1300,
    tier: "medium",
    avatar: "⚔️",
    colorTheme: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    badgeStyle: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    tagline: "Queen Attacker",
    description: "Aggressive tactical bot. Loves launching early queen attacks and sharp gambits.",
    quote: "My queen is already coming for your king. Can you defend?",
  },
  {
    id: "antonio",
    name: "Antonio",
    rating: 1500,
    tier: "medium",
    avatar: "🧐",
    colorTheme: "border-indigo-500/40 bg-indigo-500/10 text-indigo-400",
    badgeStyle: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    tagline: "Positional Master",
    description: "Solid positional club player. Values pawn structures and punishing blunders.",
    quote: "Strategy wins games. Every piece should have a clear purpose.",
  },
  {
    id: "isabel",
    name: "Isabel",
    rating: 1800,
    tier: "hard",
    avatar: "🎯",
    colorTheme: "border-purple-500/40 bg-purple-500/10 text-purple-400",
    badgeStyle: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    tagline: "Tactical Calculator",
    description: "Fierce calculation expert. Punishes positional mistakes with relentless combinations.",
    quote: "One imprecise move is all I need to seize the initiative.",
  },
  {
    id: "stockfish",
    name: "Komodo Grandmaster",
    rating: 2500,
    tier: "hard",
    avatar: "👑",
    colorTheme: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    badgeStyle: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    tagline: "Grandmaster Engine",
    description: "Maximum engine calculation depth. Ruthless positional and tactical mastery.",
    quote: "Evaluating millions of nodes per second. Zero margin for error.",
  },
];
