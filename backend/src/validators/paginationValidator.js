const { z } = require('zod');
const { MAX_PAGE_SIZE } = require('../config/constants');

// Both optional and undefaulted here — omitting both is a deliberate,
// valid request meaning "don't paginate" (see utils/pagination.js). Only
// the max is enforced at the validator level, so a client can't ask for an
// unreasonably large page.
const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).optional(),
});

module.exports = { paginationQuerySchema };
