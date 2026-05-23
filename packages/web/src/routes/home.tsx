import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import { api } from "../lib/api";
import { DeckCard } from "../components/home/DeckCard";

function MyDecks() {
  const { data, isLoading } = useQuery({
    queryKey: ["decks", "mine"],
    queryFn: () => api.decks.list(),
  });

  if (isLoading) return <p className="text-slate-400 text-sm">Loading…</p>;
  if (!data?.length)
    return (
      <div className="text-center py-8 text-slate-400">
        <p className="mb-3">No decks yet.</p>
        <Link
          to="/deckbuilder"
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium px-4 py-2 rounded text-sm"
        >
          Build Your First Deck
        </Link>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((deck) => (
        <DeckCard key={deck.id} deck={deck} showActions />
      ))}
    </div>
  );
}

function RecentDecks() {
  const { data, isLoading } = useQuery({
    queryKey: ["decks", "recent"],
    queryFn: () => api.decks.recent(),
  });

  if (isLoading) return <p className="text-slate-400 text-sm">Loading…</p>;
  if (!data?.length)
    return <p className="text-slate-400 text-sm">No public decks yet.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((deck) => (
        <DeckCard key={deck.id} deck={deck} />
      ))}
    </div>
  );
}

export function HomePage() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
      {user ? (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">My Decks</h2>
            <Link
              to="/deckbuilder"
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium px-4 py-2 rounded text-sm"
            >
              + New Deck
            </Link>
          </div>
          <MyDecks />
        </section>
      ) : (
        <section className="text-center py-16">
          <h1 className="text-4xl font-bold text-amber-400 mb-3">Siege</h1>
          <p className="text-slate-400 mb-6 text-lg">Build your army. Lay siege.</p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/register"
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-6 py-2.5 rounded"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-2.5 rounded border border-slate-600"
            >
              Sign In
            </Link>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold text-white mb-4">Recent Decks</h2>
        <RecentDecks />
      </section>
    </main>
  );
}
