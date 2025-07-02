// src/features/events/eventSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import eventService from '../../services/eventService';
import { toast } from 'react-toastify';





const initialState = {
  events: [],
  event: null, // For single event details
  recommendations: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  success: false, // For create/update/delete operations
};

// Get all events
export const getEvents = createAsyncThunk(
  'events/getAll',
  async (queryParams = {}, thunkAPI) => {
    try {
      return await eventService.getEvents(queryParams);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get event details by ID
export const getEventDetails = createAsyncThunk(
    'events/getEventDetails',
    async (id, thunkAPI) => {
      try {
        // Use the defined API_URL
        const response = await eventService.getEventById(id);
        return response.data;
      } catch (error) {
        const message =
          (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          error.toString();
        return thunkAPI.rejectWithValue(message);
      }
    }
  );

// Create Event
export const createEvent = createAsyncThunk(
  'events/create',
  async (eventData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await eventService.createEvent(eventData, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update Event
export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, eventData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await eventService.updateEvent(id, eventData, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete Event
export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await eventService.deleteEvent(id, token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get Event Recommendations
export const getEventRecommendations = createAsyncThunk(
  'events/recommendations',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await eventService.getEventRecommendations(token);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    reset: (state) => {
      state.status = 'idle';
      state.error = null;
      state.success = false;
      // Do not reset events or event here, only status related to operations
    },
    clearEventDetails: (state) => {
      state.event = null; // Clear single event details when leaving page
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all events
      .addCase(getEvents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload;
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Get event details
      .addCase(getEventDetails.pending, (state) => {
        state.status = 'loading';
        state.event = null; // Clear previous event details on new fetch
      })
      .addCase(getEventDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.event = action.payload;
      })
      .addCase(getEventDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.event = null;
      })
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.status = 'loading';
        state.success = false;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.success = true;
        state.events.push(action.payload); // Add new event to list
        toast.success('Event created successfully!');
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.status = 'loading';
        state.success = false;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.success = true;
        // Update event in the list
        const index = state.events.findIndex(event => event._id === action.payload._id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        // If the updated event is the one currently viewed
        if (state.event && state.event._id === action.payload._id) {
          state.event = action.payload;
        }
        toast.success('Event updated successfully!');
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Delete Event
      .addCase(deleteEvent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.success = true;
        state.events = state.events.filter((event) => event._id !== action.payload);
        toast.success('Event deleted successfully!');
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Get Event Recommendations
      .addCase(getEventRecommendations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getEventRecommendations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.recommendations = action.payload.events; // Assuming payload is { message, events }
        if (action.payload.message) {
          toast.info(action.payload.message);
        }
      })
      .addCase(getEventRecommendations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.recommendations = [];
        toast.error(action.payload);
      });
  },
});

export const { reset, clearEventDetails } = eventSlice.actions;
export default eventSlice.reducer;