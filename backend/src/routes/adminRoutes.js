const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware, requireRole('admin', 'staff'));

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/fine-policy', adminController.getFinePolicyConfig);
router.put('/fine-policy', adminController.updateFinePolicy);

router.get('/users', adminController.getUserManagement);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

router.get('/analytics', adminController.getSystemAnalytics);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/demand-forecast/:categoryId', adminController.getAIDemandForecast);

module.exports = router;
