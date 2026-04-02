const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/reservationController');

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Reservation Management — IT22584090
 */

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Create a new book or meeting room reservation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109ca"
 *               reservationType:
 *                 type: string
 *                 enum: [book, meetingRoom]
 *                 default: book
 *               bookId:
 *                 type: string
 *                 description: Required for book reservations
 *                 example: "60d0fe4f5311236168a109cb"
 *               reservationTime:
 *                 type: string
 *                 format: date-time
 *                 description: Required for meeting room reservations
 *               numberOfMembers:
 *                 type: integer
 *                 description: Required for meeting room reservations
 *                 example: 5
 *               memberNames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Required for meeting room reservations
 *                 example: ["John Doe", "Jane Smith", "Bob Johnson"]
 *               notes:
 *                 type: string
 *                 example: "Please hold at front desk"
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Missing required fields for reservation type
 *       500:
 *         description: Server error
 */
router.post('/', auth, ctrl.createReservation);

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Get all reservations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reservations
 */
router.get('/', auth, ctrl.getAllReservations);

/**
 * @swagger
 * /api/reservations/user/{userId}:
 *   get:
 *     tags: [Reservations]
 *     summary: Get all reservations for a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's MongoDB ObjectId
 *     responses:
 *       200:
 *         description: User's reservations
 */
router.get('/user/:userId', auth, ctrl.getReservationsByUser);

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     tags: [Reservations]
 *     summary: Get a reservation by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation details
 *       404:
 *         description: Not found
 */
router.get('/:id', auth, ctrl.getReservationById);

/**
 * @swagger
 * /api/reservations/{id}:
 *   put:
 *     tags: [Reservations]
 *     summary: Update reservation details (status, notes, or meeting room details)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The reservation's MongoDB ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, expired]
 *                 example: "confirmed"
 *                 description: Update reservation status
 *               notes:
 *                 type: string
 *                 example: "Room prepared with projector"
 *                 description: Update notes/special requirements
 *               reservationTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-05T10:00:00.000Z"
 *                 description: Update meeting time (for meeting room reservations)
 *               numberOfMembers:
 *                 type: integer
 *                 example: 5
 *                 description: Update number of members (for meeting room reservations)
 *               memberNames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Kaveesha Hewamanna", "Yasitha Bhanuka", "Himashi Eranga", "Dinethma", "Rumesh"]
 *                 description: Update list of member names (for meeting room reservations)
 *     responses:
 *       200:
 *         description: Reservation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, ctrl.updateReservation);

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     tags: [Reservations]
 *     summary: Cancel a reservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation cancelled
 *       404:
 *         description: Not found
 */
router.delete('/:id', auth, ctrl.cancelReservation);

module.exports = router;
