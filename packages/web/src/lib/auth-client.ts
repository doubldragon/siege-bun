import { createAuthClient } from "better-auth/client";
import { usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "",
  basePath: "/api/auth",
  fetchOptions: { credentials: "include" },
  plugins: [usernameClient()],
});
