import { useDeckBuilderStore } from "../../store/deck-builder";

export function FactionToggle() {
  const { isMonarch, setFaction } = useDeckBuilderStore();

  return (
    <div className="flex gap-3 mb-6">
      <button
        onClick={() => setFaction(true)}
        className={`flex-1 py-4 rounded-lg border-2 font-semibold text-sm transition-colors ${
          isMonarch === true
            ? "border-amber-500 bg-amber-500/10 text-amber-400"
            : "border-slate-700 bg-slate-800 text-slate-400 hover:border-amber-500/50 hover:text-amber-400"
        }`}
      >
        ♛ Monarch
      </button>
      <button
        onClick={() => setFaction(false)}
        className={`flex-1 py-4 rounded-lg border-2 font-semibold text-sm transition-colors ${
          isMonarch === false
            ? "border-red-500 bg-red-500/10 text-red-400"
            : "border-slate-700 bg-slate-800 text-slate-400 hover:border-red-500/50 hover:text-red-400"
        }`}
      >
        ⚔ Invader
      </button>
    </div>
  );
}
