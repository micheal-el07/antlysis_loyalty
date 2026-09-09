# Rally — Backend: Decisions, Security & Testing

Companion to [README.md](README.md). Dense by design — full reasoning behind any item here is available on request/in interview.

## Design decisions

| Decision | Why |
|---|---|
| Surrogate UUID PK on `users`, not email | Email-as-PK blocks phone-only registration and breaks FK typing |
| `email`/`phone_number`: nullable + independently unique | Composite unique would only catch duplicates matching on *both* fields |
| Composite unique `(uploader_id, order_id)` on receipts | Blocks same-user duplicate submission without blocking two users sharing an order ID format |
| Unique constraint on `vouchers.receipt_id` | Enforces 0-or-1 voucher per receipt at the DB level |
| Voucher `amount` = snapshot at approval (5% of purchase) | Fixed historical fact, immune to future rate changes |
| Voucher `expiryDate` = 90 days | Not specified in brief; named constant, one-line change |
| `uploaderId` denormalized onto `vouchers` | Avoids a join on the most common query ("my vouchers"); safe since it's set once and never mutates |
| Rejected receipts are terminal | No resubmission flow — user just uploads a new receipt. Kept, not deleted (audit trail) |
| `rejectedReason` freeform text, not enum | Avoids committing to a reason taxonomy with implied follow-up behavior |
| Stateless JWT logout, no Redis blacklist | Deliberate tradeoff — token valid until natural expiry after logout |
| `/api/dashboard` as one BFF-style aggregate endpoint | Avoids a 4-call waterfall; counts computed server-side |
| Zod validation via shared `validate(schema)` middleware | Centralizes error formatting; schema-stripping doubles as mass-assignment protection |
| Admin seeded at deploy, no self-service admin creation | Seed script hashes password via bcrypt from `.env` |
| No repository/data-access layer | Services call models directly — the one path needing DB mocking (`admin.service.test.js`) already mocks models directly |
| Business constants centralized (`config/constants.js`) | Voucher %, validity days, upload limits, rate-limit thresholds — not scattered magic numbers |
| Sequelize SQL logging gated by `NODE_ENV` | On in dev, off in test/prod, consistent across all three blocks |
| "Available vouchers" = not-yet-expired | No redeemed/used flag in schema; expiry is the only signal |
| No `created_at` on receipts / `updated_at` on vouchers | Deliberate, matches schema as specified |

## Business rules → enforcement

| Rule | Enforced by |
|---|---|
| Receipt starts `pending` | Model default; `status` excluded from create schema |
| Only admin approves/rejects | `requireAdmin` middleware |
| Users see only own data | Queries scoped to `req.user.userId`, never client-supplied |
| Exactly one voucher per approval | Unique constraint + transaction + row lock |
| Rejected → no voucher | Tested branch in `admin.service.test.js` |
| No duplicate voucher on repeat approval | State-transition guard + pessimistic lock, verified under real concurrency |
| Backend enforces, not just UI | Applies to every row above |

## Security

| Concern | Mitigation |
|---|---|
| Password exposure | bcrypt hashed; API responses built via explicit allow-list serializers, `hashedPassword` never included |
| Token tampering | JWT signature verified (`jwt.verify`), not just decoded |
| Privilege escalation | `role` hardcoded server-side, never client-settable, on register or update |
| User enumeration | Identical error message for unknown identifier vs. wrong password |
| IDOR | Cross-user receipt/voucher access returns 404, same as nonexistent |
| Unauthorized admin access | `requireAdmin` middleware, not UI-hidden buttons |
| SQL injection | Parameterized queries throughout, no raw string interpolation |
| XSS | React's default JSX escaping, no `dangerouslySetInnerHTML` |
| CSRF | Header-based JWT (not cookie), largely inapplicable |
| Brute force / credential stuffing | Rate-limited login (10/15min) and register (20/hr) |
| Cross-origin abuse | CORS restricted to `FRONTEND_URL`, not wildcard |
| Duplicate accounts via formatting | Email lowercased, phone normalized to E.164 |
| Insecure default secrets | `JWT_SECRET`/`DB_PASSWORD` required — app refuses to boot if missing |
| Secret leakage | `.env` never committed |

Out of scope, by choice: TLS, secrets rotation, dependency scanning, general (non-auth) rate limiting.

## Bugs found & fixed

Documented as evidence of the verification process, not despite it.

**Significant**
- `users` PK was originally email — blocked phone-only registration, broke FK typing. Caught pre-code, redesigned with surrogate UUID.
- Phone format collision (`01...` vs `601...`) allowed duplicate accounts — fixed via E.164 normalization on register + login.
- Email case (`Test@x.com` vs `test@x.com`) allowed the same — fixed via lowercasing on register, update, and login lookup.
- Every data-fetching hook silently fell back to mock data on fetch failure, including an expired token — surfaced via cross-device testing, masked a real 401 as a working page. Fixed: real loading/error/retry states, 401 now redirects to login.
- `JWT_SECRET`/`DB_PASSWORD` had silent insecure fallbacks — fixed to fail loudly on boot instead.

**Minor**
- Sequelize logging was inverted (off in dev, defaulting to noisy in prod) — gated by `NODE_ENV` correctly.
- `BCRYPT_SALT_ROUNDS` derived in two places — consolidated to one.
- Admin had no view of already-processed receipts or issued vouchers — added.

## Testing

**Automated** (`npm test`) — targeted at highest-risk logic, not broad coverage:
- `authValidator.test.js` — email/phone normalization, required-field logic, password rules
- `phone.test.js` — the exact format-collision bug, E.164 passthrough, malformed input
- `admin.service.test.js` — models mocked; status transitions, voucher creation, decimal rounding (`10.005 × 0.05 = 0.50`, not float noise)

**Manual** (against a live server/DB):
- Concurrent double-approve → one `200`, one `409`, exactly one voucher — row lock serializes before the unique constraint would need to
- Forced mid-transaction failure → confirmed full rollback, not partial
- Cross-user access by known UUID → confirmed 404
- Duplicate registration race → confirmed 409, backed by DB constraint
- Section 9's required error cases → each confirmed to return its specific message, not a generic fallback

## Known limitations

- No pagination (optional per spec; deferred)
- No Redis-backed JWT invalidation (stateless logout, documented tradeoff)
- Voucher rate (5%) and expiry (90 days) are assumptions, centralized as named constants
- No rate limiting beyond auth endpoints
- Phone normalization assumes Malaysian format for un-prefixed numbers
- Receipt images served via unguessable UUID filename, no per-request auth check on the static route
- No broad test suite — targeted unit tests + deliberate manual verification only
- Frontend upload-limit copy and "recent receipts" count aren't sourced from backend constants
- Docker: built — `docker-compose.yml` at the repo root runs backend + Postgres with pinned versions, so setup doesn't depend on the reviewer's local Node/Postgres. Deliberately covers backend + DB only, not the frontend — see `backend/README.md#docker`. One caveat: the wait-for-Postgres logic is a plain retry loop (`backend/docker-entrypoint.sh`), not a Compose `depends_on: condition: service_healthy`, because that syntax needs a newer Compose file version than every reviewer's Docker install can be assumed to have.

## AI-assisted development

Used Claude/Claude Code for Node/Express/Sequelize syntax and React/frontend acceleration — stack extensions beyond primary Python/FastAPI background. Architecture, schema, business logic, and security decisions were made and directed personally; generated code was reviewed, tested, and corrected where needed (see Bugs above).
