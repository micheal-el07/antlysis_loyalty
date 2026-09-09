'use strict';

const bcrypt = require('bcrypt');
const env = require('../config/env');

module.exports = {
  async up(queryInterface, Sequelize) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding.');
    }

    // Idempotency check — running this seeder twice shouldn't create two admins
    // or throw a unique-constraint error.
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = :email LIMIT 1`,
      { replacements: { email }, type: Sequelize.QueryTypes.SELECT }
    );

    if (existing) {
      console.log('Admin already exists, skipping seed.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds);

    await queryInterface.bulkInsert('users', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Admin',
        email,
        phone_number: null,
        hashed_password: hashedPassword,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { role: 'admin' });
  },
};