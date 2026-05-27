import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { AdminDeckSummary } from "../lib/api";
import type { DeckDetail } from "@siege/shared/types";

const FACTION_BADGE: Record<string, string> = {
  Monarch: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Invader: "bg-orange-600/20 text-orange-400 border border-orange-600/30",
};

function ExpandedDeck({ deckId }: { deckId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["decks", deckId],
    queryFn: () => api.decks.get(deckId),
  });

  if (isLoading) {
    return <p className="text-xs text-slate-500 dark:text-slate-400 py-2">Loading…</p>;
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 py-2">
      {(data as DeckDetail).cards.map((entry) => (
        <div
          key={entry.cardId}
          className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded px-2 py-1"
        >
          <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{entry.name}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-1">×{entry.quantity}</span>
        </div>
      ))}
    </div>
  );
}

function DeckRow({ deck }: { deck: AdminDeckSummary }) {
  const [expanded, setExpanded] = useState(false);
  const faction = deck.isMonarch ? "Monarch" : "Invader";
  const created = deck.createdAt
    ? new Date(deck.createdAt).toLocaleDateString()
    : "—";

  return (
    <>
      <tr
        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
          <span className="flex items-center gap-1.5">
            <span className={`transition-transform text-xs ${expanded ? "rotate-90" : ""}`}>▶</span>
            {deck.name}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{deck.ownerUsername}</td>
        <td className="px-4 py-3">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${FACTION_BADGE[faction]}`}>
            {faction}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 text-right">{deck.cardCount}</td>
        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 text-right">{deck.totalPoints}</td>
        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{created}</td>
      </tr>
      {expanded && (
        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <td colSpan={6} className="px-6">
            <ExpandedDeck deckId={deck.id} />
          </td>
        </tr>
      )}
    </>
  );
}

export function AdminDecksPage() {
  const { data: decks, isLoading } = useQuery({
    queryKey: ["admin", "decks"],
    queryFn: () => api.admin.decks.list(),
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex flex-col gap-1 mb-6">
        <Link to="/admin" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm">← Admin</Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Decks</h1>
      </div>

      {isLoading && (
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading…</p>
      )}

      {!isLoading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Owner</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Faction</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-right">Cards</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-right">Points</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Created</th>
              </tr>
            </thead>
            <tbody>
              {!decks?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No decks found.
                  </td>
                </tr>
              )}
              {decks?.map((deck) => (
                <DeckRow key={deck.id} deck={deck} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
