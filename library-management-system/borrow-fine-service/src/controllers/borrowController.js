const Borrow = require('../models/Borrow');

const FINE_RATE = parseFloat(process.env.FINE_RATE_PER_DAY) || 0.50; // $0.50/day

// ─── POST /api/borrows ────────────────────────────────────────────────────────
exports.issueBorrow = async (req, res) => {
  try {
    const { userId, bookId } = req.body;

    // Check if active borrow already exists
    const existing = await Borrow.findOne({ userId, bookId, status: 'borrowed' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already has an active borrow for this book.' });
    }

    const borrow = new Borrow({ userId, bookId });
    await borrow.save();
    res.status(201).json({
      success: true,
      message: 'Book issued successfully.',
      data: borrow,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/borrows ─────────────────────────────────────────────────────────
exports.getAllBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find().sort({ createdAt: -1 });
    res.json({ success: true, count: borrows.length, data: borrows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/borrows/fines ───────────────────────────────────────────────────
exports.getAllFines = async (req, res) => {
  try {
    const fines = await Borrow.find({ fineAmount: { $gt: 0 } }).sort({ fineAmount: -1 });
    const totalOutstanding = fines
      .filter((f) => !f.finePaid)
      .reduce((sum, f) => sum + f.fineAmount, 0);

    res.json({
      success: true,
      count: fines.length,
      totalOutstanding: `$${totalOutstanding.toFixed(2)}`,
      data: fines,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/borrows/:id ─────────────────────────────────────────────────────
exports.getBorrowById = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) return res.status(404).json({ success: false, message: 'Borrow record not found.' });
    res.json({ success: true, data: borrow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/borrows/:id/return ──────────────────────────────────────────────
exports.returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) return res.status(404).json({ success: false, message: 'Borrow record not found.' });
    if (borrow.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Book already returned.' });
    }

    const returnDate = new Date();
    borrow.returnDate = returnDate;
    borrow.status = 'returned';

    // Calculate fine if overdue
    if (returnDate > borrow.dueDate) {
      const daysOverdue = Math.ceil((returnDate - borrow.dueDate) / (1000 * 60 * 60 * 24));
      borrow.fineAmount = parseFloat((daysOverdue * FINE_RATE).toFixed(2));
    }

    await borrow.save();
    res.json({
      success: true,
      message: borrow.fineAmount > 0
        ? `Book returned. Fine incurred: $${borrow.fineAmount} (${Math.ceil((returnDate - borrow.dueDate) / (1000 * 60 * 60 * 24))} days overdue @ $${FINE_RATE}/day)`
        : 'Book returned on time. No fine.',
      data: borrow,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/borrows/fines/:id/pay ─────────────────────────────────────────
exports.payFine = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) return res.status(404).json({ success: false, message: 'Borrow record not found.' });
    if (borrow.fineAmount === 0) {
      return res.status(400).json({ success: false, message: 'No fine associated with this borrow.' });
    }
    if (borrow.finePaid) {
      return res.status(400).json({ success: false, message: 'Fine already paid.' });
    }

    borrow.finePaid = true;
    await borrow.save();

    res.json({
      success: true,
      message: `Fine of $${borrow.fineAmount} paid successfully.`,
      data: borrow,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/borrows/:id/delete ──────────────────────────────────────────
exports.deleteBorrow = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found.'
      });
    }

    // Optional: Prevent deletion of active borrows with unpaid fines
    if (borrow.status === 'borrowed' && borrow.fineAmount > 0 && !borrow.finePaid) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete active borrow with unpaid fine. Please pay the fine or return the book first.'
      });
    }

    await Borrow.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Borrow record deleted successfully.',
      deletedRecord: borrow
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
