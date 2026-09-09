const { DEFAULT_PAGE_SIZE } = require('../config/constants');

// Pagination is opt-in per request: omitting both `page` and `limit`
// entirely means "return everything", which a few call sites genuinely
// need (the admin dashboard's summary counts, the nav pending-count badge,
// the review queue) — they'd otherwise only see whatever fit on page one.
// Passing either one turns pagination on and fills in the default for
// whichever of the two wasn't given.
function resolvePagination({ page, limit } = {}) {
  if (page === undefined && limit === undefined) return null;
  return { page: page ?? 1, limit: limit ?? DEFAULT_PAGE_SIZE };
}

function buildPaginationMeta(pageInfo, total) {
  if (!pageInfo) return null;
  return {
    page: pageInfo.page,
    limit: pageInfo.limit,
    total,
    totalPages: Math.ceil(total / pageInfo.limit),
  };
}

module.exports = { resolvePagination, buildPaginationMeta };
