import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      // The backend answers 404 when no account matches, so unlike a
      // enumeration-safe API this has to be shown rather than swallowed.
      if (err?.response?.status === 404) {
        setError("We couldn't find an account with that email address.");
      } else {
        setError(errorMessage(err, "Could not send the reset link. Please try again."));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-page grid min-h-[calc(100vh-4rem)] place-items-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-vibe-gradient text-white">
            <KeyRound size={18} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold">Forgot your password?</h1>
          <p className="mt-1 text-sm text-muted">
            Enter your email and we'll send you a link to set a new one.
          </p>
        </div>

        {sent ? (
          <div className="card space-y-4 p-6 text-center">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-600">
              Check your inbox — we've sent you a reset link. It expires in 4 hours.
            </div>
            <Link to="/login" className="btn-primary inline-block w-full">
              Back to login
            </Link>
          </div>
        ) : (
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
            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-muted">
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-vibe hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}