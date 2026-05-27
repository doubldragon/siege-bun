import { useDeckBuilderStore } from "../../store/deck-builder";

export function FactionToggle() {
  const { isMonarch, setFaction } = useDeckBuilderStore();

  return (
    <div className="flex gap-3 mb-6">
      <button
        onClick={() => setFaction(true)}
        className={`flex-1 py-4 rounded-lg border-2 font-semibold text-sm transition-colors ${
          isMonarch === true
            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
            : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400"
        }`}
      >
        ♛ Monarch
      </button>
      <button
        onClick={() => setFaction(false)}
        className={`flex-1 py-4 rounded-lg border-2 font-semibold text-sm transition-colors ${
          isMonarch === false
            ? "border-orange-600 bg-orange-600/10 text-orange-400"
            : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-orange-600/50 hover:text-orange-400"
        }`}
      >
        ⚔ Invader
      </button>
    </div>
  );
}
