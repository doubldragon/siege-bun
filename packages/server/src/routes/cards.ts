import { Elysia, t } from "elysia";
import { db } from "../db/client";
import { cards, cardTypes } from "@siege/shared/db-schema";
import { eq, isNull, and } from "drizzle-orm";

export const cardsRoutes = new Elysia({ prefix: "/api" }).get(
  "/cards",
  async ({ query }) => {
    const conditions = [isNull(cards.deletedAt)];

    if (query.isMonarch !== undefined) {
      conditions.push(eq(cards.isMonarch, query.isMonarch === "true"));
    }

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
      })
      .from(cards)
      .innerJoin(cardTypes, eq(cards.typeId, cardTypes.id))
      .where(and(...conditions))
      .orderBy(cards.typeId, cards.name);
  },
  {
    query: t.Object({
      isMonarch: t.Optional(t.String()),
    }),
  }
);
