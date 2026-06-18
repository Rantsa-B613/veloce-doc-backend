const { sendWelcomeEmail } = require('../services/email.service');

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
