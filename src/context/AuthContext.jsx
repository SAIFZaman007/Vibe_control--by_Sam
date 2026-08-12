import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, clearSession, getToken, storeSession } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // /api/users/me is used rather than /users/tokens/info because the latter
  // omits is_active and is_admin.
  const loadUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/api/users/me");
      setUser(data);
    } catch {
      clearSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post("/users/tokens/sign_in", { email, password });
    storeSession(data);
    await loadUser();
  };

  // Registration signs the user straight in — there is no verification step.
  const register = async (fullName, email, password) => {
    const { data } = await api.post("/users/tokens/sign_up", {
      full_name: fullName,
      email,
      password,
      password_confirmation: password,
    });
    storeSession(data);
    await loadUser();
    return data;
  };

  // Answers 404 when no account matches, so callers must handle that.
  const forgotPassword = async (email) => {
    const { data } = await api.post("/passwords/forgot", { email });
    return data;
  };

  const resetPassword = async (token, newPassword) => {
    await api.post("/passwords/reset", { token, password: newPassword });
  };

  const logout = async () => {
    // Revoke server-side so the token dies immediately. A failure here still
    // clears the client.
    try {
      await api.post("/users/tokens/revoke");
    } catch {
      // Already revoked or offline — nothing useful to do.
    }
    clearSession();
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    reload: loadUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}