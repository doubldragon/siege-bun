import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useAuthStore } from "./store/auth";
import { useThemeStore } from "./store/theme";
import { authClient } from "./lib/auth-client";
import { HomePage } from "./routes/home";
import { LoginPage } from "./routes/login";
import { RegisterPage } from "./routes/register";
import { DeckBuilderPage } from "./routes/deckbuilder";
import { DeckDetailPage } from "./routes/deck-detail";
import { AdminCardsPage } from "./routes/admin-cards";
import { AdminDashboardPage } from "./routes/admin";
import { AdminDecksPage } from "./routes/admin-decks";
import { AdminPlayPage } from "./routes/admin-play";

function NavBar() {
  const { user } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const navigate = useNavigate();

  async function handleSignOut() {
    await authClient.signOut();
    useAuthStore.getState().setUser(null);
    navigate({ to: "/" });
  }

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-sky-400 font-bold text-xl tracking-wide hover:text-sky-300">
       <img src={`/img/siege-banner.png`} />
      </Link>
      <div className="flex items-center gap-4">
        <Link
          to="/deckbuilder"
          className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium"
        >
          Build Deck
        </Link>
        {user?.isAdmin && (
          <>
            <Link to="/admin" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm">
              Admin
            </Link>
            <Link to="/admin/cards" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm">
              Admin Cards
            </Link>
          </>
        )}
        {user ? (
          <>
            <span className="text-slate-500 dark:text-slate-400 text-sm">{user.username}</span>
            <button
              onClick={handleSignOut}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm px-3 py-1.5 rounded"
            >
              Register
            </Link>
          </>
        )}
        <button
          onClick={toggle}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isDark ? "bg-sky-500" : "bg-slate-300"}`}
        >
          <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${isDark ? "translate-x-5" : "translate-x-1"}`} />
        </button>
      </div>
    </nav>
  );
}

function RootLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
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

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboardPage,
});

const adminDecksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/decks",
  component: AdminDecksPage,
});

const adminPlayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/play",
  component: AdminPlayPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  registerRoute,
  deckBuilderRoute,
  deckDetailRoute,
  adminCardsRoute,
  adminRoute,
  adminDecksRoute,
  adminPlayRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
