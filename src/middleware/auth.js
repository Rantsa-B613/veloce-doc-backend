const { verifyAccess } = require('../utils/jwt');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token manquant' });

  const token = header.slice(7);
  try {
    req.user = verifyAccess(token);
    // req.user = { id, email, plan, iat, exp }
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};
