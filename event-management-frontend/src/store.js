// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import eventReducer from './features/events/eventSlice';
import bookingReducer from './features/bookings/bookingSlice';
import paymentReducer from './features/payment/paymentSlice';
import commentReducer from './features/comments/commentSlice';
import adminReducer from './features/admin/adminSlice'; // If you have admin-specific state

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    bookings: bookingReducer,
    payment: paymentReducer,
    comments: commentReducer,
    admin: adminReducer, // Add your admin slice
  },
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools only in development
});

export default store;