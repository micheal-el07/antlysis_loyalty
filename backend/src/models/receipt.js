'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Receipt extends Model {
    static associate(models) {
      Receipt.belongsTo(models.User, { foreignKey: 'uploaderId', as: 'uploader' });
      Receipt.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approver' });
      Receipt.hasOne(models.Voucher, { foreignKey: 'receiptId', as: 'voucher' });
    }
  }

  Receipt.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      uploaderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      orderId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      purchaseDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isBeforeNow(value) {
            if (new Date(value).getTime() > Date.now()) {
              throw new Error('purchaseDate must be before the current time.');
            }
          },
        },
      },
      purchaseAmount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: { min: 0 },
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      submissionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      rejectedReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Receipt',
      tableName: 'receipts',
      underscored: true,
      // No created_at/updated_at columns — submissionDate serves that role
      // per the schema as specified.
      timestamps: true,
      createdAt: false,
      updatedAt: 'updatedAt',
      indexes: [
        { fields: ['uploader_id'] },
        {
          unique: true,
          fields: ['uploader_id', 'order_id'],
          name: 'receipts_uploader_id_order_id_unique',
        },
      ],
    }
  );

  return Receipt;
};
