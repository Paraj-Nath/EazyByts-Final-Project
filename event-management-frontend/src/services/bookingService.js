// src/services/bookingService.js
import axios from 'axios';
import { BASE_URL } from '../utils/constants'; // Assuming you have a constants file

const API_URL = `${BASE_URL}/api/bookings`; // Your bookings API endpoint

// Get user's bookings
const getUserBookings = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Create a new booking
const createBooking = async (bookingData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  const response = await axios.post(API_URL, bookingData, config);
  return response.data;
};

// Cancel a booking
const cancelBooking = async (bookingId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // Assuming your backend has a route for cancellation, e.g., PUT /api/bookings/:id/cancel
  // or DELETE /api/bookings/:id
  // This example uses PUT to update status, but DELETE could also be valid depending on your API.
  const response = await axios.put(`${API_URL}/${bookingId}/cancel`, {}, config);
  return response.data;
};

const bookingService = {
  getUserBookings,
  createBooking,
  cancelBooking, // Export the cancelBooking function
};

export default bookingService;