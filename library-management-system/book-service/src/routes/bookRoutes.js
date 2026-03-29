const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/bookController');

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book Management — IT22604958
 */

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     tags: [Books]
 *     summary: Search books by title, author, or genre
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
 *         example: Fitzgerald
 *     responses:
 *       200:
 *         description: List of matching books
 *       400:
 *         description: Missing query parameter
 */
router.get('/search', auth, ctrl.searchBooks);

/**
 * @swagger
 * /api/books:
 *   post:
 *     tags: [Books]
 *     summary: Add a new book to the library
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, author, isbn]
 *             properties:
 *               title:
 *                 type: string
 *                 example: The Great Gatsby
 *               author:
 *                 type: string
 *                 example: F. Scott Fitzgerald
 *               isbn:
 *                 type: string
 *                 example: "978-0743273565"
 *               genre:
 *                 type: string
 *                 example: Fiction
 *               publisher:
 *                 type: string
 *                 example: Scribner
 *               publishedYear:
 *                 type: integer
 *                 example: 1925
 *               totalCopies:
 *                 type: integer
 *                 example: 5
 *               availableCopies:
 *                 type: integer
 *                 example: 5
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book added successfully
 *       400:
 *         description: ISBN already exists
 */
router.post('/', auth, ctrl.createBook);

/**
 * @swagger
 * /api/books:
 *   get:
 *     tags: [Books]
 *     summary: Get all books in the library
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all books
 */
router.get('/', auth, ctrl.getAllBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Get a book by ID
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
 *         description: Book found
 *       404:
 *         description: Book not found
 */
router.get('/:id', auth, ctrl.getBookById);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     tags: [Books]
 *     summary: Update book details
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
 *               title:
 *                 type: string
 *               availableCopies:
 *                 type: integer
 *               genre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book updated
 *       404:
 *         description: Book not found
 */
router.put('/:id', auth, ctrl.updateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     tags: [Books]
 *     summary: Delete a book from the library
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
 *         description: Book deleted
 *       404:
 *         description: Book not found
 */
router.delete('/:id', auth, ctrl.deleteBook);

module.exports = router;
