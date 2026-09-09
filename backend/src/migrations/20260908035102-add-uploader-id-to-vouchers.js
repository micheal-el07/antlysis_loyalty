'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('vouchers', 'uploader_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    });
    await queryInterface.addIndex('vouchers', ['uploader_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('vouchers', 'uploader_id');
  },
};
