import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, TOKEN_KEY } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the current user whenever a token is present (e.g. on refresh).
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/api/users/me");
      setUser(data);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    // The token endpoint expects form-encoded OAuth2 fields.
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    const { data } = await api.post("/api/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    await loadUser();
  };

  // Registration now starts email verification instead of logging in directly.
  // Returns { message, email } so the caller can move to the OTP screen.
  const register = async (fullName, email, password) => {
    const { data } = await api.post("/api/auth/register", {
      full_name: fullName,
      email,
      password,
    });
    return data;
  };

  // Verify the 6-digit code. On success the backend returns an access token,
  // which logs the user in automatically.
  const verifyOtp = async (email, code) => {
    const { data } = await api.post("/api/auth/verify-otp", { email, code });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    await loadUser();
  };

  const resendOtp = async (email) => {
    await api.post("/api/auth/resend-otp", { email });
  };
  
  const forgotPassword = async (email) => {
    const { data } = await api.post("/api/auth/forgot-password", { email });
    return data;
  };

  const resetPassword = async (token, newPassword) => {
    await api.post("/api/auth/reset-password", { token, new_password: newPassword });
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    verifyOtp,
    resendOtp,
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