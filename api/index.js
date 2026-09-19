'use strict';

/*
 * Vercel serverless entry. Exports the Express app as a function.
 *
 * Stateless features (Feasibility, Schemes match, Adviser chat, Ledger
 * compute) work even without a database. Only auth, saved ledger reports and
 * newsletters need MONGODB_URI (e.g. MongoDB Atlas) — those return a clean
 * 503 db_unavailable until a database is configured. The embedded MongoDB
 * fallback only runs on a local machine.
 */

const mongoose = require('mongoose');
const { connectDB } = require('../server/db');
const { createApp } = require('../server/app');

let initPromise = null;
let lastDbError = null;

function ensureDb() {
  if (mongoose.connection.readyState === 1) {
    initPromise = null;
    lastDbError = null;
    return Promise.resolve({ already: true });
  }
  if (!initPromise) {
    initPromise = connectDB().catch((err) => {
      initPromise = null;
      const msg = err && err.message;
      if (msg !== lastDbError) {
        lastDbError = msg;
        console.error('[ruralbiz-ai] db unavailable:', msg);
      }
      throw err;
    });
  }
  return initPromise;
}

const app = createApp();

module.exports = async (req, res) => {
  try {
    await ensureDb();
    req.dbReady = true;
  } catch (err) {
    // Ignore — stateless endpoints still run; DB endpoints answer 503.
    req.dbReady = false;
  }
  return app(req, res);
};