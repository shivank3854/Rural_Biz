'use strict';

/*
 * Returns 503 with a clean JSON body when the host has no working database.
 * Stateless endpoints (feasibility, schemes, chat, ledger/compute) do NOT
 * use this guard — they run fine without MongoDB.
 */
module.exports = function dbGuard(req, res, next) {
  if (req.dbReady === false) {
    return res.status(503).json({
      error: 'db_unavailable',
      message: 'Database not configured on the host. Set MONGODB_URI (e.g. MongoDB Atlas) on Vercel so auth, saved reports and newsletters work. The other features still run.',
    });
  }
  next();
};