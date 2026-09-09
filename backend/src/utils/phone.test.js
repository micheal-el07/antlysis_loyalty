const { normalizePhoneNumber } = require('./phone');

describe('normalizePhoneNumber', () => {
  it('normalizes a local Malaysian number (leading 0) to E.164', () => {
    expect(normalizePhoneNumber('01154547878')).toBe('+601154547878');
  });

  // This is the exact bug that motivated normalizing phone numbers at all:
  // the same real number, typed with a bare country code instead of the
  // local trunk "0", was previously accepted as a *different* number and
  // let someone register the same account twice.
  it('normalizes the same number written with a bare country code (no +) to the same E.164 value', () => {
    expect(normalizePhoneNumber('601154547878')).toBe(normalizePhoneNumber('01154547878'));
  });

  it('accepts a number already in E.164 form unchanged', () => {
    expect(normalizePhoneNumber('+601154547878')).toBe('+601154547878');
  });

  it('normalizes formatting punctuation (dashes/spaces)', () => {
    expect(normalizePhoneNumber('011-2345 6789')).toBe('+601123456789');
  });

  it('returns null for unparseable input instead of throwing', () => {
    expect(normalizePhoneNumber('garbage123')).toBeNull();
  });
});
