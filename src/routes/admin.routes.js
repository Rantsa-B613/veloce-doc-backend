const express   = require('express');
const router    = express.Router();
const adminAuth = require('../middleware/adminAuth');
const ctrl      = require('../controllers/admin.controller');

// Login — public (pas de middleware)
router.post('/login', ctrl.login);

// Toutes les routes suivantes requièrent le token admin
router.use(adminAuth);

// ── Statistiques globales ────────────────────────────────
router.get('/stats', ctrl.getGlobalStats);

// ── Utilisateurs ─────────────────────────────────────────
router.get   ('/users',                   ctrl.getUsers);
router.get   ('/users/:id',               ctrl.getUser);
router.patch ('/users/:id/plan',          ctrl.updateUserPlan);
router.delete('/users/:id',               ctrl.deleteUser);
router.delete('/users/:id/sessions',      ctrl.revokeUserSessions);

// ── Templates ─────────────────────────────────────────────
router.get   ('/templates',               ctrl.getTemplates);
router.delete('/templates/:id',           ctrl.deleteTemplate);

// ── Documents ─────────────────────────────────────────────
router.get   ('/documents',               ctrl.getDocuments);

module.exports = router;
