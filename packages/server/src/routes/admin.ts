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
});

async function queryCardTypes() {
  return db.select().from(cardTypes).orderBy(asc(cardTypes.id));
}

async function queryCards() {
  return db
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
      createdAt: cards.createdAt,
      updatedAt: cards.updatedAt,
    })
    .from(cards)
    .innerJoin(cardTypes, eq(cards.typeId, cardTypes.id))
    .where(isNull(cards.deletedAt))
    .orderBy(asc(cards.isMonarch), asc(cards.typeId), asc(cards.name));
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
