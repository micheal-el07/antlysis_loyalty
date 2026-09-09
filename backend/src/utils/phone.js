const { z } = require('zod');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const { DEFAULT_PHONE_COUNTRY: DEFAULT_COUNTRY } = require('../config/constants');

// Normalizes any of the ways a user might type the same number — with a
// trunk "0", with the "60" country code but no "+", already in E.164 — down
// to one canonical E.164 string, so "011-2345 6789" and "60112345678" are
// recognized as the same number instead of registering as two accounts.
function normalizePhoneNumber(input, defaultCountry = DEFAULT_COUNTRY) {
  const parsed = parsePhoneNumberFromString(String(input), defaultCountry);
  return parsed && parsed.isValid() ? parsed.number : null;
}

// Reusable Zod field: accepts null/undefined/'' as "no phone number", and
// otherwise requires a value that normalizes to a valid E.164 number.
const phoneNumberSchema = z
  .string()
  .nullable()
  .optional()
  .transform((val, ctx) => {
    if (!val) return val;
    const normalized = normalizePhoneNumber(val);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid phone number, e.g. 011-2345 6789 or +60 11-2345 6789.',
      });
      return z.NEVER;
    }
    return normalized;
  });

module.exports = { normalizePhoneNumber, phoneNumberSchema, DEFAULT_COUNTRY };
