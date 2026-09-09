// Unit tests for the approve/reject transaction — the most business-critical
// path in the app (it's the only place a voucher ever gets created). Models
// are mocked so this runs without a real database: it's testing the
// service's own logic (status transitions, the 5%-rounded voucher amount,
// which branch creates a voucher), not Sequelize or Postgres.
jest.mock('../models', () => ({
  sequelize: {
    transaction: (fn) => fn({ LOCK: { UPDATE: 'UPDATE' } }),
  },
  Receipt: { findByPk: jest.fn() },
  Voucher: { create: jest.fn() },
  User: {},
}));

const { Receipt, Voucher } = require('../models');
const { updateReceiptStatus } = require('./admin.service');
const { NotFoundError, ConflictError } = require('../utils/errors');

function makeReceipt(overrides = {}) {
  return {
    id: 'receipt-1',
    uploaderId: 'user-1',
    status: 'pending',
    purchaseAmount: '64.18',
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('admin.service#updateReceiptStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws NotFoundError when the receipt does not exist', async () => {
    Receipt.findByPk.mockResolvedValue(null);

    await expect(
      updateReceiptStatus('missing-id', 'admin-1', { status: 'approved' })
    ).rejects.toThrow(NotFoundError);
  });

  it('throws ConflictError when the receipt was already reviewed', async () => {
    Receipt.findByPk.mockResolvedValue(makeReceipt({ status: 'approved' }));

    await expect(
      updateReceiptStatus('receipt-1', 'admin-1', { status: 'approved' })
    ).rejects.toThrow(ConflictError);
  });

  it('approving a pending receipt issues a voucher worth 5% of the purchase amount', async () => {
    const receipt = makeReceipt({ purchaseAmount: '64.18' });
    Receipt.findByPk.mockResolvedValue(receipt);
    Voucher.create.mockResolvedValue({
      id: 'voucher-1',
      receiptId: receipt.id,
      uploaderId: receipt.uploaderId,
      amount: 3.21,
      expiryDate: new Date('2026-12-01'),
      createdAt: new Date('2026-09-01'),
    });

    const result = await updateReceiptStatus(receipt.id, 'admin-1', { status: 'approved' });

    expect(receipt.status).toBe('approved');
    expect(receipt.approvedBy).toBe('admin-1');
    expect(receipt.save).toHaveBeenCalled();
    expect(Voucher.create).toHaveBeenCalledWith(
      expect.objectContaining({ receiptId: receipt.id, uploaderId: receipt.uploaderId, amount: 3.21 }),
      expect.anything()
    );
    expect(result.voucher).not.toBeNull();
  });

  it('rounds the voucher amount to the nearest cent instead of a long float', () => {
    // 10.005 * 0.05 = 0.50025 — should round to 0.50, not carry the float noise.
    const receipt = makeReceipt({ purchaseAmount: '10.005' });
    Receipt.findByPk.mockResolvedValue(receipt);
    Voucher.create.mockResolvedValue({ id: 'voucher-1' });

    return updateReceiptStatus(receipt.id, 'admin-1', { status: 'approved' }).then(() => {
      const [createArgs] = Voucher.create.mock.calls[0];
      expect(createArgs.amount).toBeCloseTo(0.5, 2);
    });
  });

  it('rejecting a pending receipt records the reason and never creates a voucher', async () => {
    const receipt = makeReceipt();
    Receipt.findByPk.mockResolvedValue(receipt);

    const result = await updateReceiptStatus(receipt.id, 'admin-1', {
      status: 'rejected',
      rejectedReason: 'Blurry photo',
    });

    expect(receipt.status).toBe('rejected');
    expect(receipt.rejectedReason).toBe('Blurry photo');
    expect(Voucher.create).not.toHaveBeenCalled();
    expect(result.voucher).toBeNull();
  });
});
