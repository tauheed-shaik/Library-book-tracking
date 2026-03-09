const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    console.log(`[Auth] Checking roles ${roles} for userRole: ${req.userRole}`);
    if (!roles.includes(req.userRole)) {
      console.log(`[Auth] Access denied for role: ${req.userRole}`);
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};

const adminAuth = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Admin auth error' });
  }
};

module.exports = { authMiddleware, requireRole, adminAuth };
