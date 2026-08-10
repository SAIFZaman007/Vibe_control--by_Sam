import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await forgotPassword(email);
      // Always show the same confirmation, whether or not the email exists —
      // the backend response is identical either way.
      setSent(true);
    } catch (err) {
      setError(errorMessage(err, "Could not send a reset link. Please try again."));
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
          <h1 className="mt-4 text-2xl font-extrabold">Reset your password</h1>
          <p className="mt-1 text-sm text-muted">
            Enter your email and we'll send you a link to choose a new one.
          </p>
        </div>

        {sent ? (
          <div className="card p-6 text-center">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-600">
              If an account exists for <span className="font-semibold">{email}</span>, a reset
              link is on its way.
            </div>
            <p className="mt-4 text-sm text-muted">
              Didn't get it? Check your spam folder, or{" "}
              <button
                onClick={() => setSent(false)}
                className="font-semibold text-vibe hover:underline"
              >
                try again
              </button>
              .
            </p>
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
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}