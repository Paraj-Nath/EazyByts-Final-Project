// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { eventId, numTickets } = req.body; // Changed to numTickets
  const userId = req.user._id;

  if (!eventId || !numTickets || numTickets <= 0) { // Changed to numTickets
    return res.status(400).json({ message: 'Please provide event ID and valid number of tickets.' });
  }

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (event.availableTickets < numTickets) { // Changed to numTickets
      return res.status(400).json({ message: 'Not enough tickets available for this event.' });
    }

    const totalPrice = event.price * numTickets; // Changed to numTickets

    const booking = new Booking({
      user: userId,
      event: eventId,
      numTickets, // Changed to numTickets
      totalPrice,
      status: 'pending', // Use 'status' field from your schema
    });

    event.availableTickets -= numTickets; // Changed to numTickets
    await event.save();

    const createdBooking = await booking.save();

    const io = req.app.get('io');
    if (io) { // Check if io is defined to prevent errors if not configured
      io.to(`event-${eventId}`).emit('eventTicketsUpdated', {
        eventId: event._id,
        availableTickets: event.availableTickets
      });
    }


    res.status(201).json({
      message: 'Booking created successfully. Pending payment.',
      booking: createdBooking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error during booking creation.' });
  }
};

// @desc    Get all bookings for the logged-in user
// @route   GET /api/bookings/mybookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    // Populate event details, and ensure only non-cancelled bookings are primarily shown
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date time location imageUrl')
      .sort({ createdAt: -1 }); // Sort by creation date descending
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Server error fetching user bookings.' });
  }
};

// @desc    Get a single booking by ID (for a user)
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event', 'title date time location imageUrl');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking.' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching single booking:', error);
    res.status(500).json({ message: 'Server error fetching booking.' });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Ensure only the owner or an admin can cancel the booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking.' });
    }

    if (booking.isCancelled) { // Check the new isCancelled field
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    // Mark the booking as cancelled
    booking.isCancelled = true; // Set the new boolean flag
    booking.status = 'cancelled'; // Update the enum status to 'cancelled'
    // You might also update razorpayPaymentId/razorpayOrderId here if a refund is initiated.
    // booking.paymentStatus = 'refunded'; // If your enum includes 'refunded'

    const event = await Event.findById(booking.event);
    if (event) {
      // Increase available tickets for the event
      event.availableTickets += booking.numTickets; // Changed to numTickets
      await event.save();
    }

    const updatedBooking = await booking.save();

    const io = req.app.get('io');
    if (io && event) { // Check if io is defined and event exists
      io.to(`event-${event._id}`).emit('eventTicketsUpdated', {
        eventId: event._id,
        availableTickets: event.availableTickets
      });
    }


    res.json({ message: 'Booking cancelled successfully.', booking: updatedBooking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error cancelling booking.' });
  }
};


router.post('/', protect, createBooking);
router.get('/mybookings', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking); // Route for cancellation

module.exports = router;