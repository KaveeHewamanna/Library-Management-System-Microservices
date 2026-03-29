const Book = require('../models/Book');

// ─── POST /api/books ──────────────────────────────────────────────────────────
exports.createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json({ success: true, message: 'Book added successfully.', data: book });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'ISBN already exists.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/books ───────────────────────────────────────────────────────────
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json({ success: true, count: books.length, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/books/search?q= ────────────────────────────────────────────────
exports.searchBooks = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ success: false, message: 'Query parameter "q" is required.' });

    const books = await Book.find({
      $or: [
        { title:  { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { genre:  { $regex: q, $options: 'i' } },
        { isbn:   { $regex: q, $options: 'i' } },
      ],
    });
    res.json({ success: true, count: books.length, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/books/:id ───────────────────────────────────────────────────────
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/books/:id ───────────────────────────────────────────────────────
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.json({ success: true, message: 'Book updated successfully.', data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/books/:id ────────────────────────────────────────────────────
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    res.json({ success: true, message: 'Book deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
