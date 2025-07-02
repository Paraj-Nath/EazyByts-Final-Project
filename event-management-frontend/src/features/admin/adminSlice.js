// src/features/admin/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService'; // Import the service
import { toast } from 'react-toastify';

const initialState = {
  users: [],
  analytics: null, // Ensure analytics is part of your state
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  success: false, // You might use this for success messages
};

// Async Thunk for getting system analytics
export const getSystemAnalytics = createAsyncThunk(
  'admin/getSystemAnalytics',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await adminService.getSystemAnalytics(token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      // Using toast here might be redundant if the component also catches error and toasts
      // toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async Thunk for getting all admin users
export const getAdminUsers = createAsyncThunk(
  'admin/getAdminUsers',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await adminService.getUsers(token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      // toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async Thunk for deleting an admin user
export const deleteAdminUser = createAsyncThunk(
  'admin/deleteAdminUser',
  async (userId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      await adminService.deleteUser(userId, token);
      toast.success('User deleted successfully!'); // Toast on success
      return userId; // Return the ID to filter it out from the state
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      // Toast error only if you don't handle it in the component
      // toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    reset: (state) => {
      state.status = 'idle';
      state.error = null;
      state.success = false;
      // Note: You usually don't clear data (users, analytics) on `reset`
      // unless you intend for them to be refetched every time the component mounts.
      // If `AdminDashboard` is meant to clear its data on unmount, this is fine.
      // state.users = [];
      // state.analytics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getSystemAnalytics
      .addCase(getSystemAnalytics.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getSystemAnalytics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.analytics = action.payload;
      })
      .addCase(getSystemAnalytics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // getAdminUsers
      .addCase(getAdminUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getAdminUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(getAdminUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // deleteAdminUser
      .addCase(deleteAdminUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Remove the deleted user from the state without re-fetching all users
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteAdminUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { reset } = adminSlice.actions; // Export reset as a named export
export default adminSlice.reducer; // Export the reducer as default