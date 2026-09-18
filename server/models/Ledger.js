'use strict';

const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  rows: [{
    date: { type: Date },
    item: { type: String, trim: true, maxlength: 80 },
    sales: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Ledger', ledgerSchema);