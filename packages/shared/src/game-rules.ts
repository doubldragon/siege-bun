import { MAX_DECK_POINTS, MAX_CARD_COPIES, CARD_TYPE_IDS } from "./constants";
import type { DeckEntry } from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  totalPoints: number;
}

export function calcDeckPoints(
  entries: DeckEntry[],
  cardPointsById: Map<number, number>
): number {
  return entries.reduce(
    (sum, e) => sum + (cardPointsById.get(e.cardId) ?? 0) * e.quantity,
    0
  );
}

export function validateDeck(params: {
  entries: DeckEntry[];
  leadId: number | null;
  isMonarch: boolean;
  castleId: number | null;
  cardPointsById: Map<number, number>;
  cardTypeById: Map<number, number>;
}): ValidationResult {
  const errors: string[] = [];

  if (!params.leadId) {
    errors.push("A leader card is required.");
  }

  if (params.isMonarch && !params.castleId) {
    errors.push("Monarch decks require a castle card.");
  }

  for (const entry of params.entries) {
    if (entry.quantity > MAX_CARD_COPIES) {
      errors.push(`Max ${MAX_CARD_COPIES} copies of any card.`);
    }
    if (entry.quantity < 0) {
      errors.push("Card quantities cannot be negative.");
    }
  }

  const totalPoints = calcDeckPoints(params.entries, params.cardPointsById);
  if (totalPoints > MAX_DECK_POINTS) {
    errors.push(
      `Deck exceeds ${MAX_DECK_POINTS} points (current: ${totalPoints}).`
    );
  }

  // Castle cards don't count toward the Monarch deck's leader slot
  const castleTypeId = CARD_TYPE_IDS.Castle;
  if (params.isMonarch && params.castleId) {
    const castleType = params.cardTypeById.get(params.castleId);
    if (castleType !== castleTypeId) {
      errors.push("The selected castle card is not a Castle type.");
    }
  }

  return { valid: errors.length === 0, errors, totalPoints };
}
