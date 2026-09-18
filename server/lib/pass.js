'use strict';

const crypto = require('node:crypto');

const KEYLEN = 64;

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEYLEN, (err, dk) => {
      if (err) return reject(err);
      resolve(salt + ':' + dk.toString('hex'));
    });
  });
}

async function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  const derived = await hashPassword(password, salt);
  return derived.split(':')[1] === hash;
}

module.exports = { hashPassword, verifyPassword };