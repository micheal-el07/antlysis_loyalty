const { z } = require('zod');

// multipart/form-data fields all arrive in req.body as strings — coerce
// purchaseAmount rather than z.number(), which would reject "64.18".
const createReceiptSchema = z.object({
  orderId: z.string().min(1),
  purchaseDate: z.string().datetime(),
  purchaseAmount: z.coerce.number().nonnegative(),
});

// admin-only, PATCH /receipts/:id
const updateReceiptStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectedReason: z.string().optional(),
}).refine(data => data.status !== 'rejected' || !!data.rejectedReason, {
  message: "rejectedReason is required when rejecting a receipt"
});

module.exports = { createReceiptSchema, updateReceiptStatusSchema };