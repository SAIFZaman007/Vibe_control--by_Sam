# Vibe Control — Frontend (React + Vite)

React 18, Vite, Tailwind CSS, React Router, axios.

## Run

```bash
cp .env.example .env      # leave VITE_API_URL empty for local dev
npm install
npm run dev               # http://localhost:5173
```

The backend must be running on port 8000; Vite proxies `/api` and `/static` to it
(see `vite.config.js`), so no CORS setup is needed in development.

## Build

```bash
# For production, point the app at your API origin:
VITE_API_URL=https://api.your-domain.com npm run build
npm run preview           # optional local preview of the build
```

## Layout

- `src/pages/` — Landing, Login, Register, VerifyEmail, Studio, Gallery, Favorites, Profile
- `src/components/` — Navbar, Footer, StyleCard, CompareSlider, AuthImage, ProtectedRoute
- `src/context/AuthContext.jsx` — JWT session state
- `src/api/client.js` — axios instance with token injection
- `tailwind.config.js` — design tokens (colors, fonts)

See the root `README.md` for full details and deployment.
