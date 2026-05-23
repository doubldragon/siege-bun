import { useState, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import { useDeckBuilderStore } from "../store/deck-builder";
import { api } from "../lib/api";
import { validateDeck } from "@siege/shared/game-rules";
import { CARD_TYPE_IDS } from "@siege/shared/constants";
import type { CardTypeName } from "@siege/shared/types";
import { FactionToggle } from "../components/deck-builder/FactionToggle";
import { LeaderSelector } from "../components/deck-builder/LeaderSelector";
import { CastleSelector } from "../components/deck-builder/CastleSelector";
import { DeckList } from "../components/deck-builder/DeckList";
import { CardPool } from "../components/deck-builder/CardPool";

export function DeckBuilderPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const {
    isMonarch,
    leaderId,
    castleId,
    entries,
    deckName,
    editingDeckId,
    setDeckName,
    reset,
  } = useDeckBuilderStore();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: cards = [] } = useQuery({
    queryKey: ["cards", isMonarch],
    queryFn: () =>
      isMonarch !== null ? api.cards.list(isMonarch) : Promise.resolve([]),
    enabled: isMonarch !== null,
  });

  // When editing, auto-detect the castle from the existing entries
  useEffect(() => {
    if (editingDeckId && isMonarch && castleId === null && cards.length > 0) {
      const castle = cards.find(
        (c) => c.typeId === CARD_TYPE_IDS.Castle && entries.has(c.id)
      );
      if (castle) useDeckBuilderStore.getState().setCastle(castle.id);
    }
  }, [cards]);

  const leaders = cards.filter((c) => c.typeId === CARD_TYPE_IDS.Leader);
  const castles = cards.filter((c) => c.typeId === CARD_TYPE_IDS.Castle);
  const poolCards = cards.filter(
    (c) => c.typeId !== CARD_TYPE_IDS.Leader && c.typeId !== CARD_TYPE_IDS.Castle
  );
  const allTypeNames = [
    ...new Set(poolCards.map((c) => c.typeName as CardTypeName)),
  ];

  const cardPointsById = new Map(cards.map((c) => [c.id, c.deckPoints ?? 0]));
  const cardTypeById = new Map(cards.map((c) => [c.id, c.typeId]));
  const entriesArr = Array.from(entries.entries()).map(([cardId, quantity]) => ({
    cardId,
    quantity,
  }));

  const validation =
    leaderId !== null && isMonarch !== null
      ? validateDeck({
          entries: entriesArr,
          leadId: leaderId,
          isMonarch,
          castleId: castleId ?? null,
          cardPointsById,
          cardTypeById,
        })
      : null;

  async function handleSave() {
    if (!leaderId || isMonarch === null || !deckName.trim()) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      const body = {
        name: deckName.trim(),
        leadId: leaderId,
        isMonarch,
        cards: entriesArr,
      };
      if (editingDeckId) {
        await api.decks.update(editingDeckId, body);
      } else {
        await api.decks.create(body);
      }
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      reset();
      navigate({ to: "/" });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  const canSave =
    !!leaderId &&
    !!deckName.trim() &&
    validation?.valid === true;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" onClick={reset} className="text-slate-400 hover:text-white text-sm">
          ← Home
        </Link>
        <h1 className="text-xl font-bold text-white">
          {editingDeckId ? "Edit Deck" : "New Deck"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:h-[calc(100vh-160px)]">
        {/* Left: Config panel */}
        <div className="lg:overflow-y-auto space-y-4">
          <FactionToggle />

          {isMonarch !== null && (
            <>
              <LeaderSelector leaders={leaders} />

              {isMonarch && <CastleSelector castles={castles} />}

              {leaderId && (
                <>
                  <div>
                    <label className="block text-xs text-slate-500 uppercase tracking-wide mb-1">
                      Deck Name
                    </label>
                    <input
                      type="text"
                      value={deckName}
                      onChange={(e) => setDeckName(e.target.value)}
                      placeholder="Name your deck…"
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <DeckList cards={poolCards} allCards={cards} />

                  {validation && !validation.valid && (
                    <div className="bg-red-900/30 border border-red-700 rounded p-3">
                      {validation.errors.map((e, i) => (
                        <p key={i} className="text-red-400 text-xs">
                          {e}
                        </p>
                      ))}
                    </div>
                  )}

                  {saveError && (
                    <p className="text-red-400 text-sm">{saveError}</p>
                  )}

                  {user ? (
                    <button
                      onClick={handleSave}
                      disabled={!canSave || isSaving}
                      className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-900 font-semibold py-2.5 rounded transition-colors"
                    >
                      {isSaving
                        ? "Saving…"
                        : editingDeckId
                        ? "Save Changes"
                        : "Save Deck"}
                    </button>
                  ) : (
                    <div className="border border-slate-700 rounded p-3 text-center space-y-2">
                      <p className="text-slate-400 text-sm">Sign in to save this deck</p>
                      <div className="flex gap-2">
                        <Link
                          to="/login"
                          className="flex-1 text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium py-1.5 rounded text-center"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          className="flex-1 text-sm bg-slate-700 hover:bg-slate-600 text-white py-1.5 rounded text-center"
                        >
                          Register
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {isMonarch === null && (
            <p className="text-slate-500 text-sm text-center py-4">
              Choose a faction to get started.
            </p>
          )}
        </div>

        {/* Right: Card pool */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col lg:overflow-hidden">
          {isMonarch === null ? (
            <div className="flex items-center justify-center flex-1">
              <p className="text-slate-500 text-sm">Choose a faction first.</p>
            </div>
          ) : (
            <CardPool cards={poolCards} allTypeNames={allTypeNames} />
          )}
        </div>
      </div>
    </main>
  );
}
