const { z } = require('zod');
const { phoneNumberSchema } = require('../utils/phone');

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().toLowerCase().optional(),
  phoneNumber: phoneNumberSchema,
  password: z.string().min(8),
}).refine(data => data.email || data.phoneNumber, {
  message: "Either email or phone number is required"
});

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

module.exports = { registerSchema, loginSchema };