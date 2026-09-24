# Tvorsvit Frontend

React + Vite single-page application for the Tvorsvit worldbuilding app. Currently a minimal workspace: a draft textarea that saves content to the Tvorsvit backend via `POST /api/save-test`.

## Stack

- React 19
- Vite
- ESLint (eslint-plugin-react-hooks, eslint-plugin-react-refresh)

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server on http://localhost:5173 |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint check |
| `npm run preview` | Preview the production build |

## Dev flow

Run the backend first (see the root [README](../README.md)), then `npm run dev`. The frontend calls the backend at `http://localhost:8081`, which is allowed via CORS on the backend.