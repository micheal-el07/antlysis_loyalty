const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { sequelize, User } = require('../models');
const env = require('../config/env');
const { signToken } = require('../utils/jwt');
const { blockToken } = require('./tokenBlocklist.service');
const { toAuthUser } = require('../utils/serializers');
const { normalizePhoneNumber } = require('../utils/phone');
const { UnauthenticatedError, ConflictError } = require('../utils/errors');
const { MAX_USER_ACCOUNTS } = require('../config/constants');

// Arbitrary fixed key for the registration-cap advisory lock — any bigint
// works, it just needs to be the same one on every call. Transaction-scoped
// (`pg_advisory_xact_lock`), so it releases automatically on commit/rollback.
const REGISTRATION_CAP_LOCK_KEY = 72700100;

async function register({ name, email, phoneNumber, password }) {
  const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds);

  return sequelize.transaction(async (transaction) => {
    // Serializes concurrent registrations so two requests can't both pass
    // the count check and both land as the (cap+1)th user.
    await sequelize.query('SELECT pg_advisory_xact_lock(:key)', {
      replacements: { key: REGISTRATION_CAP_LOCK_KEY },
      transaction,
    });

    const existing = await User.findOne({
      where: {
        [Op.or]: [...(email ? [{ email }] : []), ...(phoneNumber ? [{ phoneNumber }] : [])],
      },
      transaction,
    });

    if (existing) {
      throw new ConflictError('An account with this email or phone number already exists.');
    }

    const userCount = await User.count({ where: { role: 'user' }, transaction });
    if (userCount >= MAX_USER_ACCOUNTS) {
      throw new ConflictError('This demo instance is not accepting new accounts right now.');
    }

    // role is never taken from the request — every self-registration is a
    // plain user; admins are provisioned separately.
    const user = await User.create(
      {
        name,
        email: email || null,
        phoneNumber: phoneNumber || null,
        hashedPassword,
        role: 'user',
      },
      { transaction }
    );

    return { token: signToken(user), user: toAuthUser(user) };
  });
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

// Tokens issued before jti support carry no id and can't be revoked; they
// simply age out.
async function logout({ jti, exp }) {
  if (jti && exp) {
    await blockToken(jti, exp);
  }
  return null;
}

module.exports = { register, login, logout };
