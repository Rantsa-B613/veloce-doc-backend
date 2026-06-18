const { sendWelcomeEmail, sendContactEmail, sendSubscriptionRequest } = require('../services/email.service');

exports.sendWelcome = async (req, res, next) => {
  try {
    const { email, prenom, password } = req.body;

    if (!email || !prenom || !password)
      return res.status(400).json({ error: 'email, prenom et password sont requis' });

    await sendWelcomeEmail({ email, prenom, password });

    res.json({ message: `Email de bienvenue envoyé à ${email}` });
  } catch (err) {
    next(err);
  }
};

exports.sendContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message)
      return res.status(400).json({ error: 'name, email et message sont requis' });

    await sendContactEmail({ name, email, message });

    res.json({ message: 'Message envoyé' });
  } catch (err) {
    next(err);
  }
};

exports.sendSubscriptionRequest = async (req, res, next) => {
  try {
    const { whatsapp, planName } = req.body;

    if (!whatsapp || !planName)
      return res.status(400).json({ error: 'whatsapp et planName sont requis' });

    await sendSubscriptionRequest({ whatsapp, planName });

    res.json({ message: 'Demande envoyée' });
  } catch (err) {
    next(err);
  }
};
