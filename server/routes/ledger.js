'use strict';

const express = require('express');
const Ledger = require('../models/Ledger');
const { requireAuth } = require('../middleware/auth');
const { computeLedgerSummary } = require('../lib/data');

const router = express.Router();

function sanitizeRows(rows) {
  if (!Array.isArray(rows)) return null;
  const clean = [];
  for (const r of rows.slice(0, 500)) {
    if (!r || typeof r !== 'object') continue;
    const sales = Math.max(0, Number(r.sales)) || 0;
    const cost = Math.max(0, Number(r.cost)) || 0;
    if (sales === 0 && cost === 0) continue;
    clean.push({
      date: r.date ? new Date(r.date) : new Date(),
      item: String(r.item || 'Entry').slice(0, 80),
      sales, cost,
    });
  }
  return clean;
}

router.get('/report', requireAuth, async (req, res) => {
  const doc = await Ledger.findOne({ user: req.user._id });
  res.json({ rows: (doc && doc.rows) || [] });
});

router.put('/report', requireAuth, async (req, res) => {
  const rows = sanitizeRows(req.body && req.body.rows);
  if (rows === null) return res.status(400).json({ error: 'ledger_rows_invalid' });

  await Ledger.findOneAndUpdate(
    { user: req.user._id },
    { $set: { rows } },
    { upsert: true, new: true }
  );
  res.json({ ok: true, count: rows.length });
});

router.post('/compute', (req, res) => {
  const rows = sanitizeRows(req.body && req.body.rows) || [];
  res.json(computeLedgerSummary(rows));
});

module.exports = router;