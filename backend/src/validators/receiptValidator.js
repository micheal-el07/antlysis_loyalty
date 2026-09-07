const createReceiptSchema = z.object({
  orderId: z.string().min(1),
  purchaseDate: z.string().datetime(),
  purchaseAmount: z.number().nonnegative(),
});

// admin-only, PATCH /receipts/:id
const updateReceiptStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectedReason: z.string().optional(),
}).refine(data => data.status !== 'rejected' || !!data.rejectedReason, {
  message: "rejectedReason is required when rejecting a receipt"
});