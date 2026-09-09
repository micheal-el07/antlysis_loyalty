'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const env = require('../config/env');
const { VOUCHER_REWARD_RATE, VOUCHER_VALIDITY_DAYS } = require('../config/constants');

// Demo user + 15 receipts (a mix of pending/approved/rejected) + vouchers
// for the approved ones — purely to make pagination, the status filter,
// and the voucher list demonstrable without a reviewer manually creating
// 10+ receipts and clicking through the approve flow themselves.
// Not a security-sensitive account — credentials are intentionally
// hardcoded and documented in DECISIONS.md, unlike the admin seeder's
// env-driven credentials.
const DEMO_EMAIL = 'demo@antlity.local';
const DEMO_PASSWORD = 'demopassword123';

// pending/approved/rejected counts — approved ones each get a matching
// voucher below, so this is also how many vouchers get seeded.
const STATUS_PLAN = [
  ...Array(8).fill('pending'),
  ...Array(4).fill('approved'),
  ...Array(3).fill('rejected'),
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existingUser] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = :email LIMIT 1`,
      { replacements: { email: DEMO_EMAIL }, type: Sequelize.QueryTypes.SELECT }
    );

    let demoUserId;

    if (existingUser) {
      demoUserId = existingUser.id;
      const [existingReceipt] = await queryInterface.sequelize.query(
        `SELECT id FROM receipts WHERE uploader_id = :uploaderId LIMIT 1`,
        { replacements: { uploaderId: demoUserId }, type: Sequelize.QueryTypes.SELECT }
      );
      if (existingReceipt) {
        console.log('Demo user and receipts already exist, skipping seed.');
        return;
      }
    } else {
      const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, env.bcryptSaltRounds);

      const [inserted] = await queryInterface.sequelize.query(
        `INSERT INTO users (id, name, email, hashed_password, role, created_at, updated_at)
         VALUES (gen_random_uuid(), 'Demo User', :email, :password, 'user', NOW(), NOW())
         RETURNING id`,
        { replacements: { email: DEMO_EMAIL, password: hashedPassword }, type: Sequelize.QueryTypes.SELECT }
      );
      demoUserId = inserted.id;
    }

    // The approved-by admin isn't a fixed ID — it's whichever admin the
    // reviewer's own .env created via the admin seeder. Since sequelize-cli
    // runs seeders in timestamp order, that seeder has already run by the
    // time db:seed:all reaches this one — but guard it explicitly anyway
    // rather than fail on an opaque FK violation if this is ever run alone.
    const [admin] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    if (!admin) {
      throw new Error('No admin account found — run the admin seeder (npm run db:seed:all) first.');
    }
    const adminId = admin.id;

    const receipts = [];
    const vouchers = [];

    STATUS_PLAN.forEach((status, i) => {
      const n = i + 1;
      const daysAgo = STATUS_PLAN.length - i; // spread submissions across the past ~2 weeks
      const receiptId = crypto.randomUUID();
      const purchaseAmount = Number((20 + n * 7.35).toFixed(2));
      const submittedAt = `NOW() - INTERVAL '${daysAgo} days'`;
      const purchasedAt = `NOW() - INTERVAL '${daysAgo + 1} days'`;
      const isApproved = status === 'approved';
      const isRejected = status === 'rejected';

      receipts.push({
        id: receiptId,
        uploader_id: demoUserId,
        image_url: `/uploads/receipts/demo-${n}.png`,
        order_id: `DEMO-${String(n).padStart(3, '0')}`,
        purchase_date: Sequelize.literal(purchasedAt),
        purchase_amount: purchaseAmount.toFixed(2),
        status,
        submission_date: Sequelize.literal(submittedAt),
        approved_at: isApproved ? Sequelize.literal(submittedAt) : null,
        approved_by: isApproved ? adminId : null,
        rejected_reason: isRejected ? 'Image was too blurry to confirm the total.' : null,
      });

      if (isApproved) {
        // Same 5%-rounded-to-cents rule as admin.service.js#calculateVoucherAmount.
        const voucherAmount = Math.round(purchaseAmount * VOUCHER_REWARD_RATE * 100) / 100;
        vouchers.push({
          id: crypto.randomUUID(),
          receipt_id: receiptId,
          uploader_id: demoUserId,
          amount: voucherAmount.toFixed(2),
          expiry_date: Sequelize.literal(`NOW() + INTERVAL '${VOUCHER_VALIDITY_DAYS} days'`),
          created_at: Sequelize.literal(submittedAt),
        });
      }
    });

    await queryInterface.bulkInsert('receipts', receipts);
    if (vouchers.length > 0) {
      await queryInterface.bulkInsert('vouchers', vouchers);
    }
  },

  async down(queryInterface, Sequelize) {
    const [user] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = :email LIMIT 1`,
      { replacements: { email: DEMO_EMAIL }, type: Sequelize.QueryTypes.SELECT }
    );
    if (user) {
      // vouchers first — receipts.id is referenced by vouchers.receipt_id.
      await queryInterface.bulkDelete('vouchers', { uploader_id: user.id });
      await queryInterface.bulkDelete('receipts', { uploader_id: user.id });
      await queryInterface.bulkDelete('users', { id: user.id });
    }
  },
};
