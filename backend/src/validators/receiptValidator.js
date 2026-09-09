const { z } = require('zod');
const { paginationQuerySchema } = require('./paginationValidator');

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

const dateOnly = (label) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be in YYYY-MM-DD format`)
    .optional();

// GET /receipts and GET /admin/receipts — shared shape: optional pagination
// (see paginationQuerySchema) plus an optional status filter, free-text
// search, and a purchaseDate range. What `search` actually matches against
// differs per endpoint — order ID only for a user's own receipts, order ID
// or uploader name for admin — since only admin's query joins the uploader.
const receiptListQuerySchema = paginationQuerySchema
  .extend({
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    search: z.string().trim().min(1).optional(),
    dateFrom: dateOnly('dateFrom'),
    dateTo: dateOnly('dateTo'),
  })
  .refine((data) => !data.dateFrom || !data.dateTo || data.dateFrom <= data.dateTo, {
    message: 'dateFrom must be on or before dateTo',
    path: ['dateTo'],
  });

module.exports = { createReceiptSchema, updateReceiptStatusSchema, receiptListQuerySchema };