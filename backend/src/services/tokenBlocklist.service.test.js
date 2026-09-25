jest.mock('../config/redis', () => ({ set: jest.fn(), exists: jest.fn() }));

const redis = require('../config/redis');
const { blockToken, isBlocked } = require('./tokenBlocklist.service');

beforeEach(() => jest.clearAllMocks());

describe('blockToken', () => {
  it('stores the jti with a TTL equal to the remaining lifetime', async () => {
    const exp = Math.floor(Date.now() / 1000) + 600;
    await blockToken('abc', exp);
    expect(redis.set).toHaveBeenCalledWith('jwt:blocklist:abc', '1', { EX: expect.any(Number) });
    const { EX } = redis.set.mock.calls[0][2];
    expect(EX).toBeGreaterThan(595);
    expect(EX).toBeLessThanOrEqual(600);
  });

  it('skips tokens that have already expired', async () => {
    await blockToken('abc', Math.floor(Date.now() / 1000) - 10);
    expect(redis.set).not.toHaveBeenCalled();
  });
});

describe('isBlocked', () => {
  it('reflects whether the key exists', async () => {
    redis.exists.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    expect(await isBlocked('abc')).toBe(true);
    expect(await isBlocked('abc')).toBe(false);
  });
});
