const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  password: z.string().min(8),
}).refine(data => data.email || data.phoneNumber, {
  message: "Either email or phone number is required"
});

const loginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});