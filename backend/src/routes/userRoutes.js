const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/notifications', userController.getUserNotifications);
router.post('/notifications/read', userController.markNotificationAsRead);

router.get('/borrowing-history', userController.getBorrowingHistory);
router.get('/borrowing-summary', userController.getAIBorrowingSummary);

router.get('/personalized-insights', userController.getPersonalizedInsights);
router.get('/reading-habits', userController.getReadingHabits);

router.post('/add-notification/:userId', userController.addNotification);

module.exports = router;
