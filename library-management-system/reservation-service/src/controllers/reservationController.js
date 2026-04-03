const Reservation = require('../models/Reservation');

// ─── POST /api/reservations ───────────────────────────────────────────────────
exports.createReservation = async (req, res) => {
  try {
    const { userId, bookId, reservationType, reservationTime, numberOfMembers, memberNames, notes } = req.body;
    
    // For meeting room reservations, ensure required fields are provided
    if (reservationType === 'meetingRoom') {
      if (!reservationTime || !numberOfMembers || !memberNames || memberNames.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'For meeting room reservations, reservationTime, numberOfMembers, and memberNames are required.'
        });
      }
    }

    const reservation = new Reservation({
      userId,
      bookId: reservationType === 'book' ? bookId : undefined,
      reservationType: reservationType || 'book',
      reservationTime,
      numberOfMembers,
      memberNames,
      notes
    });

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
    const { status, notes, reservationTime, numberOfMembers, memberNames } = req.body;
    
    // Get existing reservation first
    const existingReservation = await Reservation.findById(req.params.id);
    if (!existingReservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (existingReservation.reservationType === 'meetingRoom') {
      if (reservationTime !== undefined) updateData.reservationTime = reservationTime;
      if (numberOfMembers !== undefined) updateData.numberOfMembers = numberOfMembers;
      if (memberNames !== undefined) updateData.memberNames = memberNames;
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

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
