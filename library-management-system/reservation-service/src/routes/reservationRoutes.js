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
 *     summary: Create a new book reservation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, bookId]
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109ca"
 *               bookId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109cb"
 *               notes:
 *                 type: string
 *                 example: "Please hold at front desk"
 *     responses:
 *       201:
 *         description: Reservation created — expires in 7 days
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
 *     summary: Update reservation status or notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, expired]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reservation updated
 *       404:
 *         description: Not found
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
