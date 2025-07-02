// src/features/payment/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../../services/paymentService';
import { toast } from 'react-toastify';

const initialState = {
  orderId: null,
  orderAmount: null,
  paymentStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  paymentError: null,
  status: 'idle', // General slice status for async operations
};

// Create Razorpay Order
export const createOrder = createAsyncThunk(
  'payment/createOrder',
  async (orderData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await paymentService.createOrder(orderData, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Process Payment (Verify on backend)
export const processPayment = createAsyncThunk(
  'payment/processPayment',
  async (paymentResult, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await paymentService.processPayment(paymentResult, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    reset: (state) => {
      state.orderId = null;
      state.orderAmount = null;
      state.paymentStatus = 'idle';
      state.paymentError = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.status = 'loading';
        state.paymentStatus = 'loading';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orderId = action.payload.id; // Razorpay order ID
        state.orderAmount = action.payload.amount; // Amount in paisa
        state.paymentStatus = 'idle'; // Ready for client-side payment
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.paymentStatus = 'failed';
        state.paymentError = action.payload;
        toast.error(action.payload);
      })
      // Process Payment
      .addCase(processPayment.pending, (state) => {
        state.status = 'loading';
        state.paymentStatus = 'loading';
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.paymentStatus = 'succeeded';
        // toast.success('Payment successfully verified!'); // Toast handled in PaymentForm
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.status = 'failed';
        state.paymentStatus = 'failed';
        state.paymentError = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { reset } = paymentSlice.actions;
export default paymentSlice.reducer;