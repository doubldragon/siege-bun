import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function DeckDetailPage() {
  const { id } = useParams({ from: "/decks/$id" });
  const { data: deck, isLoading, error } = useQuery({
    queryKey: ["deck", id],
    queryFn: () => api.decks.get(Number(id)),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Loading…</p>
      </div>
    );

  if (error || !deck)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-400">Deck not found.</p>
        <Link to="/" className="text-amber-400 hover:text-amber-300 text-sm">
          ← Back to Home
        </Link>
      </div>
    );

  const leader = deck.leader;
  const deckCards = deck.cards;

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/" className="text-slate-400 hover:text-white text-sm">
          ← Home
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{deck.name}</h1>
            <p className="text-slate-400 text-sm mt-1">by {deck.username}</p>
          </div>
          <span
            className={`text-sm font-medium px-3 py-1 rounded ${
              deck.isMonarch
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {deck.faction}
          </span>
        </div>

        <div className="text-slate-400 text-sm mb-4">
          {deck.totalPoints} / 75 pts
        </div>

        {leader && (
          <div className="border border-slate-700 rounded p-4 mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Leader</p>
            <h3 className="font-semibold text-white mb-1">{leader.name}</h3>
            <p className="text-sm text-slate-300 mb-1">
              <span className="text-slate-500">Action:</span> {leader.action}
            </p>
            <p className="text-sm text-slate-300 mb-2">
              <span className="text-slate-500">Effect:</span> {leader.effect}
            </p>
            <p className="text-xs text-slate-500 italic">{leader.flavorText}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Cards</p>
          <div className="space-y-1">
            {deckCards.map((entry) => (
              <div
                key={entry.cardId}
                className="flex items-center justify-between py-1 border-b border-slate-800 last:border-0"
              >
                <span className="text-sm text-slate-300">{entry.name}</span>
                <div className="flex items-center gap-3 text-sm text-slate-400 shrink-0">
                  {entry.deckPoints != null && (
                    <span>{entry.deckPoints}pt</span>
                  )}
                  <span>×{entry.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
