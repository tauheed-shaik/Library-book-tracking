const express = require('express');
const issueController = require('../controllers/issueController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// User routes
router.post('/issue', authMiddleware, requireRole('user'), issueController.issueBook);
router.post('/return', authMiddleware, issueController.returnBook);
router.post('/renew', authMiddleware, issueController.renewBook);
router.get('/history', authMiddleware, issueController.getUserIssueHistory);

// Staff/Admin routes
router.get('/active', authMiddleware, requireRole('staff', 'admin'), issueController.getActiveIssues);
router.get('/overdue', authMiddleware, requireRole('staff', 'admin'), issueController.getOverdueBooks);
router.post('/staff-issue', authMiddleware, requireRole('staff', 'admin'), issueController.staffIssueBook);

module.exports = router;
