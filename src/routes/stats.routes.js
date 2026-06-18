const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const prisma  = require('../lib/prisma');
const { getUserStats } = require('../services/quota.service');

router.get('/', auth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const stats = await getUserStats(user.id, user.plan, user.trialStart);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
