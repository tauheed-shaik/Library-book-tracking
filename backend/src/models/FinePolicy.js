const mongoose = require('mongoose');

const finePolicySchema = new mongoose.Schema({
  dailyFineAmount: { type: Number, required: true, default: 10 },
  maxDaysForFine: { type: Number, required: true, default: 30 },
  maxFineAmount: { type: Number, required: true, default: 500 },
  issuePeriodDays: { type: Number, required: true, default: 14 },
  renewalLimit: { type: Number, required: true, default: 2 },
  maxBooksPerUser: { type: Number, required: true, default: 5 },
  enabled: { type: Boolean, default: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FinePolicy', finePolicySchema);
