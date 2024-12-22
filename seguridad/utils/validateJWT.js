const jwt = require('jsonwebtoken');

const validateJWT = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(400).json({ error: 'Authorization header is required' });
  }

  try {
    // Reemplaza 'your-secret-key' con tu clave secreta adecuada
    const decoded = jwt.verify(token.replace('Bearer ', ''), 'your-secret-key');
    req.user = decoded; // Opcional: almacenar datos decodificados en req.user
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired JWT' });
  }
};

module.exports = { validateJWT };

