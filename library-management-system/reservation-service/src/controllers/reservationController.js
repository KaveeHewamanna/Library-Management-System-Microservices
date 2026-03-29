const Reservation = require('../models/Reservation');

// ─── POST /api/reservations ───────────────────────────────────────────────────
exports.createReservation = async (req, res) => {
  try {
    const { userId, bookId, notes } = req.body;
    const reservation = new Reservation({ userId, bookId, notes });
    await reservation.save();
    res.status(201).json({
      success: true,
      message: 'Reservation created successfully.',
      data: reservation,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/reservations ────────────────────────────────────────────────────
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/reservations/:id ────────────────────────────────────────────────
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });
    res.json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/reservations/user/:userId ───────────────────────────────────────
exports.getReservationsByUser = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/reservations/:id ────────────────────────────────────────────────
exports.updateReservation = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true }
    );
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });
    res.json({ success: true, message: 'Reservation updated.', data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/reservations/:id ─────────────────────────────────────────────
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });
    res.json({ success: true, message: 'Reservation cancelled.', data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
