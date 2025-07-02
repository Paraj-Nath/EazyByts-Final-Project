// backend/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Event = require('../models/Event');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get comments for a specific event
// @route   GET /api/comments/:eventId
// @access  Public
const getCommentsByEvent = async (req, res) => {
  try {
    const comments = await Comment.find({ event: req.params.eventId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error fetching comments.' });
  }
};

// @desc    Add a comment to an event
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
  const { eventId, text, rating } = req.body;
  const userId = req.user._id;

  if (!eventId || !text) {
    return res.status(400).json({ message: 'Please provide event ID and comment text.' });
  }

  const eventExists = await Event.findById(eventId);
  if (!eventExists) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  try {
    const comment = new Comment({
      event: eventId,
      user: userId,
      text,
      rating: rating || null,
    });

    const createdComment = await comment.save();
    await createdComment.populate('user', 'name');

    const io = req.app.get('io');
    io.to(`event-${eventId}`).emit('newComment', createdComment);

    res.status(201).json({
      message: 'Comment added successfully!',
      comment: createdComment,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error adding comment.' });
  }
};

// @desc    Delete a comment (only by owner or admin)
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment.' });
    }

    await Comment.deleteOne({ _id: req.params.id });
    res.json({ message: 'Comment removed successfully.' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error deleting comment.' });
  }
};


router.route('/')
  .post(protect, addComment);

router.route('/:eventId')
  .get(getCommentsByEvent);

router.route('/:id')
  .delete(protect, deleteComment);

module.exports = router;