require('dotenv').config();
const app = require('./app');

// Export pour Vercel serverless
module.exports = app;

// Démarrage local uniquement (node src/server.js ou nodemon)
if (require.main === module) {
  const prisma = require('./lib/prisma');
  const PORT = process.env.PORT || 4000;

  prisma.$connect()
    .then(() => {
      console.log('[DB] Connecté à Neon PostgreSQL');
      app.listen(PORT, () => {
        console.log(`[API] VeloceDoc backend démarré sur http://localhost:${PORT}`);
        console.log(`[ENV] NODE_ENV = ${process.env.NODE_ENV}`);
      });
    })
    .catch((err) => {
      console.error('[Fatal]', err);
      process.exit(1);
    });
}
