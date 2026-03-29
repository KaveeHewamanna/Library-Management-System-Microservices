const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/borrowController');

/**
 * @swagger
 * tags:
 *   name: Borrows
 *   description: Borrow & Fine Management — IT22258694
 */

/**
 * @swagger
 * /api/borrows/fines:
 *   get:
 *     tags: [Borrows]
 *     summary: Get all borrow records with outstanding fines
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of fines with total outstanding amount
 */
router.get('/fines', auth, ctrl.getAllFines);

/**
 * @swagger
 * /api/borrows/fines/{id}/pay:
 *   post:
 *     tags: [Borrows]
 *     summary: Mark a fine as paid
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Borrow record ID
 *     responses:
 *       200:
 *         description: Fine paid successfully
 *       400:
 *         description: No fine or already paid
 *       404:
 *         description: Borrow record not found
 */
router.post('/fines/:id/pay', auth, ctrl.payFine);

/**
 * @swagger
 * /api/borrows:
 *   post:
 *     tags: [Borrows]
 *     summary: Issue a book to a user (create borrow record)
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
 *     responses:
 *       201:
 *         description: Book issued — due in 14 days
 *       400:
 *         description: Active borrow already exists
 */
router.post('/', auth, ctrl.issueBorrow);

/**
 * @swagger
 * /api/borrows:
 *   get:
 *     tags: [Borrows]
 *     summary: Get all borrow records
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all borrow records
 */
router.get('/', auth, ctrl.getAllBorrows);

/**
 * @swagger
 * /api/borrows/{id}:
 *   get:
 *     tags: [Borrows]
 *     summary: Get a borrow record by ID
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
 *         description: Borrow record found
 *       404:
 *         description: Not found
 */
router.get('/:id', auth, ctrl.getBorrowById);

/**
 * @swagger
 * /api/borrows/{id}/return:
 *   put:
 *     tags: [Borrows]
 *     summary: Return a borrowed book — auto-calculates overdue fine
 *     description: |
 *       Returns the book and calculates a fine if overdue.
 *       Fine rate: **$0.50 per day** overdue.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Borrow record ID
 *     responses:
 *       200:
 *         description: Book returned — fine details included in response
 *       400:
 *         description: Book already returned
 *       404:
 *         description: Borrow record not found
 */
router.put('/:id/return', auth, ctrl.returnBook);

module.exports = router;
