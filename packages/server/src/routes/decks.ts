import { Elysia, t } from "elysia";
import { db } from "../db/client";
import { decks, cards, cardTypes, users } from "@siege/shared/db-schema";
import { eq, isNull, desc, and } from "drizzle-orm";
import { validateDeck } from "@siege/shared/game-rules";
import { CARD_TYPE_IDS } from "@siege/shared/constants";
import { withSession } from "../lib/auth-middleware";

const deckEntrySchema = t.Object({
  cardId: t.Number(),
  quantity: t.Number({ minimum: 1, maximum: 3 }),
});

const deckBodySchema = t.Object({
  name: t.String({ minLength: 1 }),
  leadId: t.Number(),
  isMonarch: t.Boolean(),
  cards: t.Array(deckEntrySchema),
});

async function fetchCardMaps() {
  const allCards = await db
    .select({ id: cards.id, deckPoints: cards.deckPoints, typeId: cards.typeId })
    .from(cards);
  return {
    cardPointsById: new Map(allCards.map((c) => [c.id, c.deckPoints ?? 0])),
    cardTypeById: new Map(allCards.map((c) => [c.id, c.typeId])),
  };
}

async function enrichDeck(
  deck: typeof decks.$inferSelect,
  cardPointsById: Map<number, number>
) {
  const [leader] = await db
    .select({
      id: cards.id,
      isMonarch: cards.isMonarch,
      typeId: cards.typeId,
      typeName: cardTypes.type,
      typeIcon: cards.typeIcon,
      name: cards.name,
      deckPoints: cards.deckPoints,
      cost: cards.cost,
      action: cards.action,
      effect: cards.effect,
      flavorText: cards.flavorText,
    })
    .from(cards)
    .innerJoin(cardTypes, eq(cards.typeId, cardTypes.id))
    .where(eq(cards.id, deck.leadId));

  const [owner] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, deck.userId));

  const entries = deck.cards as Array<{ cardId: number; quantity: number }>;
  const totalPoints = entries.reduce(
    (sum, e) => sum + (cardPointsById.get(e.cardId) ?? 0) * e.quantity,
    0
  );

  return {
    ...deck,
    leader: leader ?? null,
    username: owner?.username ?? "unknown",
    faction: deck.isMonarch ? ("Monarch" as const) : ("Invader" as const),
    totalPoints,
  };
}

export const decksRoutes = new Elysia({ prefix: "/api" })
  .use(withSession)

  // Public: recent decks
  .get("/decks/recent", async () => {
    const { cardPointsById } = await fetchCardMaps();
    const recent = await db
      .select()
      .from(decks)
      .where(and(isNull(decks.deletedAt), eq(decks.isPrivate, false)))
      .orderBy(desc(decks.createdAt))
      .limit(10);
    return Promise.all(recent.map((d) => enrichDeck(d, cardPointsById)));
  })

  // Public: single deck
  .get(
    "/decks/:id",
    async ({ params, status }) => {
      const { cardPointsById } = await fetchCardMaps();
      const [deck] = await db
        .select()
        .from(decks)
        .where(and(eq(decks.id, Number(params.id)), isNull(decks.deletedAt)));
      if (!deck) return status(404, { message: "Deck not found" });
      return enrichDeck(deck, cardPointsById);
    },
    { params: t.Object({ id: t.String() }) }
  )

  // Auth: current user's decks
  .get("/decks", async ({ user, status }) => {
    if (!user) return status(401, { message: "Unauthorized" });
    const { cardPointsById } = await fetchCardMaps();
    const userDecks = await db
      .select()
      .from(decks)
      .where(and(eq(decks.userId, user.id), isNull(decks.deletedAt)))
      .orderBy(desc(decks.createdAt));
    return Promise.all(userDecks.map((d) => enrichDeck(d, cardPointsById)));
  })

  // Auth: create deck
  .post(
    "/decks",
    async ({ user, body, status }) => {
      if (!user) return status(401, { message: "Unauthorized" });

      const { cardPointsById, cardTypeById } = await fetchCardMaps();
      const castleId =
        body.isMonarch
          ? (body.cards.find(
              (e) => cardTypeById.get(e.cardId) === CARD_TYPE_IDS.Castle
            )?.cardId ?? null)
          : null;

      const validation = validateDeck({
        entries: body.cards,
        leadId: body.leadId,
        isMonarch: body.isMonarch,
        castleId,
        cardPointsById,
        cardTypeById,
      });
      if (!validation.valid)
        return status(400, { message: validation.errors.join(", ") });

      const [deck] = await db
        .insert(decks)
        .values({
          name: body.name,
          userId: user.id,
          cards: body.cards,
          leadId: body.leadId,
          isMonarch: body.isMonarch,
        })
        .returning();

      return enrichDeck(deck, cardPointsById);
    },
    { body: deckBodySchema }
  )

  // Auth: update deck
  .put(
    "/decks/:id",
    async ({ user, params, body, status }) => {
      if (!user) return status(401, { message: "Unauthorized" });

      const [existing] = await db
        .select()
        .from(decks)
        .where(and(eq(decks.id, Number(params.id)), isNull(decks.deletedAt)));
      if (!existing) return status(404, { message: "Deck not found" });
      if (existing.userId !== user.id) return status(403, { message: "Forbidden" });

      const { cardPointsById, cardTypeById } = await fetchCardMaps();
      const castleId =
        body.isMonarch
          ? (body.cards.find(
              (e) => cardTypeById.get(e.cardId) === CARD_TYPE_IDS.Castle
            )?.cardId ?? null)
          : null;

      const validation = validateDeck({
        entries: body.cards,
        leadId: body.leadId,
        isMonarch: body.isMonarch,
        castleId,
        cardPointsById,
        cardTypeById,
      });
      if (!validation.valid)
        return status(400, { message: validation.errors.join(", ") });

      const [deck] = await db
        .update(decks)
        .set({
          name: body.name,
          cards: body.cards,
          leadId: body.leadId,
          isMonarch: body.isMonarch,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(decks.id, Number(params.id)))
        .returning();

      return enrichDeck(deck, cardPointsById);
    },
    { params: t.Object({ id: t.String() }), body: deckBodySchema }
  )

  // Auth: delete deck (soft)
  .delete(
    "/decks/:id",
    async ({ user, params, status }) => {
      if (!user) return status(401, { message: "Unauthorized" });

      const [existing] = await db
        .select()
        .from(decks)
        .where(and(eq(decks.id, Number(params.id)), isNull(decks.deletedAt)));
      if (!existing) return status(404, { message: "Deck not found" });
      if (existing.userId !== user.id) return status(403, { message: "Forbidden" });

      await db
        .update(decks)
        .set({ deletedAt: new Date().toISOString() })
        .where(eq(decks.id, Number(params.id)));

      return { success: true };
    },
    { params: t.Object({ id: t.String() }) }
  );
