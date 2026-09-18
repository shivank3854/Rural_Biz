'use strict';

const express = require('express');
const Subscriber = require('../models/Subscriber');
const asyncH = require('../lib/asyncH');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/newsletter', asyncH(async (req, res) => {
  const email = String((req.body && req.body.email) || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'newsletter_bad_email' });

  const existing = await Subscriber.findOne({ email });
  if (existing) return res.json({ ok: true, existed: true });

  await Subscriber.create({ email });
  res.json({ ok: true, existed: false });
}));

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'ruralbiz-ai',
    stack: 'mern',
    chatEngine: 'local',
    time: new Date().toISOString(),
  });
});

module.exports = router;