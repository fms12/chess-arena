type ColorSelectorProps = {
  selectedColor: "white" | "random" | "black";
  onChange: (color: "white" | "random" | "black") => void;
};

export function ColorSelector({ selectedColor, onChange }: ColorSelectorProps) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
        Choose Color
      </label>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onChange("white")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-xs transition-all cursor-pointer ${
            selectedColor === "white"
              ? "bg-[#36322d] border-[#81b64c] text-white shadow-sm"
              : "bg-[#1e1c1a] border-[#36322d] text-stone-400 hover:text-stone-200"
          }`}
        >
          <span className="text-base">♔</span>
          <span>White</span>
        </button>
        <button
          type="button"
          onClick={() => onChange("random")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-xs transition-all cursor-pointer ${
            selectedColor === "random"
              ? "bg-[#36322d] border-[#81b64c] text-white shadow-sm"
              : "bg-[#1e1c1a] border-[#36322d] text-stone-400 hover:text-stone-200"
          }`}
        >
          <span className="text-base">☯</span>
          <span>Random</span>
        </button>
        <button
          type="button"
          onClick={() => onChange("black")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-xs transition-all cursor-pointer ${
            selectedColor === "black"
              ? "bg-[#36322d] border-[#81b64c] text-white shadow-sm"
              : "bg-[#1e1c1a] border-[#36322d] text-stone-400 hover:text-stone-200"
          }`}
        >
          <span className="text-base">♚</span>
          <span>Black</span>
        </button>
      </div>
    </div>
  );
}

