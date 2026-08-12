import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

export const TOKEN_KEY = "vibe_token";
export const REFRESH_TOKEN_KEY = "vibe_refresh_token";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export function storeSession(data) {
  if (data?.token) localStorage.setItem(TOKEN_KEY, data.token);
  if (data?.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const { data } = await api.post("/users/tokens/refresh", null, {
    skipAuth: true,
    headers: { Authorization: `Bearer ${refreshToken}` },
  });

  storeSession(data);
  return data.token;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status !== 401 || !original || original._retried || original.skipAuth) {
      if (status === 401) clearSession();
      return Promise.reject(error);
    }

    if (original.url?.includes("/users/tokens/refresh")) {
      clearSession();
      return Promise.reject(error);
    }

    original._retried = true;

    try {
      refreshPromise = refreshPromise || refreshAccessToken();
      const newToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      clearSession();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  }
);

export const assetUrl = (path) => `${API_URL}${path}`;

export function errorMessage(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;

  if (Array.isArray(data?.error_description) && data.error_description[0]) {
    return data.error_description[0];
  }
  if (typeof data?.error === "string") return data.error;
  if (Array.isArray(data?.error) && data.error[0]) return data.error[0];

  return fallback;
}