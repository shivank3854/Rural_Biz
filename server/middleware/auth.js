'use strict';

const crypto = require('node:crypto');
const Session = require('../models/Session');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'auth_required' });

  const session = await Session.findOne({ tokenHash: hashToken(token) }).populate('user');
  if (!session || !session.user) return res.status(401).json({ error: 'auth_required' });

  req.user = session.user;
  req.session = session;
  next();
}

module.exports = { requireAuth, hashToken };