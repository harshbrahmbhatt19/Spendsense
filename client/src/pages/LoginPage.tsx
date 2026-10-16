import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/services/api";

export const LoginPage = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const navigate = useNavigate();

  if (hydrated && token) return <Navigate to="/app" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.login({ userId, password });
      setAuth(res.data.data.user, res.data.data.token);
      navigate("/app");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line p-6">
      <h1 className="font-display text-2xl">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Log in with your ID and password.</p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        {error && (
          <div className="rounded-lg border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm text-muted">ID</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. dev123"
            autoComplete="username"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        New here?{" "}
        <Link to="/register" className="text-emerald font-medium">
          Create an account
        </Link>
      </p>
    </div>
  );
};
