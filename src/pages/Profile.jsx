import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Trash2 } from "lucide-react";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout, reload } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveName = async (e) => {
    e.preventDefault();
    setSavingName(true); setNameMsg("");
    try {
      await api.patch("/api/users/me", { full_name: fullName });
      await reload();
      setNameMsg("Saved");
    } catch (err) {
      setNameMsg(errorMessage(err, "Could not save."));
    } finally {
      setSavingName(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwErr(""); setPwMsg("");
    if (newPw.length < 8) { setPwErr("New password must be at least 8 characters."); return; }
    setPwBusy(true);
    try {
      await api.post("/api/users/me/change-password", {
        current_password: currentPw, new_password: newPw,
      });
      setPwMsg("Password updated");
      setCurrentPw(""); setNewPw("");
    } catch (err) {
      setPwErr(errorMessage(err, "Could not update password."));
    } finally {
      setPwBusy(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete("/api/users/me");
      logout();
      navigate("/");
    } catch {
      /* no-op */
    }
  };

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-extrabold">Profile</h1>
      <p className="mt-1 text-muted">Manage your account and security.</p>

      {/* Account overview */}
      <section className="card mt-8 p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-vibe-gradient text-xl font-extrabold text-white">
            {(user?.full_name?.[0] || "U").toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{user?.full_name}</p>
            <p className="truncate text-sm text-muted">{user?.email}</p>
          </div>
          <span
            className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              user?.is_verified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            {user?.is_verified ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
            {user?.is_verified ? "Verified" : "Unverified"}
          </span>
        </div>

        <form onSubmit={saveName} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label" htmlFor="fullName">Full name</label>
            <input id="fullName" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <button className="btn-primary" disabled={savingName || fullName === user?.full_name}>
            {savingName ? "Saving…" : "Save"}
          </button>
        </form>
        {nameMsg && <p className="mt-2 text-sm text-emerald-600">{nameMsg}</p>}
      </section>

      {/* Change password */}
      <section className="card mt-6 p-6">
        <h2 className="text-lg font-bold">Change password</h2>
        <form onSubmit={changePassword} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="currentPw">Current password</label>
            <input id="currentPw" type="password" className="input" autoComplete="current-password"
              value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="newPw">New password</label>
            <input id="newPw" type="password" className="input" autoComplete="new-password" minLength={8}
              value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            {pwErr && <p className="mb-2 text-sm text-red-600">{pwErr}</p>}
            {pwMsg && <p className="mb-2 text-sm text-emerald-600">{pwMsg}</p>}
            <button className="btn-primary" disabled={pwBusy}>
              {pwBusy ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </section>

      {/* Danger zone */}
      <section className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="text-lg font-bold text-red-700">Danger zone</h2>
        <p className="mt-1 text-sm text-red-600/80">
          Deleting your account permanently removes your profile, creations, and favorites.
        </p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="btn-danger mt-4">
            <Trash2 size={16} /> Delete account
          </button>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-red-700">Are you sure? This can't be undone.</span>
            <button onClick={deleteAccount} className="btn bg-red-600 text-white hover:bg-red-700">
              Yes, delete everything
            </button>
            <button onClick={() => setConfirmDelete(false)} className="btn-ghost">Cancel</button>
          </div>
        )}
      </section>
    </div>
  );
}
