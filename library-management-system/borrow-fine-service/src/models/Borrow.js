const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Borrow:
 *       type: object
 *       required:
 *         - userId
 *         - bookId
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *           example: "60d0fe4f5311236168a109ca"
 *         bookId:
 *           type: string
 *           example: "60d0fe4f5311236168a109cb"
 *         borrowDate:
 *           type: string
 *           format: date-time
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Auto-set to borrowDate + 14 days
 *         returnDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [borrowed, returned, overdue]
 *           default: borrowed
 *         fineAmount:
 *           type: number
 *           format: float
 *           description: Fine amount in USD (calculated at return)
 *           example: 2.50
 *         finePaid:
 *           type: boolean
 *           default: false
 */

const borrowSchema = new mongoose.Schema(
  {
    userId:     { type: String, required: true },
    bookId:     { type: String, required: true },
    borrowDate: { type: Date,   default: Date.now },
    dueDate:    { type: Date },
    returnDate: { type: Date,   default: null },
    status:     { type: String, enum: ['borrowed', 'returned', 'overdue'], default: 'borrowed' },
    fineAmount: { type: Number, default: 0 },
    finePaid:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-set due date to 14 days from borrow date
borrowSchema.pre('save', function (next) {
  if (!this.dueDate) {
    const due = new Date(this.borrowDate);
    due.setDate(due.getDate() + 14);
    this.dueDate = due;
  }
  next();
});

module.exports = mongoose.model('Borrow', borrowSchema);
