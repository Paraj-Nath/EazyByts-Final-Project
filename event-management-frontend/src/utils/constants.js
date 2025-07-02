// src/utils/constants.js
// Set your backend API base URL here.
// Use localhost for development, your deployed URL for production.
export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Razorpay Key ID (for frontend integration)
// You might want to get this from your backend during payment initiation for better security.
// For demonstration, it's here, but production apps should handle this carefully.
export const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID;

// Socket.IO Server URL
export const SOCKET_IO_SERVER_URL = process.env.REACT_APP_SOCKET_IO_URL || 'http://localhost:5000';

