import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./lib/auth";
import { cardsRoutes } from "./routes/cards";
import { decksRoutes } from "./routes/decks";
import { userRoutes } from "./routes/user";

export const createApp = () =>
  new Elysia()
    .use(
      cors({
        origin: [
          "http://localhost:5173",
          "http://localhost:3000",
          process.env.APP_URL ?? "",
        ].filter(Boolean),
        credentials: true,
      })
    )
    .mount("/api/auth", auth.handler)
    .use(cardsRoutes)
    .use(decksRoutes)
    .use(userRoutes);

export type App = ReturnType<typeof createApp>;
