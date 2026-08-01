import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/studio";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Could not log in. Check your details and try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page grid min-h-[calc(100vh-4rem)] place-items-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-vibe-gradient text-white">
            <Sparkles size={18} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Log in to your Vibe Control studio.</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email" type="email" required autoComplete="email"
              className="input" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password" type="password" required autoComplete="current-password"
              className="input" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          New here?{" "}
          <Link to="/register" className="font-semibold text-vibe hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
