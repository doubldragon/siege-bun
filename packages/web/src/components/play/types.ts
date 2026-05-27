export type Faction = "Monarch" | "Invader";

export type PlacedCard = {
  cardId: number;
  faction: Faction;
  laneIndex: number | null; // null = Courtyard
  rowIndex: number;         // Invader 0–3, Monarch always 0
};

export type DragData = {
  cardId: number;
  faction: Faction;
  fromHand: boolean;
  handIndex: number;   // index in hand array; -1 if from board
  sourceLane: number | null;
  sourceRow: number;
};
