import { Elysia, t } from "elysia";
import { db } from "../db/client";
import { cards, cardTypes, decks, users } from "@siege/shared/db-schema";
import { eq, isNull, asc, desc } from "drizzle-orm";
import { withSession } from "../lib/auth-middleware";

const cardBodySchema = t.Object({
  isMonarch: t.Boolean(),
  typeId: t.Number(),
  typeIcon: t.Optional(t.Nullable(t.String())),
  name: t.String({ minLength: 1 }),
  deckPoints: t.Optional(t.Nullable(t.Number())),
  cost: t.Optional(t.Nullable(t.Number())),
  action: t.String(),
  effect: t.String(),
  flavorText: t.String(),
  selectable: t.Boolean(),
  meleeAttack: t.Optional(t.Nullable(t.Number())),
  meleeDefense: t.Optional(t.Nullable(t.Number())),
  rangedDefense: t.Optional(t.Nullable(t.Number())),
  siegeAttack: t.Optional(t.Nullable(t.Number())),
  wallStrength: t.Optional(t.Nullable(t.Number())),
  sides: t.Optional(t.Nullable(t.Number())),
  effects: t.Optional(t.Nullable(t.Any())),
});

async function queryCardTypes() {
  return db.select().from(cardTypes).orderBy(asc(cardTypes.id));
}

async function queryCards() {
  const [allCards, allTypes] = await Promise.all([
    db.select().from(cards).where(isNull(cards.deletedAt))
      .orderBy(asc(cards.isMonarch), asc(cards.typeId), asc(cards.name)),
    db.select().from(cardTypes),
  ]);
  const typeMap = new Map(allTypes.map((t) => [t.id, t.type]));
  return allCards.map((c) => ({
    id: c.id,
    isMonarch: c.isMonarch,
    typeId: c.typeId,
    typeName: typeMap.get(c.typeId) ?? "",
    typeIcon: c.typeIcon,
    name: c.name,
    deckPoints: c.deckPoints,
    cost: c.cost,
    action: c.action,
    effect: c.effect,
    flavorText: c.flavorText,
    selectable: c.selectable,
    meleeAttack: c.meleeAttack,
    meleeDefense: c.meleeDefense,
    rangedDefense: c.rangedDefense,
    siegeAttack: c.siegeAttack,
    wallStrength: c.wallStrength,
    sides: c.sides,
    effects: c.effects,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

export const adminRoutes = new Elysia({ prefix: "/api" })
  .use(withSession)
  .get("/admin/decks", async ({ user, status }) => {
    if (!user?.isAdmin) return status(403, { message: "Forbidden" });
    const [allDecks, allUsers, allCards] = await Promise.all([
      db.select().from(decks).where(isNull(decks.deletedAt)).orderBy(desc(decks.createdAt)).limit(50),
      db.select({ id: users.id, username: users.username }).from(users),
      db.select({ id: cards.id, deckPoints: cards.deckPoints }).from(cards),
    ]);
    const usernameById = new Map(allUsers.map((u) => [u.id, u.username]));
    const pointsById = new Map(allCards.map((c) => [c.id, c.deckPoints ?? 0]));
    return allDecks.map((d) => {
      const entries = d.cards as Array<{ cardId: number; quantity: number }>;
      const cardCount = entries.reduce((s, e) => s + e.quantity, 0);
      const totalPoints = entries.reduce(
        (s, e) => s + (pointsById.get(e.cardId) ?? 0) * e.quantity,
        0
      );
      return {
        id: d.id,
        name: d.name,
        ownerUsername: usernameById.get(d.userId) ?? "unknown",
        isMonarch: d.isMonarch,
        cardCount,
        totalPoints,
        createdAt: d.createdAt,
      };
    });
  })
  .get("/admin/cards/popular", async ({ user, status }) => {
    if (!user?.isAdmin) return status(403, { message: "Forbidden" });
    const [allDecks, allCards, allTypes] = await Promise.all([
      db.select({ cards: decks.cards }).from(decks).where(isNull(decks.deletedAt)),
      db.select().from(cards).where(isNull(cards.deletedAt)),
      db.select().from(cardTypes),
    ]);
    const typeMap = new Map(allTypes.map((t) => [t.id, t.type]));
    const cardMap = new Map(allCards.map((c) => [c.id, c]));
    const counts = new Map<number, number>();
    for (const d of allDecks) {
      const entries = d.cards as Array<{ cardId: number; quantity: number }>;
      for (const e of entries) counts.set(e.cardId, (counts.get(e.cardId) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([cardId, deckCount]) => {
        const c = cardMap.get(cardId)!;
        return {
          card: { ...c, typeName: typeMap.get(c.typeId) ?? "" },
          deckCount,
        };
      });
  })
  .get("/admin/card-types", async ({ user, status }) => {
    if (!user?.isAdmin) return status(403, { message: "Forbidden" });
    return queryCardTypes();
  })
  .get("/admin/cards", async ({ user, status }) => {
    if (!user?.isAdmin) return status(403, { message: "Forbidden" });
    return queryCards();
  })
  .post(
    "/admin/cards",
    async ({ user, body, status }) => {
      if (!user?.isAdmin) return status(403, { message: "Forbidden" });
      const [card] = await db.insert(cards).values(body).returning();
      return card;
    },
    { body: cardBodySchema }
  )
  .put(
    "/admin/cards/:id",
    async ({ user, params, body, status }) => {
      if (!user?.isAdmin) return status(403, { message: "Forbidden" });
      const [card] = await db
        .update(cards)
        .set({ ...body, updatedAt: new Date().toISOString() })
        .where(eq(cards.id, Number(params.id)))
        .returning();
      if (!card) return status(404, { message: "Card not found" });
      return card;
    },
    { params: t.Object({ id: t.String() }), body: cardBodySchema }
  )
  .delete(
    "/admin/cards/:id",
    async ({ user, params, status }) => {
      if (!user?.isAdmin) return status(403, { message: "Forbidden" });
      const [existing] = await db
        .select()
        .from(cards)
        .where(eq(cards.id, Number(params.id)));
      if (!existing) return status(404, { message: "Card not found" });
      await db
        .update(cards)
        .set({ deletedAt: new Date().toISOString() })
        .where(eq(cards.id, Number(params.id)));
      return { success: true };
    },
    { params: t.Object({ id: t.String() }) }
  );
