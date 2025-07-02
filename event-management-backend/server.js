// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv').config();
const colors = require('colors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const cors = require('cors');

// Route imports
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const commentRoutes = require('./routes/commentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes'); // Assuming userRoutes exists

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server instance for Express and Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Allow requests from your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"] // Consider adding PUT/DELETE if your Socket.IO events might reflect such operations
  }
});

// Make `io` accessible globally via `req.app.get('io')` in your routes/controllers
app.set('io', io); // <--- ADD THIS LINE HERE!

// Socket.IO connection logic (example for comments)
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_event', (eventId) => {
    socket.join(eventId);
    console.log(`User ${socket.id} joined event room: ${eventId}`);
  });

  socket.on('new_comment', (commentData) => {
    // You might also need to ensure 'commentData.eventId' is actually the room name
    io.to(commentData.eventId).emit('receive_comment', commentData);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors()); // Ensure this is configured correctly for your frontend (e.g., origin)

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(errorHandler);

// Ensure your Express app listens on the 'server' instance, not 'app' directly
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT} with Socket.IO`.yellow.bold)
);