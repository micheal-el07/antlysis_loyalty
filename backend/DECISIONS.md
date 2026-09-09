# Rally — Backend: Decisions, Security & Testing

Companion to [README.md](README.md) (setup, architecture, API reference). This file covers the *why* behind the code: design decisions, security reasoning, bugs found during development, and how correctness was verified.

## Architecture & design decisions

- **Surrogate UUID primary key on `users`, not email.** Email-as-PK would block phone-only registration (email or phone required) and breaks FK typing against `receipts.uploaderId`/`approvedBy` (both UUID).
- **`email` and `phone_number`: nullable + independently unique, not a composite constraint.** A composite would only reject duplicates where *both* fields match, not either individually — this matches "register via email or phone" exactly.
- **Composite unique constraint `(uploader_id, order_id)` on `receipts`** — prevents the same user submitting the same order twice, without falsely blocking two different users who happen to share an order ID format from the same merchant.
- **Unique constraint on `vouchers.receipt_id`** — enforces "0 or 1 voucher per receipt" at the database level, not just in application logic.
- **Voucher amount is a snapshot** (5% of the receipt's purchase amount, taken at approval time), not computed live on read — makes the voucher's value a fixed historical fact, immune to any future change in the reward percentage.
- **Voucher `expiryDate` = 90 days from approval** — not specified in the brief; an explicit default (`VOUCHER_VALIDITY_DAYS` in `config/constants.js`), changeable in one place.
- **`uploaderId` denormalized onto `vouchers`** — avoids a join on the most frequent query this page runs ("my vouchers"). Safe because it's set once at creation, copied from the already-loaded receipt, and never mutates afterward.
- **Rejected receipts are terminal** — no resubmission/edit flow. A user resubmits by uploading a new receipt through the existing upload flow. Rejected receipts are kept, not deleted (audit trail).
- **`rejectedReason` is freeform text**, not an enum of fixed categories — avoids committing to a reason taxonomy with implied per-category follow-up behavior that isn't in the spec.
- **Stateless JWT logout, no Redis-backed blacklist** — deliberate tradeoff. "Logout" clears the client-side token; the token itself remains cryptographically valid until natural expiry. Documented here rather than hidden.
- **BFF-style aggregate `/api/dashboard` endpoint** — avoids a request waterfall (4 separate calls) and computes counts via `COUNT` queries server-side rather than fetching full arrays and filtering client-side.
- **Zod for request validation, one schema per endpoint, via a shared `validate(schema)` middleware** — centralizes error formatting, and Zod's schema-stripping behavior (unknown keys are dropped by default) doubles as mass-assignment protection.
- **Admin seeded at deployment, no self-service admin-creation endpoint.** The seed script hashes the password via bcrypt from `.env`, never plaintext.
- **No repository/data-access layer** — services call Sequelize models directly. Considered, scoped out: the main benefit (mocking DB access for unit tests) is already achieved for the one path that needed it (`admin.service.test.js` mocks the models directly).
- **Business constants centralized in `config/constants.js`** — voucher %, validity days, recent-receipts limit, upload MIME/size limits, rate-limit thresholds, default phone country — rather than scattered as magic numbers across services.
- **Deployment-mode config (Sequelize SQL logging) gated by `NODE_ENV`** — on in development, off in test/production, applied consistently across all three blocks in `config/config.js` rather than one being hardcoded and the others left to Sequelize's default.
- **"Available vouchers"** (dashboard stat) means *not yet expired* (`expiry_date IS NULL OR expiry_date > now`) — the schema has no redeemed/used flag, so expiry is the only signal available (`dashboard.service.js`).
- **`receipts` has no `created_at`** and **`vouchers` has no `updated_at`** — deliberate, matching the schema as specified rather than Sequelize's defaults.

## Business rule → enforcement mapping

| Rule | Enforced by |
|---|---|
| Every receipt starts `pending` | Model default; `status` excluded from the create-receipt request schema entirely |
| Only admin approves/rejects | `requireAdmin` middleware on every admin route |
| Users see only their own receipts/vouchers | Queries scoped to `req.user.userId`, never a client-supplied id |
| Exactly one voucher per approved receipt | Unique constraint on `vouchers.receiptId` + one transaction, backed by row-level locking |
| Rejected receipt generates no voucher | Conditional branch in `admin.service.js`, directly unit-tested |
| Repeat approval doesn't create a second voucher | State-transition guard (`status !== 'pending'` → 409) + pessimistic lock, verified under real concurrency (see Manual Verification) |
| Rules enforced backend-side, not just UI | Umbrella principle behind nearly every item above |

## Security

- Passwords hashed with bcrypt, never returned in any response — `utils/serializers.js` builds every API-facing object as an explicit allow-list (`toPublicUser`, `toAuthUser`, etc.), so `hashedPassword` is simply never one of the fields put on the object, rather than being stripped after the fact.
- JWT signature verified on every request (`jwt.verify`), not just decoded — payload tampering (e.g. editing `role` client-side) fails cryptographically before it ever reaches a route handler.
- `role` can never be client-supplied — hardcoded server-side on registration, excluded from the update-profile schema. Mass-assignment protection.
- Generic authentication failure message on login (same message for "unknown identifier" and "wrong password") — prevents user enumeration.
- IDOR prevention: fetching another user's receipt or voucher by ID returns 404, identical to a genuinely nonexistent ID — doesn't confirm existence of resources the caller doesn't own.
- RBAC via middleware (`requireAdmin`), not UI-hidden buttons — enforced regardless of how the request reaches the server.
- SQL injection: structurally covered — all queries go through Sequelize's parameterized query builder (including the one raw query in the admin seeder, which uses a parameterized replacement, not string interpolation); no raw string-interpolated SQL anywhere in the codebase.
- XSS: structurally covered on the frontend — React escapes all JSX-rendered content by default; no `dangerouslySetInnerHTML` used anywhere in the app.
- CSRF: largely inapplicable — auth uses a JWT sent via `Authorization` header, not a cookie, so the attack class that relies on browsers auto-attaching credentials doesn't apply here.
- Rate limiting on `/auth/login` (10 attempts / 15 min per IP, successful logins don't count against the window) and `/auth/register` (20 / hour per IP) — see `config/constants.js` for the exact thresholds and `middleware/rateLimiter.js`.
- CORS restricted to the configured frontend origin (`FRONTEND_URL`), not wildcard.
- Phone and email normalization (E.164 via `libphonenumber-js`; lowercase for email) prevents duplicate-account creation via cosmetically different but identical values.
- **Required secrets fail loudly when missing.** `JWT_SECRET` and `DB_PASSWORD` have no fallback value — a missing one throws a clear error at startup instead of silently running with a known dev value that ships in this repo's history. Confirmed: `config/env.js#requireEnv` and `config/config.js#dbPassword`.
- `.env` is never committed — confirmed in `.gitignore`.
- Out of scope, stated explicitly rather than silently skipped: deployment-layer hardening (TLS, secrets rotation, dependency scanning), general API rate limiting beyond the auth endpoints.

## Real bugs found & fixed during development

### Significant

- `users` table originally had `email` as primary key — would have blocked phone-only registration and broken FK typing. Caught before any code was written; redesigned with a surrogate UUID PK.
- Phone number format collision allowed duplicate accounts — `01154547878` and `601154547878` (same real number, different formatting) were treated as distinct, bypassing the uniqueness constraint. Fixed via normalization to E.164 at both registration and login (`utils/phone.js`).
- Email case allowed duplicate accounts the same way — `Email@Test.com` and `email@test.com` were treated as different identifiers, so login with a different case than the one used at registration would fail. Fixed by lowercasing email at validation time on both register and profile update, and normalizing the login lookup the same way.
- Dashboard (and every other data-fetching hook on the frontend) silently fell back to hardcoded mock data on any failed fetch, including an expired/invalid token — this masked a real 401 behind what looked like a fully working page. Fixed by removing every dummy-data fallback (`useDashboard`, `useReceipts`, `useVouchers`, `useAdminReceipts`) and replacing it with a real loading/error/retry state; a 401 specifically signs the user out and redirects to `/login` instead of showing anything.
- `JWT_SECRET` and `DB_PASSWORD` both had silent fallback values baked into version-controlled config, so a misconfigured deployment would boot successfully with an insecure, publicly-known secret instead of failing. Fixed to throw a clear startup error when either is missing.

### Minor

- Sequelize SQL logging was inverted — hardcoded off in development (where it's useful for debugging) and left unset in test/production (defaulting to Sequelize's noisy on-by-default behavior, which would have logged every query in production). Fixed by gating on `NODE_ENV` consistently across all three environments.
- Duplicated `BCRYPT_SALT_ROUNDS` derivation in both the admin seeder and `config/env.js` — consolidated to one source (the seeder now imports `env.bcryptSaltRounds`).
- Admin had no page to view already-processed (approved/rejected) receipts, or any list of issued vouchers — only the pending review queue existed. Added a full receipts list with status filtering and a vouchers list, both scoped to admin.

## Automated tests

Targeted at the highest-risk logic — not broad coverage, deliberately scoped to what's previously been buggy or is load-bearing for a business rule. Run with `npm test`.

- **`validators/authValidator.test.js`** — email lowercasing and phone normalization on the register schema, rejection of unparseable phone input, "email or phone required" enforcement, password length minimum, login schema shape.
- **`utils/phone.test.js`** — local Malaysian format → E.164, the exact format-collision bug (bare country code vs. leading-0 form both normalize identically), E.164 passthrough, punctuation stripping, unparseable input returns `null` rather than throwing.
- **`services/admin.service.test.js`** — models mocked, so this tests the service's own logic in isolation: `NotFoundError` on a missing receipt, `ConflictError` on an already-reviewed receipt, correct 5%-of-purchase-amount voucher creation on approve, decimal rounding correctness (10.005 × 0.05 rounds to 0.50, not raw float noise), reject records the reason and never creates a voucher.

## Manual verification

Not automated — actually run against a live server/database, not just reasoned about:

- **Concurrent approval race.** Fired two simultaneous `PATCH` requests against the same pending receipt. Result: one `200`, one `409`; exactly one voucher row exists afterward. A pessimistic row lock (`SELECT ... FOR UPDATE`) serializes the two transactions, so the second request only proceeds after the first has already committed the status change, and hits the state-transition guard rather than ever reaching voucher creation. The unique constraint on `vouchers.receiptId` remains as defense-in-depth for any code path that bypasses the lock.
- **Transaction rollback.** Forced a failure between the receipt status update and voucher creation, inside the same transaction. Confirmed the receipt remained `pending` afterward — the whole transaction rolled back, not just the part after the injected failure.
- **Cross-user access (IDOR).** Fetched another user's receipt/voucher by a known valid UUID; confirmed `404`, not the record.
- **Duplicate registration.** Confirmed a clean `409` on repeated email/phone, backed by the DB unique constraint as a backstop to the pre-insert check.
- **Error-path coverage.** Confirmed each validation/business-rule failure returns its own specific error rather than a generic fallback — including confirming a malformed-but-present phone number produces the phone-specific validation message rather than the unrelated "email or phone required" message.

## Known limitations & tradeoffs

Stated explicitly rather than hidden:

- **No pagination.** Would apply to the admin's full receipts/vouchers lists and, at scale, user receipt history. Deferred given the timeline; `LIMIT`/`OFFSET` or cursor-based pagination is the intended approach.
- **No Redis-backed JWT invalidation.** Stateless logout is a deliberate choice; a "logged out" token remains valid until natural expiry.
- **Voucher value (5%) and expiry (90 days) are both assumptions**, not specified in the brief. Both are centralized as named constants (`config/constants.js`) so they're a one-line change if the actual business rule differs.
- **No rate limiting beyond the auth endpoints.** General API throttling is not implemented.
- **Phone normalization defaults to Malaysian format** for numbers without an explicit country code (`DEFAULT_PHONE_COUNTRY` in `config/constants.js`) — international numbers without a leading `+` may not normalize correctly.
- **Receipt images are served via a static route with no per-request auth check** — relies on unguessable UUID-derived filenames rather than an access-control check on the file-serving route itself.
- **No broad automated test suite.** Targeted unit tests on the highest-risk logic only (see Automated Tests); everything else verified manually and deliberately (see Manual Verification), given the assessment timeline.
- **Frontend/backend constants aren't shared.** The upload size limit (10MB) and the dashboard's "recent receipts" count exist as separate literals in frontend copy/logic, not sourced from the backend's `config/constants.js`. Would consolidate via a shared config package in a larger codebase.
- **Docker.** A `docker-compose` setup (backend + Postgres) was sketched out and discussed but scoped out of this submission given the assessment timeline — the app currently expects a locally-running or externally-hosted Postgres instance per the Setup instructions above.

## AI-assisted development note

Used Claude/Claude Code throughout — for scaffolding syntax in Node/Express/Sequelize, and for accelerating the React/frontend work. Architecture, schema design, business-rule reasoning, and security decisions were made and directed personally; AI-generated code was reviewed, tested, and in several cases corrected (see Real Bugs Found & Fixed) rather than accepted as-is.
