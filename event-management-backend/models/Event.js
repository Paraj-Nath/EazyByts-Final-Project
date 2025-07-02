const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String, // e.g., "10:00 AM" or "14:30"
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  availableTickets: {
    type: Number,
    required: true,
    min: 0,
  },
  eventType: {
    type: String,
    enum: ['concert', 'workshop', 'conference', 'festival', 'sport', 'other'],
    default: 'other',
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x200?text=Event+Image', // Placeholder image
  },
  organizer: { // Reference to the user who created the event (an admin)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Event', EventSchema);