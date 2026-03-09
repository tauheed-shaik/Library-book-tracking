const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, enum: ['overdue', 'damage', 'loss'], default: 'overdue' },
  daysOverdue: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'paid', 'waived'], default: 'pending' },
  paidDate: { type: Date },
  paymentMethod: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Fine', fineSchema);
