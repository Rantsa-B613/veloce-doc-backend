const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/templates.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const valid =
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.originalname.toLowerCase().endsWith('.docx');
    cb(valid ? null : new Error('Seuls les fichiers .docx sont acceptés'), valid);
  },
});

router.get('/',        auth,                      ctrl.list);
router.post('/',       auth, upload.single('file'), ctrl.save);
router.put('/:id',    auth, upload.single('file'), ctrl.update);
router.delete('/:id', auth,                      ctrl.remove);

module.exports = router;
