const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String },
  publishedYear: { type: Number },
  publisher: { type: String },
  language: { type: String, default: 'English' },
  totalCopies: { type: Number, required: true, default: 1 },
  availableCopies: { type: Number, required: true },
  coverImage: { type: String },
  tags: [String],
  status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
  isBookOfMonth: { type: Boolean, default: false },
  demand: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
