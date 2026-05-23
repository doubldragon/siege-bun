# Siege! Deckbuilder

A card game deckbuilder for Siege!, a two-faction asymmetrical deck-building game. Build and manage decks for the **Monarch** (defender) or **Invader** (attacker) factions.

This is a TypeScript/Bun rebuild of the original Laravel + AngularJS deckbuilder, deployable as both a web app and a native macOS desktop app from the same codebase.

## Stack

| Layer | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| API | [Elysia](https://elysiajs.com) + Eden treaty |
| ORM | [Drizzle](https://orm.drizzle.team) |
| Database (web) | [Turso](https://turso.tech) (libSQL / SQLite) |
| Database (desktop) | `bun:sqlite` |
| Auth | [Better Auth](https://better-auth.com) |
| Frontend | React 19 + [Vite](https://vitejs.dev) |
| Routing | [TanStack Router](https://tanstack.com/router) |
| State | [TanStack Query](https://tanstack.com/query) + [Zustand](https://zustand-demo.pmnd.rs) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Desktop | [Electrobun](https://electrobun.dev) |

## Project Structure

Bun workspace monorepo with four packages:

```
packages/
  shared/    # @siege/shared — types, game rules, Drizzle schema
  server/    # @siege/server — Elysia API server
  web/       # @siege/web — React + Vite SPA
  desktop/   # @siege/desktop — Electrobun desktop wrapper
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.2

### Install

```bash
bun install
```

### Run (web)

```bash
bun run dev:web
```

Starts the API server on `:3000` and the Vite dev server on `:5173`.

### Run (desktop)

```bash
bun run dev:desktop
```

Opens the app in a native macOS WebKit window.

### Database

```bash
bun run db:migrate   # run migrations
bun run db:seed      # seed card data
```

## Game Rules

- Two factions: **Monarch** (defend the castle) vs. **Invader** (siege it)
- Each deck requires one leader card; Monarch decks also require a castle card
- Maximum **75 deck points** per deck
- Maximum **3 copies** of any single card
- Cards are faction-specific — Monarch and Invader cards cannot be mixed

## Status

Early development.
