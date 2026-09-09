# Antlity — Deployment

A loyalty-rewards app: users upload purchase receipts, admins approve or reject them, and an approved receipt automatically generates a voucher. Backend (`backend/`) is Express + PostgreSQL; frontend (`frontend/`) is React + Vite. This file covers getting the whole thing running. For how it's built, see [backend/README.md](backend/README.md) and [backend/DECISIONS.md](backend/DECISIONS.md); for the frontend specifically, [frontend/README.md](frontend/README.md).

## Option A — Docker (recommended)

Runs Postgres + the backend in containers with pinned versions, so setup doesn't depend on what's already installed locally. The frontend still runs natively so you get a live dev server.

**1. Clone and enter the repo**

```bash
git clone <repo-url>
cd antlysis_loyalty
```

**2. Create your env file from the template**

```bash
cp .env.example .env
```

**3. Edit `.env`** and set at minimum:

- `JWT_SECRET` — any long random string. The app refuses to boot without this.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the login for the one admin account, created automatically on first startup.

(`DB_NAME`/`DB_USER`/`DB_PASSWORD` and the rest already have working defaults for local use — change them only if you need to.)

**4. Start Postgres + the backend**

```bash
docker compose up --build
```

(On an older Docker install without the `docker compose` plugin, use the hyphenated `docker-compose up --build` instead — same effect.)

This builds the backend image, waits for Postgres to actually accept connections, runs migrations, then seeds the database — the admin account from step 3, plus a demo user (`demo@antlity.local` / `demopassword123`) with 15 sample receipts (a mix of pending/approved/rejected) and their matching vouchers, so pagination, filtering, and search are demonstrable immediately without creating data by hand. The API is now live at `http://localhost:4000`. Re-running `docker compose up --build` later is safe; migrations and seeds are idempotent.

**5. In a new terminal, start the frontend**

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`, proxying API calls to the backend container on port 4000.

**Stopping:** `Ctrl+C` in the compose terminal, then `docker compose down` (add `-v` only if you also want to wipe the database volume).

## Option B — Manual backend (no Docker)

Fallback if Docker isn't available. Requires your own PostgreSQL instance — either installed locally, or just the `postgres` service from the compose file on its own (`docker compose up postgres`, no backend container) if you'd rather not install Postgres directly.

**1. Backend setup**

```bash
cd backend
npm install
cp .env.example .env
```

**2. Edit `backend/.env`** — this is a _separate_ file from the root one used by Docker:

- `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` — point these at your actual Postgres instance (defaults assume `127.0.0.1:5432` with the sample credentials already in the file).
- `JWT_SECRET` — required, same as above.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — same as above.

**3. Migrate and seed**

```bash
npm run db:migrate
npm run db:seed:all
```

**4. Start the API**

```bash
npm run dev      # nodemon, auto-restarts on changes
# or: npm start  # plain node, single run
```

Live at `http://localhost:4000`.

**5. Frontend** — same as Option A, step 5:

```bash
cd frontend
npm install
npm run dev
```

## Verifying it worked

- `curl http://localhost:4000/health` → `{"success":true,"data":{"status":"ok"}}`
- Sign in at `http://localhost:5173/login` with the `ADMIN_EMAIL`/`ADMIN_PASSWORD` you set, or the demo user (`demo@antlity.local` / `demopassword123`) to see it from a regular member's side.
