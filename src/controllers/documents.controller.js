const { z } = require('zod');
const prisma = require('../lib/prisma');
const { checkCanGenerate, checkIsLimitedScan, getUserStats } = require('../services/quota.service');
const { ValidationError } = require('../utils/errors');

const generateSchema = z.object({
  templateId: z.string().uuid().nullable().optional(),
  varsCount:  z.coerce.number().int().min(0),
  fileName:   z.string().optional(),
});

async function generate(req, res, next) {
  try {
    const { templateId, varsCount, fileName } = generateSchema.parse(req.body);

    await checkCanGenerate(req.user.id, req.user.plan);

    const isLimited = await checkIsLimitedScan(req.user.id, req.user.plan);

    await prisma.documentGeneration.create({
      data: {
        userId:     req.user.id,
        templateId: templateId || null,
        varsCount:  Number(varsCount),
        isLimited,
        fileName:   fileName || null,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return next(new Error('Utilisateur introuvable'));
    const stats = await getUserStats(req.user.id, req.user.plan, user.trialStart);

    res.status(201).json({
      isLimited,
      stats: {
        docsUsedToday: stats.docsUsedToday,
        docsUsedMonth: stats.docsUsedMonth,
        aiScansUsed:   stats.aiScansUsed,
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') return next(new ValidationError(err.errors[0]?.message));
    next(err);
  }
}

module.exports = { generate };
