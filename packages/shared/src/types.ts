export type Faction = "Monarch" | "Invader";

export type CardTypeName =
  | "Leader"
  | "Castle"
  | "Food"
  | "Morale"
  | "Siege Engine"
  | "Siege Defense"
  | "Espionage";

export interface CardType {
  id: number;
  type: CardTypeName;
}

export interface Card {
  id: number;
  isMonarch: boolean;
  typeId: number;
  typeName: CardTypeName;
  typeIcon: string | null;
  name: string;
  deckPoints: number | null;
  cost: number | null;
  action: string;
  effect: string;
  flavorText: string;
}

export interface DeckEntry {
  cardId: number;
  quantity: number;
}

export interface DeckEntryDetail {
  cardId: number;
  quantity: number;
  name: string;
  deckPoints: number | null;
}

export interface DeckSummary {
  id: number;
  name: string;
  userId: string;
  username: string;
  leadId: number;
  leader: Card;
  isMonarch: boolean;
  faction: Faction;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeckDetail extends DeckSummary {
  cards: DeckEntryDetail[];
  totalPoints: number;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}
