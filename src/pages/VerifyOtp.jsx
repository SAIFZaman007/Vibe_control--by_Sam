import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";

const LENGTH = 6;

export default function VerifyOtp() {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const inputs = useRef([]);

  // Without an email in navigation state there's nothing to verify.
  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  // Focus the first box on mount.
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  // Resend cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const code = useMemo(() => digits.join(""), [digits]);

  const setDigit = (i, val) => {
    setDigits((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      setDigit(i, "");
      return;
    }
    // If multiple chars arrive (mobile autofill), spread them across boxes.
    const chars = val.split("");
    setDigits((prev) => {
      const next = [...prev];
      let idx = i;
      for (const ch of chars) {
        if (idx >= LENGTH) break;
        next[idx] = ch;
        idx += 1;
      }
      return next;
    });
    const nextIndex = Math.min(i + chars.length, LENGTH - 1);
    inputs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    const next = Array(LENGTH).fill("");
    pasted.split("").forEach((ch, idx) => (next[idx] = ch));
    setDigits(next);
    inputs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  };

  const submit = async (value) => {
    const finalCode = value || code;
    if (finalCode.length !== LENGTH) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await verifyOtp(email, finalCode);
      navigate("/studio", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "That code didn't work. Please try again."));
      setDigits(Array(LENGTH).fill(""));
      inputs.current[0]?.focus();
    } finally {
      setBusy(false);
    }
  };

  // Auto-submit once all six digits are present.
  useEffect(() => {
    if (code.length === LENGTH && !busy) submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const resend = async () => {
    if (cooldown > 0) return;
    setError("");
    setInfo("");
    try {
      await resendOtp(email);
      setInfo("A new code is on its way.");
      setCooldown(60);
    } catch (err) {
      setError(errorMessage(err, "Couldn't resend right now. Try again shortly."));
      setCooldown(60);
    }
  };

  return (
    <div className="container-page grid min-h-[calc(100vh-4rem)] place-items-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-vibe-gradient text-white">
            <MailCheck size={18} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold">Check your email</h1>
          <p className="mt-1 text-sm text-muted">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-ink">{email}</span>.
          </p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}
          {info && !error && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-600">
              {info}
            </div>
          )}

          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={d}
                disabled={busy}
                onChange={(e) => handleChange(i, e)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-14 w-11 rounded-xl border border-line bg-surface text-center text-2xl font-bold text-ink
                           transition focus:border-vibe focus:ring-2 focus:ring-vibe/30 sm:w-12"
              />
            ))}
          </div>

          <button
            onClick={() => submit()}
            disabled={busy || code.length !== LENGTH}
            className="btn-primary mt-6 w-full"
          >
            {busy ? "Verifying…" : "Verify email"}
          </button>

          <div className="mt-4 text-center text-sm text-muted">
            Didn't get it?{" "}
            <button
              onClick={resend}
              disabled={cooldown > 0}
              className="font-semibold text-vibe hover:underline disabled:text-muted disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          Wrong email?{" "}
          <Link to="/register" className="font-semibold text-vibe hover:underline">
            Start over
          </Link>
        </p>
      </div>
    </div>
  );
}
