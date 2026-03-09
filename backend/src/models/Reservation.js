const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  status: { type: String, enum: ['pending', 'approved', 'ready', 'cancelled'], default: 'pending' },
  reservationDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  priority: { type: Number, default: 0 },
  notified: { type: Boolean, default: false },
  cancelledBy: { type: String },
  cancelledReason: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
