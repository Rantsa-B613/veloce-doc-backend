const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/email.controller');

router.post('/send-welcome',          ctrl.sendWelcome);
router.post('/contact',               ctrl.sendContact);
router.post('/subscription-request',  ctrl.sendSubscriptionRequest);

module.exports = router;
