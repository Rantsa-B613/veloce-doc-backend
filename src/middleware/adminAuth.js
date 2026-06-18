const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token admin requis' });

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    if (payload.role !== 'admin')
      return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token admin invalide ou expiré' });
  }
};
