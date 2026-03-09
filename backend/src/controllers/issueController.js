const Issue = require('../models/Issue');
const Fine = require('../models/Fine');
const Book = require('../models/Book');
const User = require('../models/User');
const FinePolicy = require('../models/FinePolicy');
const { sendOverdueReminder, sendFineNotification } = require('../utils/mailer');

exports.issueBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    const book = await Book.findById(bookId);

    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: 'Book not available' });
    }

    const policy = await FinePolicy.findOne();
    if (user.booksIssued.length >= (policy?.maxBooksPerUser || 5)) {
      return res.status(400).json({ success: false, message: 'Max books limit reached' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (policy?.issuePeriodDays || 14));

    const issue = new Issue({
      userId,
      bookId,
      dueDate,
      status: 'issued'
    });

    await issue.save();
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });
    await User.findByIdAndUpdate(userId, { $push: { booksIssued: issue._id } });

    res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      issue: await Issue.findById(issue._id).populate('bookId')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.staffIssueBook = async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    const user = await User.findById(userId);
    let book = await Book.findById(bookId).catch(() => null);

    if (!book) {
      book = await Book.findOne({ isbn: bookId });
    }

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: 'Book not available or not found' });
    }

    const policy = await FinePolicy.findOne();
    if (user.booksIssued.length >= (policy?.maxBooksPerUser || 5)) {
      return res.status(400).json({ success: false, message: 'User max books limit reached' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (policy?.issuePeriodDays || 14));

    const issue = new Issue({
      userId,
      bookId,
      dueDate,
      status: 'issued'
    });

    await issue.save();
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });
    await User.findByIdAndUpdate(userId, { $push: { booksIssued: issue._id } });

    res.status(201).json({
      success: true,
      message: 'Book issued to user successfully',
      issue: await Issue.findById(issue._id).populate('bookId').populate('userId')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { issueId } = req.body;

    const issue = await Issue.findById(issueId).populate('bookId').populate('userId');
    if (!issue || issue.status !== 'issued') {
      return res.status(400).json({ success: false, message: 'Invalid issue' });
    }

    issue.returnDate = Date.now();
    issue.status = 'returned';

    const daysOverdue = Math.max(0, Math.floor((new Date() - issue.dueDate) / (1000 * 60 * 60 * 24)));

    if (daysOverdue > 0) {
      const policy = await FinePolicy.findOne();
      const fineAmount = Math.min(
        daysOverdue * policy.dailyFineAmount,
        policy.maxFineAmount
      );

      const fine = new Fine({
        userId: issue.userId._id,
        issueId: issue._id,
        amount: fineAmount,
        daysOverdue,
        reason: 'overdue'
      });

      await fine.save();
      await User.findByIdAndUpdate(issue.userId._id, { $inc: { totalFines: fineAmount } });
      await sendFineNotification(issue.userId.email, issue.userId.name, fineAmount);

      issue.fine = fineAmount;
    }

    await issue.save();
    await Book.findByIdAndUpdate(issue.bookId._id, { $inc: { availableCopies: 1 } });

    res.json({ success: true, message: 'Book returned successfully', issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.renewBook = async (req, res) => {
  try {
    const { issueId } = req.body;

    const issue = await Issue.findById(issueId);
    const policy = await FinePolicy.findOne();

    if (!issue || issue.status !== 'issued') {
      return res.status(400).json({ success: false, message: 'Invalid issue' });
    }

    if (issue.renewCount >= policy.renewalLimit) {
      return res.status(400).json({ success: false, message: 'Renewal limit exceeded' });
    }

    const newDueDate = new Date(issue.dueDate);
    newDueDate.setDate(newDueDate.getDate() + policy.issuePeriodDays);

    issue.dueDate = newDueDate;
    issue.renewCount += 1;
    await issue.save();

    res.json({ success: true, message: 'Book renewed successfully', issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ status: 'issued' })
      .populate('userId', 'name email phone')
      .populate('bookId', 'title author')
      .sort({ dueDate: 1 });

    res.json({ success: true, issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserIssueHistory = async (req, res) => {
  try {
    const history = await Issue.find({ userId: req.userId })
      .populate('bookId')
      .sort({ createdAt: -1 });

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOverdueBooks = async (req, res) => {
  try {
    const now = new Date();
    const overdueBooks = await Issue.find({ status: 'issued', dueDate: { $lt: now } })
      .populate('userId', 'name email phone')
      .populate('bookId', 'title author')
      .sort({ dueDate: 1 });

    res.json({ success: true, overdueBooks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
