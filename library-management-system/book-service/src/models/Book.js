const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - isbn
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *           example: The Great Gatsby
 *         author:
 *           type: string
 *           example: F. Scott Fitzgerald
 *         isbn:
 *           type: string
 *           example: "978-0743273565"
 *         genre:
 *           type: string
 *           example: Fiction
 *         publisher:
 *           type: string
 *           example: Scribner
 *         publishedYear:
 *           type: integer
 *           example: 1925
 *         totalCopies:
 *           type: integer
 *           example: 5
 *         availableCopies:
 *           type: integer
 *           example: 3
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const bookSchema = new mongoose.Schema(
  {
    title:          { type: String, required: true, trim: true },
    author:         { type: String, required: true, trim: true },
    isbn:           { type: String, required: true, unique: true, trim: true },
    genre:          { type: String, trim: true, default: 'General' },
    publisher:      { type: String, trim: true },
    publishedYear:  { type: Number },
    totalCopies:    { type: Number, default: 1, min: 1 },
    availableCopies:{ type: Number, default: 1, min: 0 },
    description:    { type: String, trim: true },
  },
  { timestamps: true }
);

// Text index for search
bookSchema.index({ title: 'text', author: 'text', genre: 'text' });

module.exports = mongoose.model('Book', bookSchema);
