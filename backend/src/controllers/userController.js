const User = require('../models/User');
const Issue = require('../models/Issue');
const Fine = require('../models/Fine');
const { summarizeBorrowingHistory, analyzeOverdueRisk } = require('../utils/grokAI');

exports.getUserNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const user = await User.findById(req.userId);

    const notification = user.notifications.id(notificationId);
    if (notification) {
      notification.read = true;
      await user.save();
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBorrowingHistory = async (req, res) => {
  try {
    const issues = await Issue.find({ userId: req.userId })
      .populate('bookId')
      .sort({ createdAt: -1 });

    const bookTitles = issues.map(i => i.bookId.title);
    const issueCounts = issues.length;

    res.json({ success: true, issues, bookTitles, issueCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAIBorrowingSummary = async (req, res) => {
  try {
    const issues = await Issue.find({ userId: req.userId })
      .populate('bookId')
      .sort({ createdAt: -1 })
      .limit(10);

    const bookTitles = issues.map(i => i.bookId.title);
    const totalBooks = await Issue.countDocuments({ userId: req.userId, status: 'returned' });

    const summary = await summarizeBorrowingHistory(bookTitles, issues.length, totalBooks);

    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPersonalizedInsights = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const issues = await Issue.find({ userId: req.userId });
    const overdueIssues = await Issue.countDocuments({ userId: req.userId, status: 'overdue' });

    const insights = await analyzeOverdueRisk(
      user.name,
      overdueIssues,
      await Issue.countDocuments({ userId: req.userId, status: 'issued' }),
      30
    );

    res.json({ success: true, insights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addNotification = async (req, res) => {
  try {
    const { userId, message, type = 'info' } = req.body;

    const user = await User.findById(userId);
    user.notifications.push({ message, type });
    await user.save();

    res.json({ success: true, message: 'Notification added' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReadingHabits = async (req, res) => {
  try {
    const issues = await Issue.find({ userId: req.userId })
      .populate('bookId', 'category title')
      .sort({ createdAt: -1 });

    const categoryCount = {};
    issues.forEach(issue => {
      const cat = issue.bookId.category;
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const mostReadCategory = Object.keys(categoryCount).reduce((a, b) =>
      categoryCount[a] > categoryCount[b] ? a : b
    );

    res.json({
      success: true,
      totalBooksRead: issues.filter(i => i.status === 'returned').length,
      activeIssues: issues.filter(i => i.status === 'issued').length,
      categoryPreferences: categoryCount,
      mostReadCategory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
