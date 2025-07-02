// src/features/bookings/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bookingService from '../../services/bookingService'; // Import the service
// import { toast } from 'react-toastify'; // Only if you toast directly in slice

const initialState = {
  bookings: [],
  // bookingDetails: null, // If you have a separate state for a single booking's details
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  isSuccess: false, // To indicate a successful action like cancellation
};

// Async Thunk for getting user's bookings
export const getUserBookings = createAsyncThunk(
  'bookings/getUserBookings',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await bookingService.getUserBookings(token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      // No toast here as the component handles errors via 'error' state
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async Thunk for creating a booking (if you have this)
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await bookingService.createBooking(bookingData, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      // No toast here as the component handles errors via 'error' state
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async Thunk for canceling a booking
export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (bookingId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await bookingService.cancelBooking(bookingId, token);
      // Return the ID to update the state, don't necessarily return the full response data
      return bookingId;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      // No toast here as the component handles errors via try/catch around dispatch().unwrap()
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    reset: (state) => {
      state.status = 'idle';
      state.error = null;
      state.isSuccess = false; // Reset success status
      // state.bookings = []; // Only clear if you want bookings to be re-fetched every time
    },
  },
  extraReducers: (builder) => {
    builder
      // getUserBookings
      .addCase(getUserBookings.pending, (state) => {
        state.status = 'loading';
        state.isSuccess = false; // Reset success for new operation
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookings = action.payload;
        state.error = null; // Clear previous errors
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // createBooking (if applicable)
      .addCase(createBooking.pending, (state) => {
        state.status = 'loading';
        state.isSuccess = false;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isSuccess = true;
        state.error = null;
        // Optionally add the new booking to the list if not re-fetching immediately
        // state.bookings.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isSuccess = false;
      })
      // cancelBooking
      .addCase(cancelBooking.pending, (state) => {
        state.status = 'loading';
        state.isSuccess = false; // Reset success for this operation
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isSuccess = true; // Indicate success for re-fetch trigger
        state.error = null; // Clear any previous errors

        // Find the booking and mark it as cancelled in the current state
        const cancelledBookingId = action.payload;
        const bookingToUpdate = state.bookings.find(
          (booking) => booking._id === cancelledBookingId
        );
        if (bookingToUpdate) {
          bookingToUpdate.isCancelled = true;
          bookingToUpdate.paymentStatus = 'cancelled'; // Update payment status if cancellation implies it
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isSuccess = false;
      });
  },
});

export const { reset } = bookingSlice.actions; // Export reset action
export default bookingSlice.reducer; // Export the reducer