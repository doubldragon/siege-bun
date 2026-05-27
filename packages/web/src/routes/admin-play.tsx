import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api, type AdminDeckSummary } from "../lib/api";
import type { Card, DeckDetail } from "@siege/shared/types";
import { CARD_TYPE_IDS } from "@siege/shared/constants";
import { CardPreview } from "../components/CardPreview";
import { DroppableBoardZone, zoneId } from "../components/play/DroppableBoardZone";
import type { PlacedCard, DragData, Faction } from "../components/play/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlayState {
  monarchDeck: DeckDetail | null;
  invaderDeck: DeckDetail | null;
  monarchHand: number[];
  monarchDrawPile: number[];
  invaderHand: number[];
  invaderDrawPile: number[];
  board: PlacedCard[];
  laneCount: number;
  cardMap: Map<number, Card>;
  castleCard: Card | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const INITIAL: PlayState = {
  monarchDeck: null,
  invaderDeck: null,
  monarchHand: [],
  monarchDrawPile: [],
  invaderHand: [],
  invaderDrawPile: [],
  board: [],
  laneCount: 3,
  cardMap: new Map(),
  castleCard: null,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(deck: DeckDetail, exclude: Set<number> = new Set()): number[] {
  const all: number[] = [];
  for (const entry of deck.cards) {
    if (entry.cardId === deck.leadId || exclude.has(entry.cardId)) continue;
    for (let q = 0; q < entry.quantity; q++) all.push(entry.cardId);
  }
  return all;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SortableCard({
  id,
  card,
  faction,
  handIndex,
}: {
  id: string;
  card: Card;
  faction: Faction;
  handIndex: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id,
      data: {
        cardId: card.id,
        faction,
        fromHand: true,
        handIndex,
        sourceLane: null,
        sourceRow: 0,
      } satisfies DragData,
    });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing shrink-0 ${isDragging ? "opacity-40" : ""}`}
    >
      <CardPreview card={card} scale={0.6} noWrapper />
    </div>
  );
}

function DrawPile({
  count,
  canDraw,
  faction,
  onDraw,
}: {
  count: number;
  canDraw: boolean;
  faction: Faction;
  onDraw: () => void;
}) {
  const isMonarch = faction === "Monarch";
  const border = isMonarch ? "border-emerald-700" : "border-orange-800";
  const bg = isMonarch ? "bg-emerald-950" : "bg-orange-950";
  const countColor = isMonarch ? "text-emerald-300" : "text-orange-300";

  return (
    <button
      onClick={onDraw}
      disabled={!canDraw}
      title={canDraw ? "Draw a card" : count === 0 ? "Deck empty" : "Hand is full"}
      className={`shrink-0 w-14 rounded-lg border-2 ${border} ${bg} flex flex-col items-center justify-center gap-1 py-3 transition-all ${
        canDraw ? "hover:brightness-125 cursor-pointer" : "opacity-40 cursor-not-allowed"
      }`}
    >
      <div className={`w-8 h-11 rounded border-2 ${border} flex items-center justify-center`}>
        <div className={`w-5 h-7 rounded border border-dashed ${border}`} />
      </div>
      <span className={`text-[11px] font-bold ${countColor}`}>{count}</span>
    </button>
  );
}

function HandRow({
  hand,
  drawPile,
  faction,
  cardMap,
  onDraw,
}: {
  hand: number[];
  drawPile: number[];
  faction: Faction;
  cardMap: Map<number, Card>;
  onDraw: () => void;
}) {
  const label = faction === "Monarch" ? "Monarch Hand" : "Invader Hand";
  const labelColor = faction === "Monarch" ? "text-emerald-400" : "text-orange-400";
  const bg =
    faction === "Monarch"
      ? "bg-emerald-950/30 border-emerald-900"
      : "bg-orange-950/30 border-orange-900";

  const handIds = hand.map((_, i) => `hand-${faction}-${i}`);

  return (
    <div className={`rounded-lg border p-3 ${bg}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${labelColor}`}>
        {label} ({hand.length}/5)
      </p>
      <div className="flex gap-3 items-start">
        {/* Scrollable card area */}
        <div className="flex-1 overflow-x-auto">
          <SortableContext items={handIds} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-3 pb-1">
              {hand.length === 0 && (
                <p className="text-xs text-slate-500 py-8 px-2">Empty</p>
              )}
              {hand.map((cardId, i) => {
                const card = cardMap.get(cardId);
                if (!card) return null;
                return (
                  <SortableCard
                    key={handIds[i]}
                    id={handIds[i]}
                    card={card}
                    faction={faction}
                    handIndex={i}
                  />
                );
              })}
            </div>
          </SortableContext>
        </div>
        {/* Draw pile pinned to right */}
        <DrawPile
          count={drawPile.length}
          canDraw={hand.length < 5 && drawPile.length > 0}
          faction={faction}
          onDraw={onDraw}
        />
      </div>
    </div>
  );
}

function DeckPicker({
  monarchDecks,
  invaderDecks,
  monarchDeckId,
  invaderDeckId,
  onMonarch,
  onInvader,
  onLoad,
  loading,
}: {
  monarchDecks: AdminDeckSummary[];
  invaderDecks: AdminDeckSummary[];
  monarchDeckId: number | null;
  invaderDeckId: number | null;
  onMonarch: (id: number | null) => void;
  onInvader: (id: number | null) => void;
  onLoad: () => void;
  loading: boolean;
}) {
  const sel =
    "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-4">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
        Load Decks
      </p>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500 dark:text-slate-400">Monarch Deck</label>
          <select
            className={sel}
            value={monarchDeckId ?? ""}
            onChange={(e) => onMonarch(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— choose —</option>
            {monarchDecks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.ownerUsername})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500 dark:text-slate-400">Invader Deck</label>
          <select
            className={sel}
            value={invaderDeckId ?? ""}
            onChange={(e) => onInvader(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— choose —</option>
            {invaderDecks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.ownerUsername})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onLoad}
          disabled={!monarchDeckId || !invaderDeckId || loading}
          className="bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded text-sm"
        >
          {loading ? "Loading…" : "Load Decks"}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function AdminPlayPage() {
  const [state, setState] = useState<PlayState>(INITIAL);
  const [monarchDeckId, setMonarchDeckId] = useState<number | null>(null);
  const [invaderDeckId, setInvaderDeckId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDrag, setActiveDrag] = useState<DragData | null>(null);

  const { data: adminDecks = [] } = useQuery({
    queryKey: ["admin", "decks"],
    queryFn: () => api.admin.decks.list(),
  });

  const monarchDecks = adminDecks.filter((d) => d.isMonarch);
  const invaderDecks = adminDecks.filter((d) => !d.isMonarch);
  const loaded = !!(state.monarchDeck && state.invaderDeck);

  async function handleLoad() {
    if (!monarchDeckId || !invaderDeckId) return;
    setLoading(true);
    try {
      const [mDeck, iDeck, monarchCards, invaderCards] = await Promise.all([
        api.decks.get(monarchDeckId),
        api.decks.get(invaderDeckId),
        api.cards.list(true),
        api.cards.list(false),
      ]);

      const cardMap = new Map<number, Card>([
        ...monarchCards.map((c) => [c.id, c] as [number, Card]),
        ...invaderCards.map((c) => [c.id, c] as [number, Card]),
      ]);

      const castleCardId = mDeck.cards.find((e) =>
        monarchCards.find((c) => c.id === e.cardId && c.typeId === CARD_TYPE_IDS.Castle)
      )?.cardId;
      const castleCard = castleCardId ? (cardMap.get(castleCardId) ?? null) : null;
      const lanes = castleCard?.sides ?? 3;

      const castleExclude = castleCardId ? new Set([castleCardId]) : new Set<number>();
      const mAll = shuffle(buildDeck(mDeck, castleExclude));
      const iAll = shuffle(buildDeck(iDeck));

      setState({
        monarchDeck: mDeck,
        invaderDeck: iDeck,
        monarchHand: mAll.slice(0, 5),
        monarchDrawPile: mAll.slice(5),
        invaderHand: iAll.slice(0, 5),
        invaderDrawPile: iAll.slice(5),
        board: [],
        laneCount: lanes,
        cardMap,
        castleCard,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    if (!state.monarchDeck || !state.invaderDeck) return;
    const mAll = shuffle(buildDeck(state.monarchDeck));
    const iAll = shuffle(buildDeck(state.invaderDeck));
    setState((prev) => ({
      ...prev,
      monarchHand: mAll.slice(0, 5),
      monarchDrawPile: mAll.slice(5),
      invaderHand: iAll.slice(0, 5),
      invaderDrawPile: iAll.slice(5),
      board: [],
    }));
  }

  function drawCard(faction: Faction) {
    setState((prev) => {
      const hand = faction === "Monarch" ? prev.monarchHand : prev.invaderHand;
      const pile = faction === "Monarch" ? prev.monarchDrawPile : prev.invaderDrawPile;
      if (hand.length >= 5 || pile.length === 0) return prev;
      const [drawn, ...remaining] = pile;
      return faction === "Monarch"
        ? { ...prev, monarchHand: [...prev.monarchHand, drawn], monarchDrawPile: remaining }
        : { ...prev, invaderHand: [...prev.invaderHand, drawn], invaderDrawPile: remaining };
    });
  }

  function onDragStart(event: DragStartEvent) {
    setActiveDrag(event.active.data.current as DragData);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDrag(null);
    if (!over) return;

    const drag = active.data.current as DragData;
    const overId = over.id as string;

    // Hand reorder — over is another hand card
    if (overId.startsWith("hand-")) {
      const parts = overId.split("-"); // ["hand", faction, index]
      const overFaction = parts[1] as Faction;
      const overIndex = Number(parts[2]);
      if (!drag.fromHand || drag.faction !== overFaction) return;
      setState((prev) => {
        const hand = drag.faction === "Monarch" ? [...prev.monarchHand] : [...prev.invaderHand];
        const newHand = arrayMove(hand, drag.handIndex, overIndex);
        return drag.faction === "Monarch"
          ? { ...prev, monarchHand: newHand }
          : { ...prev, invaderHand: newHand };
      });
      return;
    }

    // Board drop — validate same-source
    if (!drag.fromHand) {
      if (zoneId(drag.faction, drag.sourceLane, drag.sourceRow) === overId) return;
    }

    const parts = overId.split("-");
    const targetFaction = parts[0] as Faction;
    if (drag.faction !== targetFaction) return;
    const targetLane = parts[1] === "court" ? null : Number(parts[1]);
    const targetRow = Number(parts[2]);

    const zoneCount = state.board.filter(
      (pc) => pc.faction === targetFaction && pc.laneIndex === targetLane && pc.rowIndex === targetRow
    ).length;
    if (zoneCount >= 3) return;

    setState((prev) => {
      const monarchHand = [...prev.monarchHand];
      const invaderHand = [...prev.invaderHand];
      let board = [...prev.board];

      if (drag.fromHand) {
        if (drag.faction === "Monarch") monarchHand.splice(drag.handIndex, 1);
        else invaderHand.splice(drag.handIndex, 1);
      } else {
        const idx = board.findIndex(
          (pc) =>
            pc.cardId === drag.cardId &&
            pc.faction === drag.faction &&
            pc.laneIndex === drag.sourceLane &&
            pc.rowIndex === drag.sourceRow
        );
        if (idx !== -1) board.splice(idx, 1);
      }

      board = [
        ...board,
        { cardId: drag.cardId, faction: drag.faction, laneIndex: targetLane, rowIndex: targetRow },
      ];

      return { ...prev, monarchHand, invaderHand, board };
    });
  }

  const lanes = Array.from({ length: state.laneCount }, (_, i) => i);
  // card layout width (256 * 0.45) + zone border (4px) + zone padding (12px)
  const LANE_COL_PX = Math.ceil(256 * 0.45) + 16;
  const cols = `repeat(${state.laneCount}, ${LANE_COL_PX}px)`;
  const boardWidth = state.laneCount * LANE_COL_PX + (state.laneCount - 1) * 4;
  const courtyardWidth = Math.max(1, state.laneCount - 2);
  const courtyardStart = Math.floor((state.laneCount - courtyardWidth) / 2) + 1;

  function zoneCards(faction: Faction, laneIndex: number | null, rowIndex: number) {
    return state.board.filter(
      (pc) => pc.faction === faction && pc.laneIndex === laneIndex && pc.rowIndex === rowIndex
    );
  }

  const activeCard = activeDrag ? state.cardMap.get(activeDrag.cardId) : null;

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex flex-col gap-1 mb-4">
        <Link
          to="/admin"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm"
        >
          ← Admin
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Play</h1>
          {loaded && (
            <button
              onClick={handleReset}
              className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-sm font-medium px-4 py-2 rounded"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <DeckPicker
        monarchDecks={monarchDecks}
        invaderDecks={invaderDecks}
        monarchDeckId={monarchDeckId}
        invaderDeckId={invaderDeckId}
        onMonarch={setMonarchDeckId}
        onInvader={setInvaderDeckId}
        onLoad={handleLoad}
        loading={loading}
      />

      {loaded && (
        <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="space-y-2">
            {/* Invader hand */}
            <HandRow
              hand={state.invaderHand}
              drawPile={state.invaderDrawPile}
              faction="Invader"
              cardMap={state.cardMap}
              onDraw={() => drawCard("Invader")}
            />

            {/* Board — centered to card width */}
            <div className="space-y-2 mx-auto" style={{ width: boardWidth }}>

            {/* Column headers */}
            <div className="grid gap-1 px-0.5" style={{ gridTemplateColumns: cols }}>
              {lanes.map((i) => (
                <p key={i} className="text-[10px] text-slate-500 uppercase tracking-wide text-center">
                  Lane {i}
                </p>
              ))}
            </div>

            {/* Invader board — rows 3 down to 0 */}
            {[3, 2, 1, 0].map((rowIndex) => (
              <div key={rowIndex} className="grid gap-1" style={{ gridTemplateColumns: cols }}>
                {lanes.map((laneIndex) => (
                  <DroppableBoardZone
                    key={laneIndex}
                    faction="Invader"
                    laneIndex={laneIndex}
                    rowIndex={rowIndex}
                    placedCards={zoneCards("Invader", laneIndex, rowIndex)}
                    cardRegistry={state.cardMap}
                  />
                ))}
              </div>
            ))}

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 border-t-2 border-slate-600" />
              <span className="text-xs text-slate-500 uppercase tracking-widest">Castle Wall</span>
              <div className="flex-1 border-t-2 border-slate-600" />
            </div>

            {/* Monarch wall — row 0 */}
            <div className="grid gap-1" style={{ gridTemplateColumns: cols }}>
              {lanes.map((laneIndex) => (
                <DroppableBoardZone
                  key={laneIndex}
                  faction="Monarch"
                  laneIndex={laneIndex}
                  rowIndex={0}
                  placedCards={zoneCards("Monarch", laneIndex, 0)}
                  cardRegistry={state.cardMap}
                />
              ))}
            </div>

            {/* Courtyard — centered, laneCount-2 wide */}
            <div className="grid gap-1" style={{ gridTemplateColumns: cols }}>
              <div style={{ gridColumn: `${courtyardStart} / span ${courtyardWidth}` }}>
                <DroppableBoardZone
                  faction="Monarch"
                  laneIndex={null}
                  rowIndex={0}
                  placedCards={zoneCards("Monarch", null, 0)}
                  cardRegistry={state.cardMap}
                  label="Courtyard"
                />
              </div>
            </div>

            </div>{/* end board centered */}

            {/* Monarch hand */}
            <HandRow
              hand={state.monarchHand}
              drawPile={state.monarchDrawPile}
              faction="Monarch"
              cardMap={state.cardMap}
              onDraw={() => drawCard("Monarch")}
            />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeCard && (
              <div className="rotate-2 opacity-90">
                <CardPreview card={activeCard} scale={0.6} noWrapper />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </main>
  );
}
