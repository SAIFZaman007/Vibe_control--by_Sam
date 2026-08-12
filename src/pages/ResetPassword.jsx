import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound } from "lucide-react";
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
      setError("The two passwords don't match.");
      return;
    }

    setBusy(true);
    try {
      await resetPassword(token, password);
      // No auto-login: the reset endpoint doesn't issue a session.
      navigate("/login", { replace: true, state: { resetSuccess: true } });
    } catch (err) {
      setError(
        errorMessage(err, "This link is no longer valid. Please request a new one.")
      );
    } finally {
      setBusy(false);
    }
  };

  // A missing token means the user landed here directly rather than via email.
  if (!token) {
    return (
      <div className="container-page grid min-h-[calc(100vh-4rem)] place-items-center py-12">
        <div className="card w-full max-w-md space-y-4 p-6 text-center">
          <h1 className="text-xl font-extrabold">Link not valid</h1>
          <p className="text-sm text-muted">
            This reset link is missing its token. Request a new one to continue.
          </p>
          <Link to="/forgot-password" className="btn-primary inline-block w-full">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page grid min-h-[calc(100vh-4rem)] place-items-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-vibe-gradient text-white">
            <KeyRound size={18} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted">Choose something you'll remember.</p>
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
              className="input" placeholder="At least 8 characters"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirm new password</label>
            <input
              id="confirm" type="password" required autoComplete="new-password"
              className="input" placeholder="••••••••"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}