// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto'); // Node's built-in crypto module

const { protect } = require('../middleware/authMiddleware');
const Event = require('../models/Event'); // Assuming Event.js
const Booking = require('../models/Booking'); // Assuming Booking.js
const User = require('../models/User'); // Assuming User.js

// Initialize Razorpay instance
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private (User)
router.post('/create-order', protect, asyncHandler(async (req, res) => {
  const { amount, currency, eventId, bookingDetails } = req.body; // amount is in paisa from frontend
  const user = req.user; // From protect middleware

  if (!amount || !currency || !eventId || !bookingDetails) {
    res.status(400);
    throw new Error('Please provide amount, currency, eventId, and booking details');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // --- Crucial: Server-side validation of amount ---
  const calculatedAmount = event.ticketPrice * bookingDetails.numTickets * 100; // Convert to paisa
  if (calculatedAmount !== amount) {
    res.status(400);
    throw new Error('Amount mismatch: Potential fraud attempt detected.');
  }

  if (event.availableTickets < bookingDetails.numTickets) {
    res.status(400);
    throw new Error('Not enough tickets available.');
  }

  const options = {
    amount: calculatedAmount, // amount in the smallest currency unit (paisa)
    currency: currency, // e.g., "INR"
    receipt: `receipt_order_${Date.now()}_${user._id}`, // Unique ID for your order
    notes: { // These notes will be returned in the order details after payment
      userId: user._id.toString(),
      eventId: event._id.toString(),
      numTickets: bookingDetails.numTickets,
    },
  };

  try {
    const order = await instance.orders.create(options);
    res.status(201).json({
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID // Send Key ID to frontend for Checkout modal
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Razorpay Order creation failed: ${error.message}`);
  }
}));

// @desc    Verify Razorpay Payment and fulfill booking
// @route   POST /api/payments/verify-payment
// @access  Private (User)
router.post('/verify-payment', protect, asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const user = req.user;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Missing payment verification details.');
  }

  // Generate expected signature using the secret key
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  // Compare generated signature with the signature received from Razorpay
  if (generatedSignature === razorpay_signature) {
    // Signature is valid, payment is successful
    // Now, fetch order details to fulfill the booking securely (to prevent tampering)
    try {
      const orderDetails = await instance.orders.fetch(razorpay_order_id);
      const { notes, amount, currency } = orderDetails;

      // Basic security check: ensure the order belongs to the current user
      if (!notes || notes.userId !== user._id.toString()) {
        res.status(400);
        throw new Error('Order details mismatch or unauthorized user.');
      }

      // Fulfill the booking using the details from the order
      await fulfillBooking({
        userId: notes.userId,
        eventId: notes.eventId,
        numTickets: parseInt(notes.numTickets),
        totalPrice: amount / 100, // Convert paisa back to currency unit
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: 'confirmed'
      });

      res.status(200).json({ success: true, message: 'Payment verified and booking confirmed.' });

    } catch (error) {
      console.error('Error fetching Razorpay order or fulfilling booking:', error);
      res.status(500);
      throw new Error(`Payment verification failed: ${error.message}`);
    }

  } else {
    // Signature mismatch, payment is fraudulent or tampered
    res.status(400);
    throw new Error('Payment verification failed: Invalid signature.');
  }
}));


// Helper function to fulfill the booking (extracted for reusability)
const fulfillBooking = async (bookingData) => {
  const { userId, eventId, numTickets, totalPrice, razorpayOrderId, razorpayPaymentId, status } = bookingData;

  try {
    const booking = await Booking.create({
      user: userId,
      event: eventId,
      numTickets: numTickets,
      totalPrice: totalPrice,
      razorpayOrderId: razorpayOrderId, // Store Razorpay Order ID
      razorpayPaymentId: razorpayPaymentId, // Store Razorpay Payment ID
      status: status,
    });
    console.log(`Booking created for user ${userId}, event ${eventId}`);

    const event = await Event.findById(eventId);
    if (event) {
      event.availableTickets -= numTickets;
      await event.save();
      console.log(`Event tickets updated for ${eventId}`);
    }

    const user = await User.findById(userId);
    if (user) {
      console.log(`Sending confirmation email to ${user.email} for booking ${booking._id}`);
      // Implement email sending logic here
    }

  } catch (error) {
    console.error(`Error fulfilling booking for Razorpay Order ${razorpayOrderId}:`, error);
    // In a real app, you'd log this, potentially alert an admin, and handle retries
  }
};

module.exports = router;