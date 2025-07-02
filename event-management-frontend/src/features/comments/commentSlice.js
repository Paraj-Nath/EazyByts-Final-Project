// src/features/comments/commentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import commentService from '../../services/commentService';
import { toast } from 'react-toastify';

const initialState = {
  comments: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  success: false, // To indicate success of add/delete operations
};

// Get comments for an event
export const getEventComments = createAsyncThunk(
  'comments/getEventComments',
  async (eventId, thunkAPI) => {
    try {
      // Comments are typically public, but token can be added if your backend requires it
      return await commentService.getCommentsByEvent(eventId);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(message); // Display error using toast
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add a new comment
export const addComment = createAsyncThunk(
  'comments/addComment',
  async (commentData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token; // User must be logged in to comment
      const response = await commentService.addComment(commentData, token);
      toast.success(response.message || 'Comment added successfully!'); // Assuming backend sends a message
      return response.comment; // Return the new comment object from the backend response
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(message); // Display error using toast
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a comment
export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token; // User must be logged in and authorized to delete
      await commentService.deleteComment(commentId, token);
      toast.success('Comment deleted successfully!'); // Success notification
      return commentId; // Return the ID of the deleted comment to filter it from state
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      toast.error(message); // Display error using toast
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    reset: (state) => {
      state.status = 'idle';
      state.error = null;
      state.success = false;
    },
    // If you ever decide to implement optimistic updates without re-fetching all comments:
    // addCommentLocally: (state, action) => {
    //   state.comments.unshift(action.payload); // Add new comment to the top
    // },
    // removeCommentLocally: (state, action) => {
    //   state.comments = state.comments.filter(comment => comment._id !== action.payload);
    // },
  },
  extraReducers: (builder) => {
    builder
      // Get Event Comments
      .addCase(getEventComments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getEventComments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.comments = action.payload;
        state.error = null; // Clear any previous error
      })
      .addCase(getEventComments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.comments = []; // Clear comments on failed fetch
      })
      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.status = 'loading';
        state.success = false;
      })
      .addCase(addComment.fulfilled, (state) => {
        state.status = 'succeeded';
        state.success = true;
        state.error = null; // Clear any previous error
        // The `CommentSection` component is set up to re-fetch comments after a successful add,
        // so we don't need to manipulate the `comments` array here directly.
      })
      .addCase(addComment.rejected, (state, action) => {
        state.status = 'failed';
        state.success = false;
        state.error = action.payload;
      })
      // Delete Comment
      .addCase(deleteComment.pending, (state) => {
        state.status = 'loading';
        state.success = false;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.success = true;
        state.error = null; // Clear any previous error
        // Remove the deleted comment from the state based on the ID returned from the thunk
        state.comments = state.comments.filter(
          (comment) => comment._id !== action.payload
        );
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.status = 'failed';
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { reset } = commentSlice.actions;
export default commentSlice.reducer;