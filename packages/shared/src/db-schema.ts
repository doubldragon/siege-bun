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
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  displayUsername: text("display_username"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  isAdmin: integer("is_admin", { mode: "boolean" }).default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  deletedAt: text("deleted_at"),
});

// Better Auth tables
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
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
