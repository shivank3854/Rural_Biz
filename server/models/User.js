'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
  phone: { type: String, trim: true, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  meta: {
    age: Number,
    gender: String,
    category: String,
    area: String,
    vendor: String,
    artisan: String,
    bizId: String,
    bizLoc: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);