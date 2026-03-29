const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       required:
 *         - userId
 *         - bookId
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *           description: MongoDB ObjectId of the user
 *           example: "60d0fe4f5311236168a109ca"
 *         bookId:
 *           type: string
 *           description: MongoDB ObjectId of the book
 *           example: "60d0fe4f5311236168a109cb"
 *         reservationDate:
 *           type: string
 *           format: date-time
 *         expiryDate:
 *           type: string
 *           format: date-time
 *           description: Auto-set to reservationDate + 7 days
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, expired]
 *           default: pending
 *         notes:
 *           type: string
 *           example: "Please hold at front desk"
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const reservationSchema = new mongoose.Schema(
  {
    userId:          { type: String, required: true },
    bookId:          { type: String, required: true },
    reservationDate: { type: Date, default: Date.now },
    expiryDate:      { type: Date },
    status:          {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'expired'],
      default: 'pending',
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Auto set expiry to 7 days from reservation
reservationSchema.pre('save', function (next) {
  if (!this.expiryDate) {
    const expiry = new Date(this.reservationDate);
    expiry.setDate(expiry.getDate() + 7);
    this.expiryDate = expiry;
  }
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
