'use strict';

const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const feasRoutes = require('./routes/feasibility');
const chatRoutes = require('./routes/chat');
const ledgerRoutes = require('./routes/ledger');
const miscRoutes = require('./routes/misc');
const dbGuard = require('./middleware/dbGuard');

const DIST = path.join(__dirname, '..', 'client', 'dist');

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/auth', dbGuard, authRoutes);
  app.use('/api', feasRoutes);       // /api/feasibility, /api/schemes/match
  app.use('/api', chatRoutes);       // /api/chat
  app.use('/api/ledger', ledgerRoutes);
  app.use('/api', miscRoutes);       // /api/newsletter, /api/health

  if (fs.existsSync(path.join(DIST, 'index.html'))) {
    app.use(express.static(DIST));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(DIST, 'index.html'));
    });
  } else {
    app.get('/', (req, res) => {
      res.type('text').send(
        '[ruralbiz-ai] Client not built yet.\n' +
        'Run `npm run build`, then restart. Or in development run:\n' +
        '  terminal 1: npm run dev:server\n' +
        '  terminal 2: npm run dev:client  (Vite on http://localhost:5173)\n'
      );
    });
  }

  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'not_found', path: req.originalUrl });
  });

  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const isBadJson = err && err.type === 'entity.parse.failed';
    const status = isBadJson || (err && err.status === 400) ? 400 : ((err && err.status) || 500);
    if (status >= 500) console.error('[ruralbiz-ai] error:', err.message);
    res.status(status).json({ error: isBadJson ? 'bad_json' : ((err && err.code) || 'server_error') });
  });

  return app;
}

module.exports = { createApp, DIST };