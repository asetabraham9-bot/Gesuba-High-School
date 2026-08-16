import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../lib/api";
import { Alert } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(identifier, password);
      navigate(dashboardPathForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card">
        <h1 className="font-display text-3xl font-bold text-brand-900">
          Portal login
        </h1>
        <p className="mt-1 text-sm text-brand-600">
          Use your email or student ID and password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error ? <Alert>{error}</Alert> : null}
          <div>
            <label className="label" htmlFor="identifier">
              Email or username
            </label>
            <input
              id="identifier"
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-brand-600">
          New student?{" "}
          <Link to="/signup" className="font-semibold text-brand-800 underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
