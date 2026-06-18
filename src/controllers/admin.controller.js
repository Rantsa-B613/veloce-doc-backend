const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const prisma   = require('../lib/prisma');
const { getUserStats } = require('../services/quota.service');
const { del }  = require('@vercel/blob');

// ── Login admin ─────────────────────────────────────────────────

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      email !== process.env.ADMIN_EMAIL ||
      !(await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH))
    ) {
      return res.status(401).json({ error: 'Identifiants administrateur incorrects' });
    }

    const token = jwt.sign(
      { role: 'admin', email },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: process.env.JWT_ADMIN_EXPIRES || '8h' }
    );

    res.json({ token, expiresIn: process.env.JWT_ADMIN_EXPIRES || '8h' });
  } catch (err) {
    next(err);
  }
};

// ── Utilisateurs ────────────────────────────────────────────────

exports.getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, nom: true, prenom: true,
        tel: true, plan: true, trialStart: true, createdAt: true,
        _count: {
          select: {
            templates: true,
            documents: true,
          },
        },
      },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        templates:     { orderBy: { createdAt: 'desc' } },
        documents:     { orderBy: { createdAt: 'desc' }, take: 50 },
        refreshTokens: { select: { id: true, expiresAt: true, createdAt: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const stats = await getUserStats(user.id, user.plan, user.trialStart);
    const { password: _, ...safeUser } = user;
    res.json({ ...safeUser, stats });
  } catch (err) {
    next(err);
  }
};

exports.updateUserPlan = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const allowed = ['GRATUIT', 'PRO', 'ENTREPRISE'];
    if (!allowed.includes(plan))
      return res.status(400).json({ error: `Plan invalide. Valeurs: ${allowed.join(', ')}` });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { plan },
      select: { id: true, email: true, nom: true, prenom: true, plan: true },
    });
    res.json(user);
  } catch (err) {
    if (err.code === 'P2025')
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where:   { id: req.params.id },
      include: { templates: true },
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    // Supprimer les blobs des templates
    for (const tpl of user.templates) {
      if (tpl.blobUrl) {
        try { await del(tpl.blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN }); } catch { /* blob déjà supprimé */ }
      }
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: `Utilisateur ${user.email} supprimé avec toutes ses données` });
  } catch (err) {
    next(err);
  }
};

// ── Templates (tous utilisateurs) ──────────────────────────────

exports.getTemplates = async (req, res, next) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, nom: true, prenom: true } },
      },
    });
    res.json(templates);
  } catch (err) {
    next(err);
  }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const tpl = await prisma.template.findUnique({ where: { id: req.params.id } });
    if (!tpl) return res.status(404).json({ error: 'Template introuvable' });

    if (tpl.blobUrl) {
      try { await del(tpl.blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN }); } catch { /* blob déjà supprimé */ }
    }

    await prisma.template.delete({ where: { id: req.params.id } });
    res.json({ message: 'Template supprimé' });
  } catch (err) {
    next(err);
  }
};

// ── Documents générés ───────────────────────────────────────────

exports.getDocuments = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    const [total, docs] = await Promise.all([
      prisma.documentGeneration.count(),
      prisma.documentGeneration.findMany({
        skip,
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user:     { select: { id: true, email: true, nom: true, prenom: true } },
          template: { select: { id: true, name: true } },
        },
      }),
    ]);

    res.json({ total, page, limit, pages: Math.ceil(total / limit), docs });
  } catch (err) {
    next(err);
  }
};

// ── Statistiques globales ───────────────────────────────────────

exports.getGlobalStats = async (req, res, next) => {
  try {
    const now        = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers,
      usersByPlan,
      totalTemplates,
      totalDocuments,
      docsThisMonth,
      docsToday,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['plan'], _count: { _all: true } }),
      prisma.template.count(),
      prisma.documentGeneration.count(),
      prisma.documentGeneration.count({ where: { createdAt: { gte: startMonth } } }),
      prisma.documentGeneration.count({ where: { createdAt: { gte: startDay   } } }),
      prisma.user.count({ where: { createdAt: { gte: startMonth } } }),
    ]);

    const planCounts = { GRATUIT: 0, PRO: 0, ENTREPRISE: 0 };
    for (const g of usersByPlan) planCounts[g.plan] = g._count._all;

    res.json({
      users:     { total: totalUsers, byPlan: planCounts, newThisMonth: newUsersThisMonth },
      templates: { total: totalTemplates },
      documents: { total: totalDocuments, thisMonth: docsThisMonth, today: docsToday },
    });
  } catch (err) {
    next(err);
  }
};

// ── Révoquer toutes les sessions d'un utilisateur ───────────────

exports.revokeUserSessions = async (req, res, next) => {
  try {
    const { count } = await prisma.refreshToken.deleteMany({
      where: { userId: req.params.id },
    });
    res.json({ message: `${count} session(s) révoquée(s)` });
  } catch (err) {
    next(err);
  }
};
