'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('receipts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      uploader_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      image_url: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      order_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      purchase_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      purchase_amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      submission_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      approved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      rejected_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('receipts', ['uploader_id']);
    await queryInterface.addIndex('receipts', ['uploader_id', 'order_id'], {
      unique: true,
      name: 'receipts_uploader_id_order_id_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('receipts');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_receipts_status";');
  },
};
