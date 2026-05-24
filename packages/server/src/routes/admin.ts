import { Elysia, t } from "elysia";
import { db } from "../db/client";
import { cards, cardTypes } from "@siege/shared/db-schema";
import { eq, isNull, asc } from "drizzle-orm";
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
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

export const adminRoutes = new Elysia({ prefix: "/api" })
  .use(withSession)
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
