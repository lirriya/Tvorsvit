# Tvorsvit Frontend

React + Vite single-page application for the Tvorsvit worldbuilding app — a worlds dashboard (`/`) and a world editor (`/worlds/:id`), backed by the Spring Boot REST API.

## Stack

- React 19
- Vite (dev proxy: `/api` → `http://localhost:8081`)
- react-router-dom
- ESLint (eslint-plugin-react-hooks, eslint-plugin-react-refresh)

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server on http://localhost:5173 |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint check |
| `npm run preview` | Preview the production build |

## Dev flow

Run the backend first (see the root [README](../README.md)), then `npm run dev`. The Vite dev server proxies `/api` requests to the backend at `http://localhost:8081`, so the SPA stays same-origin. See [docs/frontend.md](../docs/frontend.md) for the app structure and data flow.