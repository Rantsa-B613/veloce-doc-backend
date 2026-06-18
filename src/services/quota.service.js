const prisma = require('../lib/prisma');
const { QuotaError } = require('../utils/errors');

const PLAN_LIMITS = {
  GRATUIT:    { docsPerMonth: 15,   docsPerDay: 3,    templates: 1,    aiScans: 10   },
  PRO:        { docsPerMonth: 100,  docsPerDay: null, templates: 10,   aiScans: null },
  ENTREPRISE: { docsPerMonth: null, docsPerDay: null, templates: null, aiScans: null },
};

function startOfDay() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

async function getUserStats(userId, plan, trialStart) {
  const limits = PLAN_LIMITS[plan];

  const [docsToday, docsMonth, aiScansTotal, templatesCount] = await Promise.all([
    prisma.documentGeneration.count({ where: { userId, createdAt: { gte: startOfDay() } } }),
    prisma.documentGeneration.count({ where: { userId, createdAt: { gte: startOfMonth() } } }),
    prisma.documentGeneration.count({ where: { userId } }),
    prisma.template.count({ where: { userId } }),
  ]);

  const daysLeft =
    plan === 'GRATUIT' && trialStart
      ? Math.max(0, 30 - Math.floor((Date.now() - new Date(trialStart).getTime()) / 86400000))
      : null;

  return {
    docsUsedToday:  docsToday,
    docsUsedMonth:  docsMonth,
    aiScansUsed:    aiScansTotal,
    templatesCount,
    daysLeft,
    limits,
  };
}

async function checkCanGenerate(userId, plan) {
  const limits = PLAN_LIMITS[plan];

  const [docsToday, docsMonth] = await Promise.all([
    prisma.documentGeneration.count({ where: { userId, createdAt: { gte: startOfDay() } } }),
    prisma.documentGeneration.count({ where: { userId, createdAt: { gte: startOfMonth() } } }),
  ]);

  if (limits.docsPerDay !== null && docsToday >= limits.docsPerDay)
    throw new QuotaError(`Limite journalière atteinte (${limits.docsPerDay} docs/jour)`);

  if (limits.docsPerMonth !== null && docsMonth >= limits.docsPerMonth)
    throw new QuotaError(`Limite mensuelle atteinte (${limits.docsPerMonth} docs/mois)`);
}

async function checkIsLimitedScan(userId, plan) {
  const limit = PLAN_LIMITS[plan].aiScans;
  if (limit === null) return false;
  const total = await prisma.documentGeneration.count({ where: { userId } });
  return total >= limit;
}

async function checkCanSaveTemplate(userId, plan) {
  const limit = PLAN_LIMITS[plan].templates;
  if (limit === null) return;
  const count = await prisma.template.count({ where: { userId } });
  if (count >= limit)
    throw new QuotaError(`Limite de templates atteinte (${limit} max pour ce plan)`);
}

module.exports = { getUserStats, checkCanGenerate, checkIsLimitedScan, checkCanSaveTemplate, PLAN_LIMITS };
