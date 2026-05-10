import jwt from 'jsonwebtoken';

export function optionalVerifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.accessToken;

  if (!token) {
    req.auth = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'access') return res.status(401).json({ message: 'Invalid token type.' });
    req.auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: 'Access token is invalid or expired.' });
  }
}