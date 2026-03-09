const User = require('../models/User');
const Issue = require('../models/Issue');
const Fine = require('../models/Fine');
const Book = require('../models/Book');
const Reservation = require('../models/Reservation');
const FinePolicy = require('../models/FinePolicy');
const AuditLog = require('../models/AuditLog');
const { summarizeBorrowingHistory, generateDemandForecast, analyzeOverdueRisk } = require('../utils/grokAI');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const activeIssues = await Issue.countDocuments({ status: 'issued' });
    const activeReservations = await Reservation.countDocuments({ status: { $in: ['pending', 'approved', 'ready'] } });
    const pendingFines = await Fine.countDocuments({ status: 'pending' });
    const totalFinesAmount = await Fine.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const overdueBooks = await Issue.countDocuments({
      status: 'issued',
      dueDate: { $lt: new Date() }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBooks,
        activeIssues,
        activeReservations,
        pendingFines,
        totalFinesAmount: totalFinesAmount[0]?.total || 0,
        overdueBooks
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFinePolicyConfig = async (req, res) => {
  try {
    const policy = await FinePolicy.findOne();

    res.json({ success: true, policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFinePolicy = async (req, res) => {
  try {
    const { dailyFineAmount, maxDaysForFine, maxFineAmount, issuePeriodDays, renewalLimit, maxBooksPerUser } = req.body;

    let policy = await FinePolicy.findOne();

    if (!policy) {
      policy = new FinePolicy({
        dailyFineAmount,
        maxDaysForFine,
        maxFineAmount,
        issuePeriodDays,
        renewalLimit,
        maxBooksPerUser,
        lastUpdatedBy: req.userId
      });
    } else {
      policy.dailyFineAmount = dailyFineAmount || policy.dailyFineAmount;
      policy.maxDaysForFine = maxDaysForFine || policy.maxDaysForFine;
      policy.maxFineAmount = maxFineAmount || policy.maxFineAmount;
      policy.issuePeriodDays = issuePeriodDays || policy.issuePeriodDays;
      policy.renewalLimit = renewalLimit || policy.renewalLimit;
      policy.maxBooksPerUser = maxBooksPerUser || policy.maxBooksPerUser;
      policy.lastUpdatedBy = req.userId;
    }

    await policy.save();

    res.json({ success: true, message: 'Policy updated successfully', policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserManagement = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;
    if (status) query.membershipStatus = status;

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { membershipStatus: status },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'User status updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSystemAnalytics = async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const recentIssues = await Issue.find({ createdAt: { $gte: startDate } }).countDocuments();
    const recentReturns = await Issue.find({ returnDate: { $gte: startDate } }).countDocuments();
    const recentFines = await Fine.find({ createdAt: { $gte: startDate } }).countDocuments();

    const topBooks = await Issue.aggregate([
      { $group: { _id: '$bookId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } }
    ]);

    const userActivity = await User.aggregate([
      { $group: { _id: '$membershipStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      analytics: {
        recentIssues,
        recentReturns,
        recentFines,
        topBooks,
        userActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .populate('userId', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments();

    res.json({
      success: true,
      logs,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAIDemandForecast = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const book = await Book.findOne({ category: categoryId });
    const categoryBooks = await Book.find({ category: categoryId });
    const avgCheckout = await Issue.countDocuments({ bookId: { $in: categoryBooks.map(b => b._id) } }) / 30;

    const forecast = await generateDemandForecast(
      'books',
      categoryBooks.reduce((sum, b) => sum + b.demand, 0),
      avgCheckout
    );

    res.json({ success: true, forecast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    await User.findByIdAndDelete(userId);
    await Issue.deleteMany({ userId });
    await Fine.deleteMany({ userId });
    await Reservation.deleteMany({ userId });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
