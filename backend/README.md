# Rally — Backend

Express/PostgreSQL API for the Rally loyalty program: users upload purchase receipts, admins approve or reject them, and an approved receipt automatically generates a voucher for the uploader. Layered architecture — routes hold no logic, controllers only translate requests/responses, business rules live in services, Sequelize models are schema-only. No route or controller ever queries a model directly.

## Stack

- Express 4
- Sequelize 6 + sequelize-cli, PostgreSQL
- JWT (`jsonwebtoken`) + `bcrypt` for auth
- `multer` for receipt image uploads
- `zod` for request validation
- `express-rate-limit` on the auth endpoints
- `libphonenumber-js` for phone number normalization
- `jest` for unit tests

## Prerequisites

- Node.js
- A running PostgreSQL instance

## Setup

```bash
npm install
cp .env.example .env   # then edit DB_* and JWT_SECRET for your machine
npm run db:migrate
npm run db:seed:all    # creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD in .env
npm run dev
```

Server starts on `PORT` from `.env` (default `4000`). Health check: `GET /health` → `{"success":true,"data":{"status":"ok"}}`.

`JWT_SECRET` and `DB_PASSWORD` are required — the app throws a clear startup error and refuses to boot if either is missing, rather than silently falling back to a known dev value (see [Security](#security)).

Registration (`POST /api/v1/auth/register`) always creates a `role: "user"` account — there's no self-service way to become an admin. The seeder above is the only way to get an admin login for local testing.

## Docker

An alternative to the manual setup above — pins the exact Postgres and Node versions so setup doesn't depend on whatever's already installed locally. Covers the backend + Postgres only; the frontend still runs with `npm run dev` (see `../frontend/README.md`).

```bash
cp ../.env.example ../.env   # repo root — fill in JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up --build    # or `docker-compose up --build` on an older Docker install
```

This starts Postgres, then the backend's `docker-entrypoint.sh` retries migrations until Postgres actually accepts connections (container start ≠ DB ready), runs the idempotent admin seeder, and starts the API on `http://localhost:4000`. Re-running `up` against an existing database is safe — both migrate and seed are idempotent.

The compose file lives at the repo root (`../docker-compose.yml`) since it orchestrates two services, not just this one; its `.env` is separate from this directory's `.env` (used for the non-Docker setup above) since `DB_HOST`/`DB_PORT` need different values in each context (`postgres`/`5432` inside the Docker network vs. `127.0.0.1`/`5435` on the host).

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Start the server with `nodemon` (auto-restart) |
| `npm start` | Start the server once, plain `node` |
| `npm test` | Run the Jest unit tests |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:migrate:undo` | Roll back the most recent migration |
| `npm run db:migrate:undo:all` | Roll back every migration |
| `npm run db:seed:all` | Run seeders (currently: the admin account) |

## Environment variables

See `.env.example` for the full list with defaults. Notable ones:

| Var | Purpose |
|---|---|
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | Postgres connection (dev environment). **`DB_PASSWORD` is required** — no silent fallback |
| `DB_NAME_TEST` | Separate database for the `test` Sequelize environment |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Token signing. **`JWT_SECRET` is required** — no silent fallback, in any environment |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost |
| `FRONTEND_URL` | Allowed CORS origin (defaults to `http://localhost:5173` for local dev) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Consumed only by the seeder, to create the one admin account |

## Architecture

```
src/
  config/       env config, DB connection, multer (upload) config, business constants
  models/       schema, types, associations only — no cross-model orchestration
  migrations/   sequelize-cli migrations
  seeders/      admin account seed script
  routes/       path -> middleware chain -> controller. Zero logic.
  controllers/  parse req, call a service, sendSuccess/next(err). Never touch a model directly.
  services/     business logic: validation rules, orchestration, transactions, calls to models
  middleware/   auth (JWT verify), requireAdmin, validate (Zod), rate limiting, centralized error handler
  validators/   one Zod schema per endpoint (or shared, e.g. commonValidator's idParamSchema)
  utils/        response formatters, custom error classes, JWT signing, phone normalization, entity serializers
  app.js        Express app + middleware/route mounting
  server.js     entry point — connects the DB, then starts listening
```

Every response follows one of two shapes:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "message": "...", "code": "SOME_CODE" } }
```
All errors — thrown `AppError` subclasses from `utils/errors.js`, Sequelize errors, Multer errors, Zod validation failures — flow through the single `errorHandler` middleware (mounted last in `app.js`). Nothing upstream formats an error response itself.

## Auth

JWTs carry `{ userId, role }`. `middleware/auth.js` verifies the `Authorization: Bearer <token>` header and sets `req.user = { userId, role }`; `middleware/requireAdmin.js` (mounted after it) rejects with 403 unless `role === "admin"`.

## API

Base URL: `http://localhost:4000` (or your configured `PORT`).

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | — | |
| POST | `/api/v1/auth/register` | — | rate-limited · `{ name, email?, phoneNumber?, password }` — email or phone required; always creates `role: "user"` |
| POST | `/api/v1/auth/login` | — | rate-limited · `{ identifier, password }` |
| POST | `/api/v1/auth/logout` | ✓ | stateless JWT — no server-side effect, just a symmetric endpoint |
| GET | `/api/v1/users/me` | ✓ | |
| PUT | `/api/v1/users/me` | ✓ | any of `{ name, email, phoneNumber }` |
| GET | `/api/v1/receipts` | ✓ | own receipts only |
| GET | `/api/v1/receipts/:id` | ✓ | 404 if it's not yours |
| POST | `/api/v1/receipts` | ✓ | `multipart/form-data`: file field `image`, plus `orderId`, `purchaseDate` (ISO datetime), `purchaseAmount`. Status is always forced to `pending` server-side |
| GET | `/api/v1/admin/receipts` | ✓ + admin | all receipts, every user, includes `uploader: { id, name }` |
| GET | `/api/v1/admin/receipts/:id` | ✓ + admin | |
| PATCH | `/api/v1/admin/receipts/:id` | ✓ + admin | `{ status: "approved" }` or `{ status: "rejected", rejectedReason }` |
| GET | `/api/v1/vouchers` | ✓ | admin: all (includes `owner`/`order_id`); user: own only |
| GET | `/api/v1/vouchers/:id` | ✓ | 404 if not yours (unless admin) |
| GET | `/api/dashboard` | ✓ | **unversioned, no `/auth` prefix** — aggregate summary (see below) |
| GET | `/uploads/receipts/:filename` | — | static file serving for uploaded receipt images |

`GET /api/dashboard` is intentionally outside `/api/v1` — it predates the versioned resource endpoints and the frontend already depends on that exact path. Response:
```json
{
  "success": true,
  "data": {
    "user": { "name": "..." },
    "stats": { "pendingReceipts": 0, "approvedReceipts": 0, "availableVouchers": 0 },
    "recentReceipts": [ /* up to 5, newest first */ ]
  }
}
```

For design decisions, security reasoning, bug history, and testing notes, see [DECISIONS.md](DECISIONS.md).
