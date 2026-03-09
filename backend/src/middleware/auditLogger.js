const AuditLog = require('../models/AuditLog');

const auditLogger = async (req, res, next) => {
  res.on('finish', async () => {
    try {
      if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        await AuditLog.create({
          action: `${req.method} ${req.path}`,
          userId: req.userId,
          requestBody: req.body,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          statusCode: res.statusCode
        });
      }
    } catch (error) {
      console.log('Audit log error:', error);
    }
  });
  next();
};

module.exports = { auditLogger };
