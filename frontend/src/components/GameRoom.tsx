import { useState } from "react";
import type { Game } from "../types/game";
import { Chessboard } from "react-chessboard";

type GameRoomProps = {
  game: Game;
  playerName: string;
  connectionState: string;
  onMove: (fromSquare: string, toSquare: string) => Promise<void>;
  onResign: () => Promise<void>;
  onOfferDraw: () => Promise<void>;
  onAcceptDraw: () => Promise<void>;
  onDeclineDraw: () => Promise<void>;
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
}: GameRoomProps) {
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"moves" | "info">("moves");
  const [copiedLink, setCopiedLink] = useState(false);

  const localPlayer = game.players.find((player) => player.name === playerName);
  const opponent = game.players.find((player) => player.name !== playerName);

  const isConnected = connectionState.toLowerCase() === "connected";
  const fenTurn = game.fen.split(" ")[1];
  const turnColor = fenTurn === "w" ? "white" : "black";

  // Disable moves if game is completed or it's not the player's turn
  const isGameActive = game.status === "active";
  const isMyTurn =
    isGameActive && isConnected && localPlayer?.color === turnColor;
  const canMove = isMyTurn;

  // Draw offer state
  const opponentOfferedDraw =
    game.draw_offer !== null && game.draw_offer !== localPlayer?.color;
  const userOfferedDraw = game.draw_offer === localPlayer?.color;

  // Format move history into standard chess pairs (e.g. 1. e4 e5)
  const movePairs: { number: number; white: string; black?: string }[] = [];
  for (let i = 0; i < game.moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: game.moves[i].san,
      black: game.moves[i + 1]?.san,
    });
  }

  async function handleCopyRoomLink() {
    const inviteUrl = new URL(window.location.href);
    inviteUrl.searchParams.set("gameId", game.id);
    await navigator.clipboard.writeText(inviteUrl.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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
          {/* ========================================================= */}
          {/* LEFT: BOARD & OPPONENT/PLAYER PROFILES                    */}
          {/* ========================================================= */}
          <div className="flex-1 w-full max-w-[560px] flex flex-col gap-3 mx-auto">
            {/* Opponent Profile Card (Top) */}
            <div
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                turnColor === opponent?.color && isGameActive
                  ? "bg-[#262421] border-[#81b64c]/50 shadow-[0_0_12px_rgba(129,182,76,0.15)]"
                  : "bg-[#262421] border-[#3d3935]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#211f1c] border border-[#3d3935] rounded-xl flex items-center justify-center font-bold text-white shadow-inner text-base">
                  {opponent ? opponent.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white leading-tight">
                      {opponent?.name || "Waiting for opponent..."}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-stone-400">
                      1500
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-stone-400">
                      {opponent?.color === "white"
                        ? "Playing White ♔"
                        : "Playing Black ♚"}
                    </span>
                    {turnColor === opponent?.color && isGameActive && (
                      <span className="text-[10px] font-bold text-[#81b64c] bg-[#81b64c]/10 px-1.5 py-0.5 rounded animate-pulse">
                        Thinking...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Opponent Status Indicator */}
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-stone-300 bg-[#1e1c1a] px-3 py-1.5 rounded-lg border border-[#3d3935]">
                  {turnColor === opponent?.color && isGameActive
                    ? "Active"
                    : "Ready"}
                </div>
              </div>
            </div>

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
                    darkSquareStyle: { backgroundColor: "#739552" },
                    lightSquareStyle: { backgroundColor: "#ebecd0" },
                    onPieceDrop: ({ sourceSquare, targetSquare }) => {
                      if (!sourceSquare || !targetSquare) return false;
                      void onMove(sourceSquare, targetSquare);
                      return false;
                    },
                  }}
                />
              </div>
            </div>

            {/* Local Player Profile Card (Bottom) */}
            <div
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isMyTurn
                  ? "bg-[#262421] border-[#81b64c] shadow-[0_0_15px_rgba(129,182,76,0.25)]"
                  : "bg-[#262421] border-[#3d3935]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#81b64c]/30 to-[#608b35]/20 border border-[#81b64c]/40 rounded-xl flex items-center justify-center font-bold text-[#81b64c] shadow-inner text-base">
                  {localPlayer?.name?.charAt(0).toUpperCase() ||
                    playerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white leading-tight">
                      {localPlayer?.name || playerName} (You)
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-stone-400">
                      1500
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-stone-400">
                      {localPlayer?.color === "white"
                        ? "Playing White ♔"
                        : "Playing Black ♚"}
                    </span>
                    {isMyTurn && (
                      <span className="text-[10px] font-bold text-[#81b64c] bg-[#81b64c]/15 px-2 py-0.5 rounded border border-[#81b64c]/30">
                        Your Turn!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Local Player Status Pill */}
              <div className="text-right">
                <div
                  className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border ${
                    isMyTurn
                      ? "bg-[#81b64c] text-white border-[#81b64c] shadow-md"
                      : "bg-[#1e1c1a] text-stone-300 border-[#3d3935]"
                  }`}
                >
                  {isMyTurn ? "Your Move" : "Waiting"}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: GAME CONTROLS & MOVE HISTORY SIDEBAR               */}
          {/* ========================================================= */}
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
                {opponentOfferedDraw && isGameActive && (
                  <div className="mt-3 bg-[#2d2820] border border-amber-500/40 p-3 rounded-xl flex flex-col gap-2">
                    <span className="text-xs text-center text-amber-200 font-semibold">
                      🤝 Opponent offered a draw. Accept?
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={onAcceptDraw}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Accept Draw
                      </button>
                      <button
                        type="button"
                        onClick={onDeclineDraw}
                        className="flex-1 bg-[#3b3835] hover:bg-[#4a4642] text-stone-300 text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tab 1: Standard Chess Notation Move History */}
              {activeTab === "moves" && (
                <div className="flex-1 flex flex-col min-h-[240px] max-h-[360px] overflow-hidden">
                  <div className="grid grid-cols-12 px-4 py-2 bg-[#211f1c] text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-[#3d3935]">
                    <span className="col-span-2">#</span>
                    <span className="col-span-5">White</span>
                    <span className="col-span-5">Black</span>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-[#3d3935]/40 font-mono text-xs">
                    {movePairs.map((pair, idx) => {
                      const isLatest = idx === movePairs.length - 1;
                      return (
                        <div
                          key={pair.number}
                          className={`grid grid-cols-12 px-4 py-2 hover:bg-[#2c2926] transition-colors ${
                            isLatest
                              ? "bg-[#81b64c]/10 text-white font-bold"
                              : "text-stone-300"
                          }`}
                        >
                          <span className="col-span-2 text-stone-500 font-sans">
                            {pair.number}.
                          </span>
                          <span className="col-span-5 tracking-wide">
                            {pair.white}
                          </span>
                          <span className="col-span-5 tracking-wide">
                            {pair.black || ""}
                          </span>
                        </div>
                      );
                    })}

                    {movePairs.length === 0 && (
                      <div className="h-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center text-stone-500 font-sans">
                        <span className="text-3xl mb-2 opacity-40">♟</span>
                        <p className="text-xs font-medium">Game in progress</p>
                        <p className="text-[11px] text-stone-600 mt-0.5">
                          White makes the opening move
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Match Information */}
              {activeTab === "info" && (
                <div className="flex-1 p-4 space-y-3 font-sans text-xs">
                  <div className="bg-[#1e1c1a] p-3 rounded-xl border border-[#3d3935] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Match ID:</span>
                      <span className="font-mono text-white font-bold">
                        {game.id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Status:</span>
                      <span className="capitalize font-bold text-[#81b64c]">
                        {game.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Total Moves:</span>
                      <span className="font-bold text-white">
                        {game.moves.length}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#1e1c1a] p-3 rounded-xl border border-[#3d3935] space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Participants
                    </div>
                    {game.players.map((p) => (
                      <div
                        key={p.name}
                        className="flex justify-between items-center py-1 text-xs"
                      >
                        <span className="font-medium text-white flex items-center gap-1.5">
                          <span>{p.color === "white" ? "♔" : "♚"}</span>
                          <span>{p.name}</span>
                          {p.name === playerName && (
                            <span className="text-[10px] text-[#81b64c]">
                              (You)
                            </span>
                          )}
                        </span>
                        <span className="capitalize text-stone-400 text-[11px]">
                          {p.color}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Game Action Controls (Resign & Draw) */}
              {isGameActive && (
                <div className="p-4 border-t border-[#3d3935] bg-[#211f1c]">
                  {!showResignConfirm ? (
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={onOfferDraw}
                        disabled={userOfferedDraw}
                        className="flex-1 bg-[#36322d] hover:bg-[#45413b] disabled:opacity-50 text-stone-200 font-bold py-2.5 rounded-xl text-xs transition-colors border border-[#4d4842] shadow-sm cursor-pointer"
                      >
                        {userOfferedDraw ? "Draw Offered 🤝" : "Offer Draw 🤝"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResignConfirm(true)}
                        className="flex-1 bg-[#4a2624] hover:bg-[#5c2f2d] text-red-200 font-bold py-2.5 rounded-xl text-xs transition-colors border border-red-900/60 shadow-sm cursor-pointer"
                      >
                        Resign 🏳️
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5 bg-[#331e1d] p-3.5 rounded-xl border border-red-900/60 animate-fadeIn">
                      <span className="text-xs text-center text-red-200 font-bold">
                        Are you sure you want to resign the game?
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={onResign}
                          className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow cursor-pointer"
                        >
                          Yes, Resign
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowResignConfirm(false)}
                          className="flex-1 bg-[#3b3835] hover:bg-[#4a4642] text-stone-300 font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
