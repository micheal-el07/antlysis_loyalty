const { registerSchema, loginSchema } = require('./authValidator');

describe('registerSchema', () => {
  // The exact bug that motivated lowercasing emails: "email@test.com" and
  // "Email@Test.com" were being treated as two different accounts.
  it('lowercases the email', () => {
    const result = registerSchema.safeParse({
      name: 'Jane Doe',
      email: 'Jane.Doe@Example.COM',
      password: 'password123',
    });
    expect(result.success).toBe(true);
    expect(result.data.email).toBe('jane.doe@example.com');
  });

  it('normalizes a local-format phone number to E.164', () => {
    const result = registerSchema.safeParse({
      name: 'Jane Doe',
      phoneNumber: '01154547878',
      password: 'password123',
    });
    expect(result.success).toBe(true);
    expect(result.data.phoneNumber).toBe('+601154547878');
  });

  it('rejects a phone number that cannot be parsed', () => {
    const result = registerSchema.safeParse({
      name: 'Jane Doe',
      phoneNumber: 'not-a-number',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('requires either an email or a phone number', () => {
    const result = registerSchema.safeParse({ name: 'Jane Doe', password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('rejects a password under 8 characters', () => {
    const result = registerSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts an identifier and password', () => {
    expect(loginSchema.safeParse({ identifier: 'jane@example.com', password: 'x' }).success).toBe(true);
  });

  it('rejects an empty identifier', () => {
    expect(loginSchema.safeParse({ identifier: '', password: 'x' }).success).toBe(false);
  });
});
