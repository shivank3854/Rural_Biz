'use strict';

const express = require('express');
const { BIZ_TYPES } = require('../lib/data');
const { detectIntent, buildAdvisoryReply } = require('../lib/advisory');

const router = express.Router();

function sanitizeMessage(msg) {
  return String(msg || '').trim().slice(0, 500);
}

router.post('/chat', (req, res) => {
  const message = sanitizeMessage(req.body && req.body.message);
  if (!message) return res.status(400).json({ error: 'chat_empty' });

  const c = (req.body && req.body.context) || {};
  const bizId = c.bizId;
  const biz = BIZ_TYPES.find((b) => b.id === bizId);
  const bizName = biz ? (biz[c.lang] || biz.en) : (c.bizName || 'your business');

  const ctx = {
    bizName,
    bizLoc: String(c.bizLoc || '').trim() || 'your area',
    feasScore: Number(c.feasScore) || null,
    schemeName: c.schemeName || null,
    workingCapital: Number(c.workingCapital) || null,
    revenue: Number(c.revenue) || 0,
    cost: Number(c.cost) || 0,
    profit: Number(c.profit) || 0,
    margin: Number(c.margin) || null,
    loanScore: Number(c.loanScore) || null,
    lang: c.lang || 'en',
  };

  const intent = detectIntent(message.toLowerCase());
  const reply = buildAdvisoryReply(intent, ctx);

  res.json({ reply, intent, mode: 'local' });
});

module.exports = router;