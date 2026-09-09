const { Op } = require('sequelize');

// Builds an inclusive [dateFrom 00:00:00.000, dateTo 23:59:59.999] range
// condition from optional 'YYYY-MM-DD' strings, for a DATE/TIMESTAMP
// column. Returns null when neither bound is given.
function buildDateRangeWhere(dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return null;
  const range = {};
  if (dateFrom) range[Op.gte] = new Date(`${dateFrom}T00:00:00.000Z`);
  if (dateTo) range[Op.lte] = new Date(`${dateTo}T23:59:59.999Z`);
  return range;
}

module.exports = { buildDateRangeWhere };
