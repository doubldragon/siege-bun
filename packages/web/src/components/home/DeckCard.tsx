import { Link, useNavigate } from "@tanstack/react-router";
import type { DeckDetail } from "@siege/shared/types";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import { useDeckBuilderStore } from "../../store/deck-builder";
import { useQueryClient } from "@tanstack/react-query";

interface DeckCardProps {
  deck: DeckDetail;
  showActions?: boolean;
}

export function DeckCard({ deck, showActions = false }: DeckCardProps) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOwner = user?.id === deck.userId;

  async function handleDelete() {
    if (!confirm(`Delete "${deck.name}"?`)) return;
    await api.decks.delete(deck.id);
    queryClient.invalidateQueries({ queryKey: ["decks"] });
  }

  function handleEdit() {
    // Castle is detected in DeckBuilderPage once cards are loaded
    useDeckBuilderStore.getState().loadDeck({
      id: deck.id,
      name: deck.name,
      isMonarch: deck.isMonarch,
      leadId: deck.leadId,
      castleId: null,
      cards: deck.cards,
    });
    navigate({ to: "/deckbuilder" });
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <img src={deck.leader.typeIcon || ""} className="w-[75px] h-[75px] object-cover"/>
        </div>
        <div>
          <h3 className="font-semibold text-white">{deck.name}</h3>
          <p className="text-slate-400 text-sm">{deck.leader?.name ?? "No leader"}</p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded ${
            deck.isMonarch
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {deck.faction}
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span>{deck.totalPoints} / 75 pts</span>
        <span>·</span>
        <span>by {deck.username}</span>
      </div>

      <div className="flex gap-2 mt-auto">
        <Link
          to="/decks/$id"
          params={{ id: String(deck.id) }}
          className="flex-1 text-center text-sm bg-slate-700 hover:bg-slate-600 text-white rounded px-3 py-1.5 transition-colors"
        >
          View
        </Link>
        {showActions && isOwner && (
          <>
            <button
              onClick={handleEdit}
              className="flex-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded px-3 py-1.5 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-sm bg-red-900/50 hover:bg-red-900/80 text-red-400 rounded px-3 py-1.5 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
