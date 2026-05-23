import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./lib/auth";
import { cardsRoutes } from "./routes/cards";
import { decksRoutes } from "./routes/decks";
import { userRoutes } from "./routes/user";
import { adminRoutes } from "./routes/admin";

export const createApp = () => {
  const app = new Elysia()
    .use(
      cors({
        origin: [
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
          ...(process.env.APP_URL ? [process.env.APP_URL] : []),
        ],
        credentials: true,
      })
    )
    .mount("/api/auth", auth.handler)
    .use(adminRoutes)
    .use(cardsRoutes)
    .use(decksRoutes)
    .use(userRoutes);

  return app;
};

export type App = ReturnType<typeof createApp>;
