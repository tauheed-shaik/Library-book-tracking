const Fine = require('../models/Fine');
const User = require('../models/User');
const Issue = require('../models/Issue');
const { explainFines } = require('../utils/grokAI');

exports.getFines = async (req, res) => {
  try {
    const fines = await Fine.find({ userId: req.userId })
      .populate('issueId')
      .sort({ createdAt: -1 });

    res.json({ success: true, fines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFinePolicyDetails = async (req, res) => {
  try {
    const FinePolicy = require('../models/FinePolicy');
    const policy = await FinePolicy.findOne();

    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    res.json({ success: true, policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.payFine = async (req, res) => {
  try {
    const { fineId, paymentMethod = 'credit_card' } = req.body;

    const fine = await Fine.findById(fineId).populate('issueId');
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found' });
    }

    if (fine.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Fine already paid or waived' });
    }

    fine.status = 'paid';
    fine.paidDate = Date.now();
    fine.paymentMethod = paymentMethod;
    await fine.save();

    const user = await User.findById(fine.userId);
    user.totalFines = Math.max(0, user.totalFines - fine.amount);
    await user.save();

    await Issue.findByIdAndUpdate(fine.issueId._id, { finePaid: true });

    res.json({ success: true, message: 'Fine paid successfully', fine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFineExplanation = async (req, res) => {
  try {
    const { fineId } = req.params;

    const fine = await Fine.findById(fineId).populate({
      path: 'issueId',
      populate: { path: 'bookId' }
    });

    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found' });
    }

    const explanation = await explainFines(
      fine.amount,
      fine.daysOverdue,
      fine.issueId.bookId.title
    );

    res.json({ success: true, explanation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserTotalFines = async (req, res) => {
  try {
    const unpaidFines = await Fine.find({ userId: req.userId, status: 'pending' });
    const totalFines = unpaidFines.reduce((sum, fine) => sum + fine.amount, 0);

    res.json({ success: true, totalFines, count: unpaidFines.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllFines = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;

    const fines = await Fine.find(query)
      .populate('userId', 'name email')
      .populate('issueId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Fine.countDocuments(query);

    res.json({
      success: true,
      fines,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.waiveFine = async (req, res) => {
  try {
    const { fineId, reason } = req.body;

    const fine = await Fine.findByIdAndUpdate(
      fineId,
      { status: 'waived', notes: reason },
      { new: true }
    );

    const user = await User.findById(fine.userId);
    user.totalFines = Math.max(0, user.totalFines - fine.amount);
    await user.save();

    res.json({ success: true, message: 'Fine waived successfully', fine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
