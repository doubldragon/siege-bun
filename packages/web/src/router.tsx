import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useAuthStore } from "./store/auth";
import { authClient } from "./lib/auth-client";
import { HomePage } from "./routes/home";
import { LoginPage } from "./routes/login";
import { RegisterPage } from "./routes/register";
import { DeckBuilderPage } from "./routes/deckbuilder";
import { DeckDetailPage } from "./routes/deck-detail";
import { AdminCardsPage } from "./routes/admin-cards";

function NavBar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  async function handleSignOut() {
    await authClient.signOut();
    useAuthStore.getState().setUser(null);
    navigate({ to: "/" });
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-amber-400 font-bold text-xl tracking-wide hover:text-amber-300">
        ⚔ SIEGE
      </Link>
      <div className="flex items-center gap-4">
        <Link
          to="/deckbuilder"
          className="text-slate-300 hover:text-white text-sm font-medium"
        >
          Build Deck
        </Link>
        {user?.isAdmin && (
          <Link to="/admin/cards" className="text-slate-400 hover:text-white text-sm">
            Admin
          </Link>
        )}
        {user ? (
          <>
            <span className="text-slate-400 text-sm">{user.username}</span>
            <button
              onClick={handleSignOut}
              className="text-slate-400 hover:text-white text-sm"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate-300 hover:text-white text-sm">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium text-sm px-3 py-1.5 rounded"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <NavBar />
      <Outlet />
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

const deckBuilderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/deckbuilder",
  component: DeckBuilderPage,
});

const deckDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/decks/$id",
  component: DeckDetailPage,
});

const adminCardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/cards",
  component: AdminCardsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  registerRoute,
  deckBuilderRoute,
  deckDetailRoute,
  adminCardsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
