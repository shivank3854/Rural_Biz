'use strict';

/*
 * Vercel serverless entry. Exports the Express app as a function.
 * On Vercel you must provide MONGODB_URI (e.g. MongoDB Atlas) —
 * the embedded fallback only runs on a local machine.
 */

const { connectDB } = require('../server/db');
const { createApp } = require('../server/app');

let initPromise = null;

function ensureDb() {
  if (!initPromise) {
    initPromise = connectDB().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

const app = createApp();

module.exports = async (req, res) => {
  try {
    await ensureDb();
  } catch (err) {
    res.status(500).json({
      error: 'database_unavailable',
      message: 'Set the MONGODB_URI environment variable (e.g. MongoDB Atlas) so the app can connect.',
    });
    return;
  }
  return app(req, res);
};