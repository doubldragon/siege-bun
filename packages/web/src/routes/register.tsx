import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name: username,
        username,
      });
      if (result.error) {
        setError(result.error.message ?? "Registration failed");
        return;
      }
      const user = await api.user.me();
      setUser(user);
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
      <div className="w-full max-w-sm p-8 bg-slate-900 rounded-lg border border-slate-700">
        <h1 className="text-2xl font-bold text-amber-400 mb-6 text-center">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-semibold py-2 rounded transition-colors"
          >
            {isLoading ? "Creating account…" : "Create Account"}
          </button>
        </form>
        <p className="text-center text-slate-400 text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-400 hover:text-amber-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
