'use strict';

const mongoose = require('mongoose');

let memServer = null;

/*
 * Connect to MongoDB.
 * 1. If MONGODB_URI is set, use it (local mongod or MongoDB Atlas). Fail fast if unreachable.
 * 2. Otherwise spin up an embedded in-memory MongoDB (mongodb-memory-server) so the
 *    whole MERN app runs with zero external setup.
 */
async function connectDB() {
  const explicitUri = process.env.MONGODB_URI;

  if (explicitUri) {
    await mongoose.connect(explicitUri, {
      serverSelectionTimeoutMS: 4000,
    });
    return { mode: 'mongodb', uri: explicitUri, embedded: false };
  }

  if (process.env.VERCEL) {
    throw new Error('MONGODB_URI must be set on Vercel (embedded MongoDB is not available on serverless).');
  }

  const { MongoMemoryServer } = require('mongodb-memory-server');
  memServer = await MongoMemoryServer.create();
  const uri = memServer.getUri();
  await mongoose.connect(uri);
  return { mode: 'mongodb', uri, embedded: true };
}

async function stopDB() {
  await mongoose.disconnect();
  if (memServer) await memServer.stop();
}

module.exports = { connectDB, stopDB };