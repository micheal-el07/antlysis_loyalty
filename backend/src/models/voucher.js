'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
    static associate(models) {
      Voucher.belongsTo(models.Receipt, { foreignKey: 'receiptId', as: 'receipt' });
    }
  }

  Voucher.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      receiptId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'receipts', key: 'id' },
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Voucher',
      tableName: 'vouchers',
      underscored: true,
      // Schema specifies created_at only — no updated_at column.
      timestamps: true,
      updatedAt: false,
    }
  );

  return Voucher;
};
