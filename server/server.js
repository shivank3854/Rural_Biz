'use strict';

const { connectDB, stopDB } = require('./db');
const { createApp } = require('./app');

const PORT = Number(process.env.PORT) || 4000;

async function main() {
  let dbInfo;
  try {
    dbInfo = await connectDB();
  } catch (err) {
    console.error('[ruralbiz-ai] MongoDB connection failed:', err.message);
    console.error('[ruralbiz-ai] Set MONGODB_URI to reach your own MongoDB, or let the embedded MongoDB start locally.');
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log('');
    console.log('  🌾  RuralBiz AI  (MERN stack)');
    console.log('  ────────────────────────────────────────────────');
    console.log(`  MongoDB     : ${dbInfo.embedded ? 'embedded (memory)' : dbInfo.uri}`);
    console.log(`  Advisory    : local engine (no external AI API required)`);
    console.log(`  API         : http://localhost:${PORT}/api/health`);
    console.log(`  Landing     : http://localhost:${PORT}/`);
    console.log(`  App         : http://localhost:${PORT}/#/app`);
    console.log('  ────────────────────────────────────────────────');
    console.log('  Press Ctrl+C to stop.');
    console.log('');
  });

  const shutdown = async () => {
    server.close(async () => {
      await stopDB();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();