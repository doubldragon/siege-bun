import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const cardTypes = sqliteTable("card_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull().unique(),
});

export const cards = sqliteTable("cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  isMonarch: integer("is_monarch", { mode: "boolean" }).notNull(),
  typeId: integer("type_id")
    .notNull()
    .references(() => cardTypes.id),
  typeIcon: text("type_icon"),
  name: text("name").notNull().unique(),
  deckPoints: integer("deck_points"),
  cost: integer("cost"),
  action: text("action").notNull(),
  effect: text("effect").notNull(),
  flavorText: text("flavor_text").notNull(),
  deletedAt: text("deleted_at"),
  createdAt: text("created_at").default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text("updated_at").default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  isAdmin: integer("is_admin", { mode: "boolean" }).default(false),
  image: text("image"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
});

export const decks = sqliteTable("decks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  cards: text("cards", { mode: "json" })
    .$type<Array<{ cardId: number; quantity: number }>>()
    .notNull(),
  leadId: integer("lead_id")
    .notNull()
    .references(() => cards.id),
  isMonarch: integer("is_monarch", { mode: "boolean" }).notNull(),
  isPrivate: integer("is_private", { mode: "boolean" }).default(false),
  deletedAt: text("deleted_at"),
  createdAt: text("created_at").default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text("updated_at").default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});
