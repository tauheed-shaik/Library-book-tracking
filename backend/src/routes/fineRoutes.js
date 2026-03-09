const express = require('express');
const fineController = require('../controllers/fineController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// User routes
router.get('/', authMiddleware, fineController.getFines);
router.get('/user-total', authMiddleware, fineController.getUserTotalFines);
router.get('/policy', authMiddleware, fineController.getFinePolicyDetails);
router.post('/pay', authMiddleware, fineController.payFine);
router.get('/:fineId/explanation', authMiddleware, fineController.getFineExplanation);

// Staff/Admin routes
router.get('/all', authMiddleware, requireRole('staff', 'admin'), fineController.getAllFines);
router.post('/waive', authMiddleware, requireRole('staff', 'admin'), fineController.waiveFine);

module.exports = router;
