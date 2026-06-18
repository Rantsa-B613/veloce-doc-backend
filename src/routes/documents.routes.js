const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/documents.controller');

router.post('/generate', auth, ctrl.generate);

module.exports = router;
