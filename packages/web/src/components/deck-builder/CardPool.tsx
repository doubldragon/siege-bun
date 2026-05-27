import { useState } from "react";
import type { Card, CardTypeName } from "@siege/shared/types";
import { useDeckBuilderStore } from "../../store/deck-builder";
import { Modal } from "../Modal";
import { CardPreview } from "../CardPreview";

const TYPE_COLORS: Record<string, string> = {
  Leader: "text-emerald-400",
  Castle: "text-blue-400",
  Food: "text-green-400",
  Morale: "text-purple-400",
  "Siege Engine": "text-orange-400",
  "Siege Defense": "text-cyan-400",
  Espionage: "text-pink-400",
  Troops: "text-slate-400",
};

interface CardPoolProps {
  cards: Card[];
  allTypeNames: CardTypeName[];
}

export function CardPool({ cards, allTypeNames }: CardPoolProps) {
  const [previewCard, setPreviewCard] = useState<Card | null>(null);
  const {
    entries,
    searchText,
    typeFilters,
    setSearchText,
    toggleTypeFilter,
    clearTypeFilters,
    setEntry,
    leaderId,
    castleId,
  } = useDeckBuilderStore();

  const reservedIds = new Set([leaderId, castleId].filter(Boolean) as number[]);

  const visible = cards.filter((c) => {
    if (reservedIds.has(c.id)) return false;
    if (searchText && !c.name.toLowerCase().includes(searchText.toLowerCase()))
      return false;
    if (typeFilters.size > 0 && !typeFilters.has(c.typeName as CardTypeName))
      return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Search cards…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          onClick={clearTypeFilters}
          className={`text-xs px-2 py-1 rounded border transition-colors ${
            typeFilters.size === 0
              ? "border-slate-400 dark:border-slate-400 text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700"
              : "border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-slate-400 dark:hover:border-slate-500"
          }`}
        >
          All
        </button>
        {allTypeNames.map((type) => (
          <button
            key={type}
            onClick={() => toggleTypeFilter(type)}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              typeFilters.has(type)
                ? "border-slate-400 dark:border-slate-400 text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700"
                : "border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-slate-400 dark:hover:border-slate-500"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {visible.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No cards match.</p>
        ) : (
          visible.map((card) => {
            const qty = entries.get(card.id) ?? 0;
            return (
              <div
                key={card.id}
                className="flex items-center gap-3 p-2.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewCard(card)}
                      className="text-sm text-slate-900 dark:text-white font-medium truncate hover:text-sky-400 transition-colors text-left"
                    >
                      {card.name}
                    </button>
                    <span
                      className={`text-xs shrink-0 ${TYPE_COLORS[card.typeName] ?? "text-slate-400"}`}
                    >
                      {card.typeName}
                    </span>
                  </div>
                  {card.deckPoints != null && (
                    <span className="text-xs text-slate-500">{card.deckPoints} pts</span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEntry(card.id, qty - 1)}
                    disabled={qty === 0}
                    className="w-6 h-6 flex items-center justify-center rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 text-slate-800 dark:text-white text-sm"
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-sm text-slate-900 dark:text-white">{qty}</span>
                  <button
                    onClick={() => setEntry(card.id, qty + 1)}
                    disabled={qty >= 3}
                    className="w-6 h-6 flex items-center justify-center rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 text-slate-800 dark:text-white text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {previewCard && (
        <Modal onClose={() => setPreviewCard(null)}>
          <CardPreview card={previewCard} />
        </Modal>
      )}
    </div>
  );
}
