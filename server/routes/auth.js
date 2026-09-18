'use strict';

const express = require('express');
const crypto = require('node:crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const { hashPassword, verifyPassword } = require('../lib/pass');
const { requireAuth, hashToken } = require('../middleware/auth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(u) {
  return { name: u.name, email: u.email || undefined, phone: u.phone || undefined, meta: u.meta || {} };
}

async function createSessionFor(user) {
  const token = crypto.randomBytes(24).toString('hex');
  await Session.create({ tokenHash: hashToken(token), user: user._id });
  return token;
}

router.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body || {};

  if (!name || !String(name).trim()) return res.status(400).json({ error: 'auth_name_required' });
  if (!password || String(password).length < 6) return res.status(400).json({ error: 'auth_short_pass' });

  const hasEmail = !!(email && EMAIL_RE.test(String(email)));
  const hasPhone = !!(phone && /^[\d+\-\s]{10,}$/.test(String(phone)));
  if (!hasEmail && !hasPhone) return res.status(400).json({ error: 'auth_invalid_email' });

  const existing = hasEmail && hasPhone
    ? await User.findOne({ $or: [{ email: String(email).toLowerCase() }, { phone: String(phone) }] })
    : await User.findOne(hasEmail ? { email: String(email).toLowerCase() } : { phone: String(phone) });
  if (existing) return res.status(409).json({ error: 'auth_exists' });

  const passwordHash = await hashPassword(String(password));
  const user = await User.create({
    name: String(name).trim(),
    email: hasEmail ? String(email).toLowerCase() : undefined,
    phone: hasPhone ? String(phone) : undefined,
    passwordHash,
  });

  const token = await createSessionFor(user);
  res.status(201).json({ user: publicUser(user), token });
});

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) return res.status(401).json({ error: 'auth_bad_creds' });

  const q = EMAIL_RE.test(String(identifier))
    ? { email: String(identifier).toLowerCase() }
    : { phone: String(identifier) };
  const user = await User.findOne(q);
  if (!user || !(await verifyPassword(String(password), user.passwordHash))) {
    return res.status(401).json({ error: 'auth_bad_creds' });
  }

  const token = await createSessionFor(user);
  res.json({ user: publicUser(user), token });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post('/logout', requireAuth, async (req, res) => {
  await Session.deleteOne({ _id: req.session._id });
  res.json({ ok: true });
});

module.exports = router;