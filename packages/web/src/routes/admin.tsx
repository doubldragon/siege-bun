import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

const FACTION_BADGE: Record<string, string> = {
  Monarch: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Invader: "bg-orange-600/20 text-orange-400 border border-orange-600/30",
};

export function AdminDashboardPage() {
  const { data: decks, isLoading: decksLoading } = useQuery({
    queryKey: ["admin", "decks"],
    queryFn: () => api.admin.decks.list(),
  });

  const { data: popular, isLoading: popularLoading } = useQuery({
    queryKey: ["admin", "cards", "popular"],
    queryFn: () => api.admin.cards.popular(),
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin</h1>
        <Link
          to="/admin/play"
          className="bg-sky-500 hover:bg-sky-400 text-white font-medium px-4 py-2 rounded text-sm"
        >
          Play →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Decks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Decks</h2>
            <Link
              to="/admin/decks"
              className="text-sky-400 hover:text-sky-300 text-sm"
            >
              View all →
            </Link>
          </div>

          {decksLoading && (
            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading…</p>
          )}

          {!decksLoading && !decks?.length && (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No decks yet.</p>
          )}

          <div className="space-y-2">
            {decks?.slice(0, 10).map((deck) => {
              const faction = deck.isMonarch ? "Monarch" : "Invader";
              return (
                <div
                  key={deck.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{deck.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{deck.ownerUsername}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${FACTION_BADGE[faction]}`}>
                      {faction}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {deck.totalPoints} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Popular Cards */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Most Used Cards</h2>
            <Link
              to="/admin/cards"
              className="text-sky-400 hover:text-sky-300 text-sm"
            >
              Admin Cards →
            </Link>
          </div>

          {popularLoading && (
            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading…</p>
          )}

          {!popularLoading && !popular?.length && (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No data yet.</p>
          )}

          <div className="space-y-2">
            {popular?.map(({ card, deckCount }) => (
              <div
                key={card.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{card.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{card.typeName}</p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-2 whitespace-nowrap">
                  {deckCount} {deckCount === 1 ? "deck" : "decks"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
