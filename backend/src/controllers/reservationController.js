const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const User = require('../models/User');
const { sendReservationApproved } = require('../utils/mailer');

exports.reserveBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.userId;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const existingReservation = await Reservation.findOne({
      bookId,
      userId,
      status: { $in: ['pending', 'approved', 'ready'] }
    });

    if (existingReservation) {
      return res.status(400).json({ success: false, message: 'Already reserved' });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const reservation = new Reservation({
      userId,
      bookId,
      expiryDate,
      status: 'pending'
    });

    await reservation.save();
    await User.findByIdAndUpdate(userId, { $push: { reservations: reservation._id } });
    await Book.findByIdAndUpdate(bookId, { $inc: { demand: 1 } });

    res.status(201).json({
      success: true,
      message: 'Book reserved successfully',
      reservation: await Reservation.findById(reservation._id).populate('bookId')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.userId })
      .populate('bookId')
      .sort({ reservationDate: -1 });

    res.json({ success: true, reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReservationQueue = async (req, res) => {
  try {
    const { bookId } = req.params;

    const queue = await Reservation.find({ bookId, status: { $in: ['pending', 'approved'] } })
      .populate('userId', 'name email phone')
      .sort({ reservationDate: 1 });

    res.json({ success: true, queue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveReservation = async (req, res) => {
  try {
    const { reservationId } = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { status: 'approved' },
      { new: true }
    ).populate('userId').populate('bookId');

    await sendReservationApproved(
      reservation.userId.email,
      reservation.userId.name,
      reservation.bookId.title
    );

    res.json({ success: true, message: 'Reservation approved', reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markReservationReady = async (req, res) => {
  try {
    const { reservationId } = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { status: 'ready', notified: true },
      { new: true }
    ).populate('bookId').populate('userId');

    res.json({ success: true, message: 'Reservation marked ready', reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const { reservationId, reason } = req.body;

    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { status: 'cancelled', cancelledReason: reason, cancelledBy: req.userId },
      { new: true }
    ).populate('bookId');

    await Book.findByIdAndUpdate(reservation.bookId._id, { $inc: { demand: -1 } });

    res.json({ success: true, message: 'Reservation cancelled', reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;

    const reservations = await Reservation.find(query)
      .populate('userId', 'name email')
      .populate('bookId', 'title author')
      .skip(skip)
      .limit(limit)
      .sort({ reservationDate: -1 });

    const total = await Reservation.countDocuments(query);

    res.json({
      success: true,
      reservations,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
