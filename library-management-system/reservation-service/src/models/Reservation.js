const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *           description: MongoDB ObjectId of the user
 *           example: "60d0fe4f5311236168a109ca"
 *         bookId:
 *           type: string
 *           description: MongoDB ObjectId of the book (for book reservations)
 *           example: "60d0fe4f5311236168a109cb"
 *         reservationType:
 *           type: string
 *           enum: [book, meetingRoom]
 *           description: Type of reservation
 *           default: book
 *         reservationTime:
 *           type: string
 *           format: date-time
 *           description: Time when member needs to come (for meeting room reservations)
 *         numberOfMembers:
 *           type: integer
 *           description: Number of members attending (for meeting room reservations)
 *         memberNames:
 *           type: array
 *           items:
 *             type: string
 *           description: Names of all attending members
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
    bookId:          { type: String },
    reservationType: { 
      type: String, 
      enum: ['book', 'meetingRoom'], 
      default: 'book' 
    },
    reservationTime: { type: Date },
    numberOfMembers: { type: Number },
    memberNames:     { type: [String], default: [] },
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
