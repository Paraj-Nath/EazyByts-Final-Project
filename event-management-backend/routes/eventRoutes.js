// backend/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Your Multer-S3 middleware
const Event = require('../models/Event'); // Your Event model
const User = require('../models/User'); // Needed for recommendations

// Import the S3 image deletion utility
const { deleteS3ImageByUrl } = require('../utils/s3ImageDelete'); // ADDED

// @desc    Get all events with advanced search and filtering
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const { keyword, location, eventType, startDate, endDate, minPrice, maxPrice } = req.query;
  const query = {};

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
    ];
  }
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }
  if (eventType) {
    query.eventType = eventType;
  }
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) {
      query.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      query.price.$lte = parseFloat(maxPrice);
    }
  }

  const events = await Event.find(query).sort({ date: 1 });
  res.json(events);
});

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (event) {
    res.json(event);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, time, location, price, availableTickets, eventType } = req.body;

  if (!title || !description || !date || !location || price === undefined || !availableTickets) {
    res.status(400);
    throw new Error('Please fill all required fields: title, description, date, location, price, availableTickets.');
  }

  let imageUrl = '';
  if (req.file && req.file.location) {
    imageUrl = req.file.location;
  }

  const event = new Event({
    title,
    description,
    date,
    time: time || 'N/A',
    location,
    price,
    availableTickets,
    capacity: availableTickets,
    eventType: eventType || 'General',
    imageUrl,
    organizer: req.user._id,
  });

  const createdEvent = await event.save();
  res.status(201).json(createdEvent);
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
  const { title, description, date, time, location, price, availableTickets, eventType, _id, __v, ...otherBodyFields } = req.body;

  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Authorization check (assuming admin middleware handles general access)
  // If also checking organizer:
  // if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  //   res.status(401);
  //   throw new Error('Not authorized to update this event');
  // }

  let newImageUrl = event.imageUrl; // Default to current image URL

  if (req.file && req.file.location) { // A new file was uploaded
    // Delete old image from S3 using the new utility function
    if (event.imageUrl) {
      await deleteS3ImageByUrl(event.imageUrl); // MODIFIED: Call utility function
    }
    newImageUrl = req.file.location; // Set new image URL
  } else if (req.body.eventImage === '') { // Frontend explicitly sent an empty string to clear the image
    // Delete old image from S3 using the new utility function
    if (event.imageUrl) {
      await deleteS3ImageByUrl(event.imageUrl); // MODIFIED: Call utility function
    }
    newImageUrl = ''; // Clear image URL
  }

  // Update event fields dynamically
  event.title = title !== undefined ? title : event.title;
  event.description = description !== undefined ? description : event.description;
  event.date = date !== undefined ? date : event.date;
  event.time = time !== undefined ? time : event.time;
  event.location = location !== undefined ? location : event.location;
  event.price = price !== undefined ? price : event.price;
  event.availableTickets = availableTickets !== undefined ? availableTickets : event.availableTickets;
  event.capacity = availableTickets !== undefined ? availableTickets : event.capacity;
  event.eventType = eventType !== undefined ? eventType : event.eventType;
  event.imageUrl = newImageUrl;

  const updatedEvent = await event.save();
  res.json(updatedEvent);
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Authorization check (assuming admin middleware handles general access)
  // If also checking organizer:
  // if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  //   res.status(401);
  //   throw new Error('Not authorized to delete this event');
  // }

  // Delete associated image from S3 using the new utility function
  if (event.imageUrl) {
    await deleteS3ImageByUrl(event.imageUrl); // MODIFIED: Call utility function
  }

  await event.deleteOne();

  res.json({ message: 'Event removed' });
});

// @desc    Get personalized event recommendations
// @route   GET /api/events/recommendations
// @access  Private
const getEventRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.interests || user.interests.length === 0) {
    const generalRecommendations = await Event.find({}).sort({ createdAt: -1 }).limit(10);
    return res.json({ message: 'No specific interests defined, showing general recommendations.', events: generalRecommendations });
  }

  const recommendedEvents = await Event.find({
    eventType: { $in: user.interests }
  }).sort({ date: 1 }).limit(20);

  if (recommendedEvents.length === 0) {
    const fallbackRecommendations = await Event.find({}).sort({ createdAt: -1 }).limit(10);
    return res.json({ message: 'No specific recommendations found, showing general recommendations.', events: fallbackRecommendations });
  }

  res.json({ message: 'Personalized recommendations fetched successfully.', events: recommendedEvents });
});


// Route Definitions
router.get('/recommendations', protect, getEventRecommendations);

router.route('/')
  .get(getEvents)
  .post(protect, admin, upload.single('eventImage'), createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, admin, upload.single('eventImage'), updateEvent)
  .delete(protect, admin, deleteEvent);


module.exports = router;