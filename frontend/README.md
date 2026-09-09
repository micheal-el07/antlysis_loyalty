# Antlity — Frontend

A loyalty-rewards web app: users upload purchase receipts, admins review and approve/reject them, and approved receipts automatically generate vouchers. This is the React frontend; it talks to the Express/PostgreSQL backend in `../backend`.

## Stack

- React 19 + Vite
- React Router 7
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Plain `fetch` for API calls (no data-fetching library) — each resource has a small custom hook in `src/hooks/`

## Prerequisites

- Node.js
- The backend running locally (see `../backend/README.md`) — the dev server proxies API calls to it

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. `vite.config.js` proxies `/api/*` and `/uploads/*` to `http://localhost:4000`, so the backend must be running on port 4000 (its default), with a real user account to log in with — there's no dev-mode auth bypass anymore now that the database is wired up. Every data-fetching hook shows a real loading/error state and a retry button if its request fails — there's no dummy-data fallback masking a broken backend or an expired token; a 401 specifically signs the user out and redirects to `/login`.

The backend's CORS config only allows requests from `http://localhost:5173` by default (`FRONTEND_URL` in its `.env`) — if this dev server starts on a different port (Vite auto-increments if 5173 is already taken), update that value on the backend side too.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run oxlint |

## Auth

`src/context/AuthContext.jsx` holds the JWT + user object, persisted to `localStorage` (`antlity_auth`) so a refresh doesn't log you out. `src/components/ProtectedRoute.jsx` gates routes — unauthenticated users are bounced to `/login` (and returned to where they were headed afterward, if that page matches their role); an optional `role="admin"` prop additionally gates the whole `/admin/*` route tree.

Every authenticated `fetch` call attaches `Authorization: Bearer <token>` manually — there's no central HTTP client wrapper, so a new hook needs to do this itself (see any file in `src/hooks/` for the pattern).

## Project structure

```
src/
  pages/        route-level screens (one per route in App.jsx)
  components/   shared UI + a few page-specific presentational pieces
  hooks/        per-resource data fetching (useDashboard, useReceipts, useVouchers, useAdminReceipts)
  context/      AuthContext (session state)
  App.jsx       route table
  main.jsx      entry point, wraps App in AuthProvider + BrowserRouter
```

## Routes

| Path | Access | Page |
|---|---|---|
| `/login`, `/register` | public | `Login.jsx`, `Register.jsx` |
| `/` | any authenticated user | `UserDashboard.jsx` |
| `/upload` | any authenticated user | `ReceiptUpload.jsx` |
| `/history` | any authenticated user | `ReceiptHistory.jsx` |
| `/vouchers` | any authenticated user | `VoucherList.jsx` |
| `/settings` | any authenticated user | `AccountSettings.jsx` |
| `/admin` | `role: admin` | `AdminDashboard.jsx` |
| `/admin/receipts` | `role: admin` | `AdminReceipts.jsx` |
| `/admin/vouchers` | `role: admin` | `AdminVouchers.jsx` |
| `/admin/review` | `role: admin` | `AdminReceiptReview.jsx` |

## Notes / known quirks

- API amounts (`purchaseAmount`, voucher `amount`) come back from the backend as **strings**, not numbers (Postgres `DECIMAL` via Sequelize) — always wrap with `Number(...)` before calling `.toFixed()` or doing arithmetic. This has bitten the codebase once already; see `ReceiptDetailModal.jsx` / `RecentReceipts.jsx` for the pattern.
- Voucher API responses use `snake_case` field names (`receipt_id`, `expiry_date`, `created_at`) while receipt/dashboard responses use `camelCase` — this mismatch was set by an earlier explicit API spec and is intentional, not a bug to "fix" into consistency.
- There's no shared HTTP client or React Query-style cache — each hook does its own `fetch`/`useEffect`. Fine at this scale; worth revisiting if the number of resources grows much further.
