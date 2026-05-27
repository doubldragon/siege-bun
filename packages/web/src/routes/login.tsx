import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Sign in failed");
        return;
      }
      const user = await api.user.me();
      setUser(user);
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
      <div className="w-full max-w-sm p-8 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-bold text-sky-400 mb-6 text-center">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold py-2 rounded transition-colors"
          >
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-4">
          No account?{" "}
          <Link to="/register" className="text-sky-400 hover:text-sky-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
