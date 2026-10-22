import { useState } from "react";
import type { Game, Player, GameAnalysis } from "../types/game";
import { Chessboard } from "react-chessboard";
import PlayerCard from "./game-room/PlayerCard";
import MoveHistoryTable from "./game-room/MoveHistoryTable";
import MatchInfoPanel from "./game-room/MatchInfoPanel";
import GameControls, { IncomingDrawBanner } from "./game-room/GameControls";
import AnalysisBanner from "./game-room/AnalysisBanner";

type GameRoomProps = {
  game: Game;
  playerName: string;
  connectionState: string;
  onMove: (fromSquare: string, toSquare: string) => Promise<void>;
  onResign: () => Promise<void>;
  onOfferDraw: () => Promise<void>;
  onAcceptDraw: () => Promise<void>;
  onDeclineDraw: () => Promise<void>;
  onGameAnalysis: () => Promise<GameAnalysis>;
};

export default function GameRoom({
  game,
  playerName,
  connectionState,
  onMove,
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  onGameAnalysis,
}: GameRoomProps) {
  const [activeTab, setActiveTab] = useState<"moves" | "info">("moves");
  const [copiedLink, setCopiedLink] = useState(false);
  const [analysisData, setAnalysisData] = useState<GameAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Safely derive players from either game.players or backend player name fields
  const players: Player[] = game.players ?? [
    ...(game.white_player_name
      ? [{ name: game.white_player_name, color: "white" as const }]
      : []),
    ...(game.black_player_name
      ? [{ name: game.black_player_name, color: "black" as const }]
      : []),
    ...(!game.white_player_name && game.bot_color === "white"
      ? [
          {
            name: `Bot (${game.bot_difficulty ?? "AI"})`,
            color: "white" as const,
          },
        ]
      : []),
    ...(!game.black_player_name && game.bot_color === "black"
      ? [
          {
            name: `Bot (${game.bot_difficulty ?? "AI"})`,
            color: "black" as const,
          },
        ]
      : []),
  ];

  const localPlayer =
    players.find((player) => player.name === playerName) ??
    (game.white_player_name === playerName
      ? { name: playerName, color: "white" as const }
      : game.black_player_name === playerName
        ? { name: playerName, color: "black" as const }
        : game.bot_color
          ? {
              name:
                playerName ||
                (game.bot_color === "white"
                  ? game.black_player_name
                  : game.white_player_name) ||
                "Player",
              color:
                game.bot_color === "white"
                  ? ("black" as const)
                  : ("white" as const),
            }
          : undefined);

  const opponent = players.find((player) => player.name !== playerName);

  const isConnected = connectionState.toLowerCase() === "connected";
  const fenTurn = game.fen.split(" ")[1];
  const turnColor = fenTurn === "w" ? "white" : "black";

  // Disable moves if game is completed or it's not the player's turn
  const isGameActive = game.status === "active";
  const isBotGame = Boolean(game.bot_color);
  const isMyTurn =
    isGameActive &&
    (isBotGame || isConnected) &&
    localPlayer?.color === turnColor;
  const canMove = isMyTurn;

  // Draw offer state
  const opponentOfferedDraw =
    game.draw_offer !== null && game.draw_offer !== localPlayer?.color;
  const userOfferedDraw = game.draw_offer === localPlayer?.color;

  async function handleCopyRoomLink() {
    const inviteUrl = new URL(window.location.href);
    inviteUrl.searchParams.set("gameId", game.id);
    await navigator.clipboard.writeText(inviteUrl.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  async function handleRunAnalysis() {
    setIsLoadingAnalysis(true);
    try {
      const data = await onGameAnalysis();
      setAnalysisData(data);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }

  // Determine game outcome text
  function getOutcomeText() {
    if (!game.result) return null;
    const term = game.termination
      ? game.termination.replace("_", " ")
      : "normal";
    if (game.result === "white_won") {
      if (localPlayer?.color === "white")
        return { title: "You Won! 🏆", desc: `White won by ${term}` };
      if (localPlayer?.color === "black")
        return { title: "Defeat", desc: `White won by ${term}` };
      return { title: "White Won", desc: `By ${term}` };
    }
    if (game.result === "black_won") {
      if (localPlayer?.color === "black")
        return { title: "You Won! 🏆", desc: `Black won by ${term}` };
      if (localPlayer?.color === "white")
        return { title: "Defeat", desc: `Black won by ${term}` };
      return { title: "Black Won", desc: `By ${term}` };
    }
    return { title: "Draw 🤝", desc: `Game drawn by ${term}` };
  }

  const outcome = getOutcomeText();

  return (
    <div className="flex-1 flex flex-col font-sans antialiased">
      {/* Match Sub-bar (Share Room & Connection Status - No duplicate logo) */}
      <div className="border-b border-[#3d3935] bg-[#262421]/60 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Match:
            </span>
            <span className="font-mono text-xs text-white bg-[#1e1c1a] px-2 py-0.5 rounded border border-[#3d3935]">
              {game.id.slice(0, 8)}
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/30">
              {game.status === "active" ? "Live" : game.status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyRoomLink}
              title="Click to copy invite URL"
              className="flex items-center gap-2 bg-[#211f1c] hover:bg-[#2c2926] border border-[#3d3935] px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 transition-colors cursor-pointer"
            >
              <span>{copiedLink ? "✓ Link Copied" : "🔗 Share Room"}</span>
              <span className="font-mono text-[11px] text-stone-400 bg-[#262421] px-1.5 py-0.5 rounded border border-[#3d3935]">
                {game.id.slice(0, 6)}...
              </span>
            </button>

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
        </div>
      </div>

      {/* Main Playing Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full items-start justify-center">
          {/* LEFT: BOARD & OPPONENT/PLAYER PROFILES */}
          <div className="flex-1 w-full max-w-[560px] flex flex-col gap-3 mx-auto">
            {/* Opponent Profile Card (Top) */}
            <PlayerCard
              name={opponent?.name}
              color={opponent?.color}
              isTurn={turnColor === opponent?.color}
              isGameActive={isGameActive}
              isLocalPlayer={false}
              waitingMessage="Waiting for opponent..."
            />

            {/* Chessboard Card */}
            <div className="rounded-2xl overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.6)] border-2 border-[#3d3935] relative bg-[#262421] p-1.5">
              {/* Turn Banner Overlay Cue */}
              <div
                className={`mb-1.5 px-3 py-1 rounded-lg text-xs font-bold flex items-center justify-between ${
                  isMyTurn
                    ? "bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/30"
                    : "bg-[#1e1c1a] text-stone-400 border border-[#3d3935]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span>
                    {isGameActive
                      ? isMyTurn
                        ? "Your turn to move!"
                        : `Waiting for ${turnColor === "white" ? "White" : "Black"}...`
                      : "Game Over"}
                  </span>
                </div>
                <span className="font-mono uppercase text-[11px]">
                  Turn: {turnColor}
                </span>
              </div>

              {/* The Chessboard */}
              <div className="rounded-xl overflow-hidden relative">
                <Chessboard
                  options={{
                    position: game.fen,
                    boardOrientation: localPlayer?.color ?? "white",
                    allowDragging: canMove,
                    animationDurationInMs: 300,
                    darkSquareStyle: { backgroundColor: "#739552" },
                    lightSquareStyle: { backgroundColor: "#ebecd0" },
                    onPieceDrop: ({ sourceSquare, targetSquare }) => {
                      if (!sourceSquare || !targetSquare) return false;
                      setAnalysisData(null);
                      void onMove(sourceSquare, targetSquare);
                      return false;
                    },
                    arrows: analysisData?.best_move
                      ? [
                          {
                            startSquare: analysisData.best_move.slice(0, 2),
                            endSquare: analysisData.best_move.slice(2, 4),
                            color: "rgb(129, 182, 76)", // or "#81b64c"
                          },
                        ]
                      : [],
                  }}
                />
              </div>
            </div>

            {/* Local Player Profile Card (Bottom) */}
            <PlayerCard
              name={localPlayer?.name || playerName}
              color={localPlayer?.color}
              isTurn={isMyTurn}
              isGameActive={isGameActive}
              isLocalPlayer={true}
            />
          </div>

          {/* RIGHT: GAME CONTROLS & MOVE HISTORY SIDEBAR */}
          <div className="w-full lg:w-88 flex flex-col gap-4">
            <div className="bg-[#262421] rounded-2xl shadow-2xl border border-[#3d3935] overflow-hidden flex flex-col min-h-[500px]">
              {/* Sidebar Header Tabs */}
              <div className="bg-[#211f1c] p-2 border-b border-[#3d3935] flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("moves")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === "moves"
                      ? "bg-[#36322d] text-white shadow-sm border border-[#4d4842]"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  <span>📜</span>
                  <span>Moves ({game.moves.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("info")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === "info"
                      ? "bg-[#36322d] text-white shadow-sm border border-[#4d4842]"
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  <span>⚙️</span>
                  <span>Match Details</span>
                </button>
              </div>

              {/* Outcome or Turn Banner */}
              <div className="p-4 border-b border-[#3d3935]">
                {outcome ? (
                  <div className="p-4 bg-gradient-to-br from-[#2c2926] to-[#1e1c1a] border border-[#4a4642] rounded-xl text-center flex flex-col gap-1 shadow-inner">
                    <h3 className="text-white font-extrabold text-lg tracking-tight">
                      {outcome.title}
                    </h3>
                    <p className="text-xs text-[#81b64c] font-semibold uppercase tracking-wider">
                      {outcome.desc}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-[#1e1c1a] border border-[#3d3935] rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">
                        {turnColor === "white" ? "♔" : "♚"}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white capitalize leading-tight">
                          {turnColor}'s Turn
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {isMyTurn
                            ? "Drag piece to make your move"
                            : "Awaiting opponent"}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isMyTurn ? "bg-[#81b64c] animate-ping" : "bg-amber-400"
                      }`}
                    />
                  </div>
                )}

                {/* Incoming Draw Controls */}
                <IncomingDrawBanner
                  opponentOfferedDraw={opponentOfferedDraw}
                  isGameActive={isGameActive}
                  onAcceptDraw={onAcceptDraw}
                  onDeclineDraw={onDeclineDraw}
                />
               <AnalysisBanner
                    analysisData={analysisData}
                    onAnalyze={handleRunAnalysis}
                    isLoading={isLoadingAnalysis}
                    onClear={() => setAnalysisData(null)}
                  
                  />
              </div>

              {/* Tab 1: Standard Chess Notation Move History */}
              {activeTab === "moves" && <MoveHistoryTable moves={game.moves} />}

              {/* Tab 2: Match Information */}
              {activeTab === "info" && (
                <MatchInfoPanel game={game} playerName={playerName} />
              )}

              {/* Game Action Controls (Resign & Draw) */}
              <GameControls
                isGameActive={isGameActive}
                userOfferedDraw={userOfferedDraw}
                onOfferDraw={onOfferDraw}
                onResign={onResign}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#3d3935] bg-[#262421]/60 py-3 text-center text-xs text-stone-500">
        <p>Grandmaster Arena • Live Chess Match</p>
      </footer>
    </div>
  );
}
