import { Elysia } from "elysia";
import { auth } from "./auth";

export const withSession = new Elysia().derive(
  { as: "scoped" },
  async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    return { user: session?.user ?? null };
  }
);
