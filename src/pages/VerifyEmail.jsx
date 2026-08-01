import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { api, errorMessage } from "../api/client";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }
    api
      .post(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(errorMessage(err, "This link is invalid or has expired."));
      });
  }, [token]);

  return (
    <div className="container-page grid min-h-[calc(100vh-4rem)] place-items-center py-12">
      <div className="card w-full max-w-md p-8 text-center">
        {status === "verifying" && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-line border-t-vibe" />
            <h1 className="mt-5 text-xl font-bold">Verifying your email…</h1>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto text-emerald-500" size={44} />
            <h1 className="mt-4 text-xl font-bold">Email verified</h1>
            <p className="mt-1.5 text-sm text-muted">Your account is all set. Time to create.</p>
            <Link to="/studio" className="btn-primary mt-6">Go to studio</Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto text-red-500" size={44} />
            <h1 className="mt-4 text-xl font-bold">Verification failed</h1>
            <p className="mt-1.5 text-sm text-muted">{message}</p>
            <Link to="/" className="btn-ghost mt-6">Back home</Link>
          </>
        )}
      </div>
    </div>
  );
}
