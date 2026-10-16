import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/services/api";

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({ name, userId, password });
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
      <h1 className="font-display text-2xl">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Just an ID and password — no email needed.</p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        {error && (
          <div className="rounded-lg border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm text-muted">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Choose an ID</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="letters, numbers, . and _"
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
            autoComplete="new-password"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="text-emerald font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
};
