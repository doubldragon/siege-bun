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

  if (isLoading) return <p className="text-slate-500 dark:text-slate-400 text-sm">Loading…</p>;
  if (!data?.length)
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p className="mb-3">No decks yet.</p>
        <Link
          to="/deckbuilder"
          className="bg-sky-500 hover:bg-sky-400 text-white font-medium px-4 py-2 rounded text-sm"
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

  if (isLoading) return <p className="text-slate-500 dark:text-slate-400 text-sm">Loading…</p>;
  if (!data?.length)
    return <p className="text-slate-500 dark:text-slate-400 text-sm">No public decks yet.</p>;

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
        <p className="text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="relative flex items-center justify-center min-h-[calc(100vh-56px)]"
        style={{ backgroundImage: "url('/img/castle-bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0" />
        <div className="relative z-10 flex flex-col items-center gap-8 p-6 text-center bg-white/70 rounded h-[25vh] w-[50%]">
          <img src="/img/siege-splash.png" alt="Siege" className="max-w-xs w-full drop-shadow-2xl" />
          <div className="flex gap-3">
            <Link
              to="/deckbuilder"
              className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-2.5 rounded shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-slate-900/70 hover:bg-slate-800 text-white font-medium px-6 py-2.5 rounded border border-slate-500 shadow-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Decks</h2>
          <Link
            to="/deckbuilder"
            className="bg-sky-500 hover:bg-sky-400 text-white font-medium px-4 py-2 rounded text-sm"
          >
            + New Deck
          </Link>
        </div>
        <MyDecks />
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Decks</h2>
        <RecentDecks />
      </section>
    </main>
  );
}
