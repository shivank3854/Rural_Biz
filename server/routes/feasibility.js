'use strict';

const express = require('express');
const { computeFeasibility, matchSchemes } = require('../lib/data');

const router = express.Router();

router.post('/feasibility', (req, res) => {
  const { bizId, location, capital } = req.body || {};
  const result = computeFeasibility(bizId, location, capital);
  const matched = matchSchemes({
    age: 30, gender: 'Male', category: 'General', stage: 'New / not started', area: 'Rural',
    amount: result.workingCapital || 10000,
    vendor: result.biz.vendor ? 'Yes' : 'No',
    artisan: result.biz.artisan ? 'Yes' : 'No',
  });
  res.json({ ...result, matchedSchemes: matched.slice(0, 3) });
});

router.post('/schemes/match', (req, res) => {
  const profile = req.body || {};
  const matched = matchSchemes({
    age: Number(profile.age) || 30,
    gender: profile.gender || 'Male',
    category: profile.category || 'General',
    stage: profile.stage || 'New / not started',
    area: profile.area || 'Rural',
    amount: Number(profile.amount) || 10000,
    vendor: profile.vendor || 'No',
    artisan: profile.artisan || 'No',
  });
  res.json({ matches: matched });
});

module.exports = router;