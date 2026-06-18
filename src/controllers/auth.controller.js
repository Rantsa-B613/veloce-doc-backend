const { z } = require('zod');
const prisma = require('../lib/prisma');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');
const { getUserStats } = require('../services/quota.service');
const { sendWelcomeEmail } = require('../services/email.service');
const { ValidationError, ConflictError } = require('../utils/errors');

const registerSchema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe minimum 8 caractères'),
  nom:      z.string().min(1, 'Nom requis'),
  prenom:   z.string().min(1, 'Prénom requis'),
  tel:      z.string().optional(),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

function buildRefreshExpiry() {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

function formatUser(user, stats) {
  return {
    id:     user.id,
    email:  user.email,
    nom:    user.nom,
    prenom: user.prenom,
    tel:    user.tel,
    plan:   user.plan,
    ...stats,
  };
}

async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('Cet email est déjà utilisé');

    const hashed = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email:    data.email,
        password: hashed,
        nom:      data.nom,
        prenom:   data.prenom,
        tel:      data.tel || null,
      },
    });

    const stats         = await getUserStats(user.id, user.plan, user.trialStart);
    const accessToken   = signAccess({ id: user.id, email: user.email, plan: user.plan });
    const refreshToken  = signRefresh({ id: user.id });

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt: buildRefreshExpiry() },
    });

    res.status(201).json({ accessToken, refreshToken, user: formatUser(user, stats) });

    // Fire & forget — ne bloque pas la réponse
    sendWelcomeEmail({ email: user.email, prenom: user.prenom, password: data.password })
      .catch((err) => console.error('[Email] Échec envoi bienvenue:', err.message));
  } catch (err) {
    if (err.name === 'ZodError') return next(new ValidationError(err.errors[0]?.message));
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Connexion admin — upsert en DB avec plan ENTREPRISE (illimité)
    const isAdminLogin =
      email === process.env.ADMIN_EMAIL &&
      !!process.env.ADMIN_PASSWORD_HASH &&
      await comparePassword(password, process.env.ADMIN_PASSWORD_HASH);

    if (isAdminLogin) {
      const adminUser = await prisma.user.upsert({
        where: { email: process.env.ADMIN_EMAIL },
        update: { plan: 'ENTREPRISE' },
        create: {
          email:    process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD_HASH,
          nom:      'Admin',
          prenom:   'VeloceDoc',
          plan:     'ENTREPRISE',
        },
      });

      const stats        = await getUserStats(adminUser.id, adminUser.plan, adminUser.trialStart);
      const accessToken  = signAccess({ id: adminUser.id, email: adminUser.email, plan: adminUser.plan });
      const refreshToken = signRefresh({ id: adminUser.id });

      await prisma.refreshToken.create({
        data: { userId: adminUser.id, token: refreshToken, expiresAt: buildRefreshExpiry() },
      });

      return res.json({
        accessToken,
        refreshToken,
        user: { ...formatUser(adminUser, stats), isAdmin: true },
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const stats        = await getUserStats(user.id, user.plan, user.trialStart);
    const accessToken  = signAccess({ id: user.id, email: user.email, plan: user.plan });
    const refreshToken = signRefresh({ id: user.id });

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt: buildRefreshExpiry() },
    });

    res.json({ accessToken, refreshToken, user: formatUser(user, stats) });
  } catch (err) {
    if (err.name === 'ZodError') return next(new ValidationError(err.errors[0]?.message));
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken manquant' });

    let payload;
    try {
      payload = verifyRefresh(refreshToken);
    } catch {
      return res.status(401).json({ error: 'Refresh token invalide ou expiré' });
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date())
      return res.status(401).json({ error: 'Refresh token révoqué ou expiré' });

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable' });

    const accessToken = signAccess({ id: user.id, email: user.email, plan: user.plan });
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ message: 'Déconnecté' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const stats   = await getUserStats(user.id, user.plan, user.trialStart);
    const isAdmin = user.email === process.env.ADMIN_EMAIL;
    res.json({ ...formatUser(user, stats), ...(isAdmin && { isAdmin: true }) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, me };
