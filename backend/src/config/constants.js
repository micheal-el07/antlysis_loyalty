// Fixed business/policy decisions that don't vary by environment or
// deployment — as opposed to config/env.js (machine-specific config) and
// config/config.js (per-NODE_ENV behavior).

// Voucher amount = this fraction of the receipt's purchase amount.
const VOUCHER_REWARD_RATE = 0.05;

// Not specified by the schema/spec — defaulted to 90 days from approval.
const VOUCHER_VALIDITY_DAYS = 90;

// How many of a user's most recent receipts the dashboard summary includes.
const RECENT_RECEIPTS_LIMIT = 5;

// Receipt uploads: accepted file types and max size.
const RECEIPT_UPLOAD_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);
const RECEIPT_UPLOAD_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Login: brute-force protection window/threshold.
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 10;

// Register: spam-account-creation window/threshold.
const REGISTER_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const REGISTER_RATE_LIMIT_MAX_ATTEMPTS = 20;

// Phone numbers are collected without a country selector, so this is the
// country assumed when a number isn't already in international form
// (leading +).
const DEFAULT_PHONE_COUNTRY = 'MY';

// List endpoints (receipts, admin receipts, vouchers): applied only when
// the caller actually asks to paginate (see utils/pagination.js) — the cap
// stops a client requesting an unreasonably large page in one request.
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

module.exports = {
  VOUCHER_REWARD_RATE,
  VOUCHER_VALIDITY_DAYS,
  RECENT_RECEIPTS_LIMIT,
  RECEIPT_UPLOAD_ALLOWED_MIME_TYPES,
  RECEIPT_UPLOAD_MAX_FILE_SIZE_BYTES,
  LOGIN_RATE_LIMIT_WINDOW_MS,
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  REGISTER_RATE_LIMIT_WINDOW_MS,
  REGISTER_RATE_LIMIT_MAX_ATTEMPTS,
  DEFAULT_PHONE_COUNTRY,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
};
