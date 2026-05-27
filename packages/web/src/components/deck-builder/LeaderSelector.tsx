import type { Card } from "@siege/shared/types";
import { useDeckBuilderStore } from "../../store/deck-builder";

interface LeaderSelectorProps {
  leaders: Card[];
}

export function LeaderSelector({ leaders }: LeaderSelectorProps) {
  const { leaderId, setLeader } = useDeckBuilderStore();

  return (
    <div className="mb-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Choose Leader</p>
      <div className="grid grid-cols-1 gap-2">
        {leaders.map((card) => (
          <button
            key={card.id}
            onClick={() => setLeader(card.id)}
            className={`text-left p-3 rounded border transition-colors ${
              leaderId === card.id
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <p className="font-medium text-slate-900 dark:text-white text-sm">{card.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{card.action}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
