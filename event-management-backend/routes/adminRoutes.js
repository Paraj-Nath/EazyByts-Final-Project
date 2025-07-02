// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Exclude passwords
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

// @desc    Get system analytics (Admin only)
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getSystemAnalytics = async (req, res) => {
  try {
    // Total Users
    const totalUsers = await User.countDocuments();

    // Total Events
    const totalEvents = await Event.countDocuments();

    // Total Bookings (excluding cancelled ones for general count)
    const totalBookings = await Booking.countDocuments({ isCancelled: false });

    // Total Revenue (sum of totalPrice from paid bookings)
    const totalRevenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed', isCancelled: false } }, // Only confirmed and not cancelled
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalPrice' }
        }
      }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalAmount : 0;

    // Most Popular Events (based on number of tickets booked from non-cancelled bookings)
    const popularEvents = await Booking.aggregate([
      {
        $match: {
          isCancelled: false // Only count non-cancelled bookings
        }
      },
      {
        $group: {
          _id: '$event',
          totalTicketsBooked: { $sum: '$numTickets' } // Changed from numberOfTickets to numTickets
        }
      },
      {
        $lookup: { // Join with events collection
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      { $unwind: '$eventDetails' }, // Deconstruct the eventDetails array
      { $sort: { totalTicketsBooked: -1 } },
      { $limit: 5 }, // Top 5 popular events
      {
        $project: { // Shape the output
          _id: '$eventDetails._id',
          title: '$eventDetails.title',
          location: '$eventDetails.location',
          totalTicketsBooked: 1
        }
      }
    ]);

    // Bookings per Event Type (from non-cancelled bookings)
    const bookingsPerEventType = await Booking.aggregate([
      {
        $match: {
          isCancelled: false // Only count non-cancelled bookings
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      { $unwind: '$eventDetails' },
      {
        $group: {
          _id: '$eventDetails.eventType',
          count: { $sum: '$numTickets' } // Changed from 1 to $numTickets to sum tickets per type
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalUsers,
      totalEvents,
      totalBookings,
      totalRevenue,
      popularEvents,
      bookingsPerEventType,
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics.' });
  }
};

router.get('/users', protect, admin, getAllUsers);
router.get('/analytics', protect, admin, getSystemAnalytics);

module.exports = router;