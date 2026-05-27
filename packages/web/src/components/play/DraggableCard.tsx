import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { DragData, Faction } from "./types";

type Props = {
  dragId: string;
  cardId: number;
  name: string;
  cost: number | null;
  faction: Faction;
  data: DragData;
};

const FACTION_STYLE: Record<Faction, string> = {
  Monarch: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300",
  Invader: "bg-orange-600/20 border-orange-600/50 text-orange-300",
};

export function DraggableCard({ dragId, name, cost, faction, data }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId,
    data,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded border cursor-grab active:cursor-grabbing select-none text-xs font-medium transition-opacity ${FACTION_STYLE[faction]} ${isDragging ? "opacity-40" : ""}`}
    >
      <span className="truncate">{name}</span>
      {cost != null && <span className="shrink-0 font-bold">{cost}</span>}
    </div>
  );
}
