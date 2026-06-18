const { z } = require('zod');
const prisma = require('../lib/prisma');
const { uploadTemplate, deleteBlob } = require('../services/blob.service');
const { checkCanSaveTemplate } = require('../services/quota.service');
const { NotFoundError, ValidationError } = require('../utils/errors');

const saveSchema = z.object({
  name:      z.string().min(1, 'Nom requis').max(100),
  varsCount: z.coerce.number().int().min(0),
});

async function list(req, res, next) {
  try {
    const templates = await prisma.template.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, blobUrl: true,
        varsCount: true, varsConfig: true, createdAt: true,
      },
    });
    res.json(templates);
  } catch (err) {
    next(err);
  }
}

async function save(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Fichier .docx requis' });

    const { name, varsCount } = saveSchema.parse(req.body);

    let varsConfig = {};
    if (req.body.varsConfig) {
      try { varsConfig = JSON.parse(req.body.varsConfig); }
      catch { return res.status(400).json({ error: 'varsConfig JSON invalide' }); }
    }

    await checkCanSaveTemplate(req.user.id, req.user.plan);

    const { url, key } = await uploadTemplate(req.file.buffer, req.file.originalname, req.user.id);

    const template = await prisma.template.create({
      data: {
        userId:     req.user.id,
        name,
        blobUrl:    url,
        blobKey:    key,
        varsConfig,
        varsCount:  Number(varsCount),
      },
    });

    res.status(201).json({
      id:        template.id,
      name:      template.name,
      blobUrl:   template.blobUrl,
      varsCount: template.varsCount,
      varsConfig: template.varsConfig,
      createdAt: template.createdAt,
    });
  } catch (err) {
    if (err.name === 'ZodError') return next(new ValidationError(err.errors[0]?.message));
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const template = await prisma.template.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!template) throw new NotFoundError('Template introuvable');

    const updates = {};
    if (req.body.name)       updates.name       = String(req.body.name).trim();
    if (req.body.varsConfig) {
      try { updates.varsConfig = JSON.parse(req.body.varsConfig); }
      catch { return res.status(400).json({ error: 'varsConfig JSON invalide' }); }
    }

    if (req.file) {
      await deleteBlob(template.blobUrl);
      const { url, key } = await uploadTemplate(req.file.buffer, req.file.originalname, req.user.id);
      updates.blobUrl  = url;
      updates.blobKey  = key;
      if (req.body.varsCount) updates.varsCount = Number(req.body.varsCount);
    }

    const updated = await prisma.template.update({
      where: { id: template.id },
      data:  updates,
    });

    res.json({
      id:        updated.id,
      name:      updated.name,
      blobUrl:   updated.blobUrl,
      varsCount: updated.varsCount,
      varsConfig: updated.varsConfig,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const template = await prisma.template.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!template) throw new NotFoundError('Template introuvable');

    await deleteBlob(template.blobUrl);
    await prisma.template.delete({ where: { id: template.id } });

    res.json({ message: 'Template supprimé' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, save, update, remove };
