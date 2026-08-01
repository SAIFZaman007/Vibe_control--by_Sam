import axios from "axios";

// Base URL: empty in development (Vite proxies /api to the backend). In
// production, set VITE_API_URL to the API origin, e.g. https://api.yoursite.com
const API_URL = import.meta.env.VITE_API_URL || "";

export const TOKEN_KEY = "vibe_token";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the bearer token to every request if the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear the token so the UI can redirect to login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

// Build a full URL for public assets (style thumbnails) served by the backend.
export const assetUrl = (path) => `${API_URL}${path}`;

// Pull a human-readable message out of a FastAPI error response.
export function errorMessage(error, fallback = "Something went wrong.") {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return fallback;
}
