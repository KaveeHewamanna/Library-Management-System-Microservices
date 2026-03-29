const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         role:
 *           type: string
 *           enum: [member, admin, librarian]
 *           default: member
 *         phone:
 *           type: string
 *           example: "+94771234567"
 *         address:
 *           type: string
 *           example: "123 Main St, Colombo"
 *         membershipId:
 *           type: string
 *           example: LIB-123456
 *         createdAt:
 *           type: string
 *           format: date-time
 */

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true },
    role:         { type: String, enum: ['member', 'admin', 'librarian'], default: 'member' },
    phone:        { type: String, trim: true },
    address:      { type: String, trim: true },
    membershipId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.membershipId) {
    this.membershipId = 'LIB-' + Date.now().toString().slice(-6);
  }
  next();
});

// Compare plain password with hashed
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
