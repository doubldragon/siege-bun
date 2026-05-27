import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useDndContext, useDroppable } from "@dnd-kit/core";
import type { Card } from "@siege/shared/types";
import { CardPreview } from "../CardPreview";
import type { DragData, Faction, PlacedCard } from "./types";

const BOARD_SCALE = 0.45;
const PEEK_HEIGHT = 14; // px visible for each stacked card's header
const CARD_HEIGHT = 165; // px approximate full card height at BOARD_SCALE
const TITLE_HOVER_HEIGHT = 28; // px height of hover zone over the title area

function BoardCard({ card }: { card: Card }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onEnter(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: rect.right + 12, y: rect.top });
    timerRef.current = setTimeout(() => setShowOverlay(true), 2000);
  }

  function onLeave() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowOverlay(false);
  }

  return (
    <div className="relative">
      <CardPreview card={card} scale={BOARD_SCALE} noWrapper />
      <div
        className="absolute inset-x-0 top-0 cursor-default"
        style={{ height: TITLE_HOVER_HEIGHT }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      />
      {showOverlay &&
        createPortal(
          <div
            className="pointer-events-none"
            style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 9999 }}
          >
            <CardPreview card={card} />
          </div>,
          document.body
        )}
    </div>
  );
}

type Props = {
  faction: Faction;
  laneIndex: number | null;
  rowIndex: number;
  placedCards: PlacedCard[];
  cardRegistry: Map<number, Card>;
  label?: string;
};

export function zoneId(faction: Faction, laneIndex: number | null, rowIndex: number) {
  return `${faction}-${laneIndex ?? "court"}-${rowIndex}`;
}

export function DroppableBoardZone({
  faction,
  laneIndex,
  rowIndex,
  placedCards,
  cardRegistry,
  label,
}: Props) {
  const { isOver, setNodeRef } = useDroppable({
    id: zoneId(faction, laneIndex, rowIndex),
  });

  const { active } = useDndContext();
  const activeFaction = (active?.data?.current as DragData | undefined)?.faction;
  const isFull = placedCards.length >= 3;
  const isValidDrop = !activeFaction || (activeFaction === faction && !isFull);
  const isMonarch = faction === "Monarch";
  const overStyle =
    isOver && isValidDrop
      ? isMonarch
        ? "border-emerald-500 bg-emerald-500/10"
        : "border-orange-500 bg-orange-500/10"
      : "border-slate-600 bg-slate-800/30";

  return (
    <div
      ref={setNodeRef}
      className={`rounded border-2 border-dashed p-1.5 transition-colors ${overStyle}`}
    >
      {label && (
        <span className="text-[9px] text-slate-500 uppercase tracking-wide leading-none block mb-1">
          {label}
        </span>
      )}
      <div className="relative" style={{ height: CARD_HEIGHT }}>
        {placedCards.map((pc, i) => {
          const card = cardRegistry.get(pc.cardId);
          if (!card) return null;
          return (
            <div
              key={i}
              className="absolute"
              style={{ top: i * PEEK_HEIGHT, left: 0, zIndex: i }}
            >
              <BoardCard card={card} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
