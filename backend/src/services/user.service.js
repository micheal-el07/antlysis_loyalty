const { Op } = require('sequelize');
const { User } = require('../models');
const { toPublicUser } = require('../utils/serializers');
const { NotFoundError, ConflictError } = require('../utils/errors');

async function getById(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found.');
  return toPublicUser(user);
}

async function updateProfile(userId, updates) {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found.');

  if (updates.email || updates.phoneNumber) {
    const existing = await User.findOne({
      where: {
        id: { [Op.ne]: userId },
        [Op.or]: [
          ...(updates.email ? [{ email: updates.email }] : []),
          ...(updates.phoneNumber ? [{ phoneNumber: updates.phoneNumber }] : []),
        ],
      },
    });
    if (existing) {
      throw new ConflictError('That email or phone number is already in use.');
    }
  }

  await user.update(updates);
  return toPublicUser(user);
}

module.exports = { getById, updateProfile };
