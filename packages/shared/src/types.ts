export type Faction = "Monarch" | "Invader";

export type CardTypeName =
  | "Leader"
  | "Castle"
  | "Food"
  | "Morale"
  | "Siege Engine"
  | "Siege Defense"
  | "Espionage"
  | "Troops";

export interface CardType {
  id: number;
  type: CardTypeName;
}

// ── Card Effect System ────────────────────────────────────────────────────────

export type EffectTarget =
  | "food"
  | "morale"
  | "melee_attack"
  | "melee_defense"
  | "ranged_defense"
  | "siege_attack"
  | "wall_strength"
  | "gate_defense"
  | "movement_speed"
  | "troop_count";

export type EffectScope = "self" | "opponent" | "both" | "lane" | "zone";

export type EffectTrigger =
  | "on_play"
  | "start_of_turn"
  | "end_of_turn"
  | "on_attack"
  | "on_defend"
  | "on_card_played"
  | "passive";

export interface EffectCondition {
  type:
    | "turn_number_gte"
    | "target_card_type"
    | "is_attacking"
    | "is_defending"
    | "opponent_espionage_active"
    | "siege_in_progress";
  value?: number | string;
}

export interface EffectOperation {
  target: EffectTarget;
  scope: EffectScope;
  value: number;
  condition?: EffectCondition;
}

export interface InstantCardEffect {
  kind: "instant";
  trigger: EffectTrigger;
  operations: EffectOperation[];
}

export interface PersistentCardEffect {
  kind: "persistent";
  trigger: EffectTrigger;
  operations: EffectOperation[];
  durationTurns: number | null;
}

export interface ReactiveCardEffect {
  kind: "reactive";
  trigger: "on_card_played";
  operations: EffectOperation[];
  negates?: boolean;
}

export interface EffectModifierCardEffect {
  kind: "effect_modifier";
  target: EffectTarget;
  affects: "reduce" | "increase" | "any";
  multiplier: number;
  durationTurns: number | null;
}

export type CardEffect =
  | InstantCardEffect
  | PersistentCardEffect
  | ReactiveCardEffect
  | EffectModifierCardEffect;

export interface CardEffects {
  effects: CardEffect[];
  singleUse?: boolean;
  costModifiers?: Array<{
    targetCardType: CardTypeName;
    foodCostDelta: number;
  }>;
}

// ── Card ─────────────────────────────────────────────────────────────────────

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
  selectable: boolean;
  meleeAttack: number | null;
  meleeDefense: number | null;
  rangedDefense: number | null;
  siegeAttack: number | null;
  wallStrength: number | null;
  sides: number | null;
  effects: CardEffects | null;
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
