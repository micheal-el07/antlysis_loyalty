const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User } = require('../models');
const env = require('../config/env');
const { signToken } = require('../utils/jwt');
const { toAuthUser } = require('../utils/serializers');
const { normalizePhoneNumber } = require('../utils/phone');
const { UnauthenticatedError, ConflictError } = require('../utils/errors');

async function register({ name, email, phoneNumber, password }) {
  const existing = await User.findOne({
    where: {
      [Op.or]: [...(email ? [{ email }] : []), ...(phoneNumber ? [{ phoneNumber }] : [])],
    },
  });

  if (existing) {
    throw new ConflictError('An account with this email or phone number already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds);

  // role is never taken from the request — every self-registration is a
  // plain user; admins are provisioned separately.
  const user = await User.create({
    name,
    email: email || null,
    phoneNumber: phoneNumber || null,
    hashedPassword,
    role: 'user',
  });

  return { token: signToken(user), user: toAuthUser(user) };
}

async function login(identifier, password) {
  // The identifier can be an email or a phone number typed in whatever
  // format/case the user likes — normalize it the same way registration
  // does (lowercased email / E.164 phone) so it still matches the value
  // stored on the account.
  const isEmail = identifier.includes('@');
  const normalizedIdentifier = isEmail
    ? identifier.toLowerCase()
    : normalizePhoneNumber(identifier) || identifier;

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email: normalizedIdentifier }, { phoneNumber: normalizedIdentifier }],
    },
  });

  // Same generic message whether the identifier or the password was wrong,
  // so a caller can't use this endpoint to enumerate registered accounts.
  if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
    throw new UnauthenticatedError('Invalid email/phone or password.');
  }

  return { token: signToken(user), user: toAuthUser(user) };
}

// JWTs are stateless and there's no token-blacklist table in the schema, so
// there is nothing server-side to invalidate — the client dropping the
// token is what actually "logs out". Kept as an explicit service function
// (rather than a no-op in the controller) so the business decision — that
// logout has no server-side effect today — lives here, not in the request
// handling layer.
async function logout() {
  return null;
}

module.exports = { register, login, logout };
