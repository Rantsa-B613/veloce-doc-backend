const express        = require('express');
const cors           = require('cors');
const authRoutes      = require('./routes/auth.routes');
const templatesRoutes = require('./routes/templates.routes');
const documentsRoutes = require('./routes/documents.routes');
const statsRoutes     = require('./routes/stats.routes');
const adminRoutes     = require('./routes/admin.routes');
const emailRoutes     = require('./routes/email.routes');

const app = express();

// ── Middlewares globaux ──────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL        || 'http://localhost:3000',
    process.env.FRONTEND_URL_PUBLIC || 'https://veloce-doc.vercel.app',
    'https://veloce-doc.vercel.app',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/stats',     statsRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/email',     emailRoutes);

// ── Health check ─────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', service: 'VeloceDoc API', ts: new Date().toISOString() })
);

// ── 404 ──────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route introuvable' }));

// ── Error handler global ─────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Erreur serveur interne';

  if (status === 500) console.error('[Error]', err);

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && status === 500 && { stack: err.stack }),
  });
});

module.exports = app;
