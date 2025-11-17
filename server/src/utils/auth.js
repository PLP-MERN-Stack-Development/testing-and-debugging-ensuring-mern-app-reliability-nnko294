const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'testsecret';

function generateToken(user) {
  const payload = { id: user._id };
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

function verifyTokenMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = { id: decoded.id };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { generateToken, verifyTokenMiddleware };

