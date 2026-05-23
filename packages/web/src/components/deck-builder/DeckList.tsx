import type { Card } from "@siege/shared/types";
import { useDeckBuilderStore } from "../../store/deck-builder";
import { calcDeckPoints } from "@siege/shared/game-rules";
import { MAX_DECK_POINTS } from "@siege/shared/constants";

interface DeckListProps {
  cards: Card[];      // pool cards for display (no leaders/castles)
  allCards: Card[];   // all faction cards for accurate point total
}

export function DeckList({ cards, allCards }: DeckListProps) {
  const { entries, setEntry, removeEntry } = useDeckBuilderStore();

  const cardMap = new Map(cards.map((c) => [c.id, c]));
  const cardPointsById = new Map(allCards.map((c) => [c.id, c.deckPoints ?? 0]));
  const entriesArr = Array.from(entries.entries()).map(([cardId, quantity]) => ({
    cardId,
    quantity,
  }));

  const totalPoints = calcDeckPoints(entriesArr, cardPointsById);
  const pct = Math.min((totalPoints / MAX_DECK_POINTS) * 100, 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-500 uppercase tracking-wide">Deck</p>
        <p
          className={`text-sm font-semibold ${
            totalPoints > MAX_DECK_POINTS ? "text-red-400" : "text-slate-300"
          }`}
        >
          {totalPoints} / {MAX_DECK_POINTS} pts
        </p>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-1.5 mb-3">
        <div
          className={`h-1.5 rounded-full transition-all ${
            totalPoints > MAX_DECK_POINTS ? "bg-red-500" : "bg-amber-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {entriesArr.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">
          Add cards from the pool →
        </p>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {entriesArr.map(({ cardId, quantity }) => {
            const card = cardMap.get(cardId);
            if (!card) return null;
            return (
              <div
                key={cardId}
                className="flex items-center gap-2 py-1"
              >
                <span className="flex-1 text-sm text-slate-300 truncate">
                  {card.name}
                </span>
                <span className="text-xs text-slate-500 shrink-0">
                  {card.deckPoints != null ? `${card.deckPoints}pt` : ""}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEntry(cardId, quantity - 1)}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 text-white text-xs"
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-sm text-white">{quantity}</span>
                  <button
                    onClick={() => setEntry(cardId, quantity + 1)}
                    disabled={quantity >= 3}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeEntry(cardId)}
                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-700 hover:bg-red-900 text-slate-400 hover:text-red-400 text-xs ml-1"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
