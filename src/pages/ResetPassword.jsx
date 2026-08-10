import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(token, password);
      navigate("/login", { state: { resetSuccess: true } });
    } catch (err) {
      setError(errorMessage(err, "This link may have expired. Please request a new one."));
    } finally {
      setBusy(false);
    }
  };

  // No token in the URL at all — nothing to submit against.
  if (!token) {
    return (
      <div className="container-page grid min-h-[calc(100vh-4rem)] place-items-center py-12">
        <div className="w-full max-w-md text-center">
          <div className="card p-6">
            <p className="text-sm text-ink">
              This reset link is missing its token. Please request a new one.
            </p>
            <Link to="/forgot-password" className="btn-primary mt-4 inline-flex">
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page grid min-h-[calc(100vh-4rem)] place-items-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-vibe-gradient text-white">
            <ShieldCheck size={18} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold">Choose a new password</h1>
          <p className="mt-1 text-sm text-muted">Make it at least 8 characters.</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}
          <div>
            <label className="label" htmlFor="password">New password</label>
            <input
              id="password" type="password" required autoComplete="new-password"
              minLength={8} className="input" placeholder="At least 8 characters"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm" type="password" required autoComplete="new-password"
              minLength={8} className="input" placeholder="Type it again"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Saving…" : "Save new password"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          <Link to="/login" className="font-semibold text-vibe hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}