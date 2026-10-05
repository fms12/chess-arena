import { useState } from "react";

type GameControlsProps = {
  isGameActive: boolean;
  userOfferedDraw: boolean;
  opponentOfferedDraw: boolean;
  onOfferDraw: () => Promise<void>;
  onResign: () => Promise<void>;
  onAcceptDraw: () => Promise<void>;
  onDeclineDraw: () => Promise<void>;
};

export default function GameControls({
  isGameActive,
  userOfferedDraw,
  opponentOfferedDraw,
  onOfferDraw,
  onResign,
  onAcceptDraw,
  onDeclineDraw,
}: GameControlsProps) {
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  return (
    <div>
      {/* Incoming Draw Request Banner */}
      {opponentOfferedDraw && isGameActive && (
        <div className="mb-3 bg-[#2d2820] border border-amber-500/40 p-3 rounded-xl flex flex-col gap-2">
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

      {/* Draw and Resign Action Bar */}
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
            <div className="flex flex-col gap-2.5 bg-[#331e1d] p-3.5 rounded-xl border border-red-900/60">
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
  );
}
