require('dotenv').config();
const app = require('./app');
const prisma = require('./lib/prisma');

const PORT = process.env.PORT || 4000;

async function main() {
  await prisma.$connect();
  console.log('[DB] Connecté à Neon PostgreSQL');

  app.listen(PORT, () => {
    console.log(`[API] VeloceDoc backend démarré sur http://localhost:${PORT}`);
    console.log(`[ENV] NODE_ENV = ${process.env.NODE_ENV}`);
  });
}

main().catch((err) => {
  console.error('[Fatal]', err);
  process.exit(1);
});
