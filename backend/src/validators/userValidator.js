const { z } = require('zod');
const { phoneNumberSchema } = require('../utils/phone');

const updateProfileSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().toLowerCase().nullable().optional(),
    phoneNumber: phoneNumberSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update.',
  });

module.exports = { updateProfileSchema };
