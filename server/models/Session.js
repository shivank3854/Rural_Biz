'use strict';

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now, expires: '30d' },
});

module.exports = mongoose.model('Session', sessionSchema);