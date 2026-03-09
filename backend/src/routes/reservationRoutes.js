const express = require('express');
const reservationController = require('../controllers/reservationController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// User routes
router.post('/', authMiddleware, requireRole('user'), reservationController.reserveBook);
router.get('/', authMiddleware, reservationController.getUserReservations);
router.post('/cancel', authMiddleware, reservationController.cancelReservation);

// Staff/Admin routes
router.get('/all', authMiddleware, requireRole('staff', 'admin'), reservationController.getAllReservations);
router.get('/queue/:bookId', authMiddleware, requireRole('staff', 'admin'), reservationController.getReservationQueue);
router.post('/approve', authMiddleware, requireRole('staff', 'admin'), reservationController.approveReservation);
router.post('/mark-ready', authMiddleware, requireRole('staff', 'admin'), reservationController.markReservationReady);

module.exports = router;
