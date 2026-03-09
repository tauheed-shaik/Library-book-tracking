const express = require('express');
const authRoutes = require('./authRoutes');
const bookRoutes = require('./bookRoutes');
const issueRoutes = require('./issueRoutes');
const fineRoutes = require('./fineRoutes');
const reservationRoutes = require('./reservationRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/api/auth', authRoutes);
router.use('/api/books', bookRoutes);
router.use('/api/issues', issueRoutes);
router.use('/api/fines', fineRoutes);
router.use('/api/reservations', reservationRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/user', userRoutes);

module.exports = router;
