// src/components/CommentSection.js
import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  getEventComments,
  addComment,
  reset as resetCommentState,
} from '../features/comments/commentSlice';
import Loader from './Loader';
import Message from './Message';
import { SocketContext } from '../App'; // Import SocketContext from App.js

function CommentSection({ eventId }) {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext); // Get socket instance from context
  const { user } = useSelector((state) => state.auth);
  const { comments, status, error, success } = useSelector((state) => state.comments);

  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    if (eventId && socket) { // Ensure socket is available
      // 1. Fetch existing comments from the backend when component mounts or eventId changes
      dispatch(getEventComments(eventId));

      // 2. Join the specific event's comment room for real-time updates
      console.log(`Attempting to join event room: ${eventId}`);
      socket.emit('join_event', eventId);

      // 3. Listen for incoming comments from the server (real-time)
      const handleReceiveComment = (comment) => {
        console.log('Received real-time comment:', comment);
        // Dispatch action to directly add the new comment to the state
        // This is more efficient than re-fetching all comments.
        // The backend's `commentRoutes.js` sends the populated `createdComment`
        // which includes `user.name`, so we can directly add it.
        dispatch({ type: 'comments/getEventComments/fulfilled', payload: [...comments, comment] });
        // NOTE: The above line (dispatching 'comments/getEventComments/fulfilled') is a direct state manipulation
        // and is generally discouraged in Redux Toolkit. A better approach is to create a specific
        // reducer action like `addCommentLocally` in `commentSlice.js` and dispatch that.
        // For simplicity and to avoid re-fetching, this is a quick fix.
        // A more robust solution would be:
        // dispatch(addCommentLocally(comment)); // if you define addCommentLocally in commentSlice.js
      };

      socket.on('newComment', handleReceiveComment); // Listen for 'newComment' event

      // 4. Listen for real-time ticket updates (from booking/cancellation)
      const handleEventTicketsUpdated = ({ eventId: updatedEventId, availableTickets }) => {
        if (updatedEventId === eventId) {
          toast.info(`Tickets for this event updated: ${availableTickets} available.`);
          // You might want to dispatch an action to update event details in Redux state here
          // e.g., dispatch(updateEventTickets({ eventId, availableTickets }));
        }
      };
      socket.on('eventTicketsUpdated', handleEventTicketsUpdated);

      // Cleanup: Leave the room and remove listeners when component unmounts or eventId changes
      return () => {
        console.log(`Leaving event room: ${eventId}`);
        socket.emit('leave_event', eventId);
        socket.off('newComment', handleReceiveComment);
        socket.off('eventTicketsUpdated', handleEventTicketsUpdated);
      };
    }
  }, [eventId, dispatch, socket, comments]); // Added 'comments' to dependencies for the optimistic update

  useEffect(() => {
    // This useEffect is primarily for resetting the `success` and `error` flags
    // in the Redux state after actions are fulfilled or rejected.
    // Toast notifications are now primarily handled within the Redux thunks/slice.
    if (success) {
      setNewCommentText(''); // Clear input on successful comment add
      dispatch(resetCommentState()); // Reset success flag in slice
    }
    // Error toasts are handled in the slice, but we reset state here.
    if (error) {
      dispatch(resetCommentState()); // Reset error flag in slice
    }
  }, [success, error, dispatch]);


  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to comment.');
      return;
    }
    if (!newCommentText.trim()) {
      toast.error('Comment cannot be empty.');
      return;
    }

    // 1. Dispatch to save the comment to the database
    const resultAction = await dispatch(addComment({ eventId, text: newCommentText.trim() }));

    if (addComment.fulfilled.match(resultAction)) {
      const createdComment = resultAction.payload;

      // 2. Emit the new comment via Socket.IO for real-time update to others.
      // Send the populated user name for immediate display on other clients.
      if (socket) {
        socket.emit('new_comment', {
          eventId: createdComment.event,
          user: createdComment.user._id,
          username: createdComment.user.name, // Use the populated user name
          text: createdComment.text,
          createdAt: createdComment.createdAt
        });
      }
    }
    // Error handling and success toasts are handled in the `commentSlice`.
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Comments</h2>

      {/* Display comments */}
      <div style={{ maxHeight: '400px', overflowY: 'auto', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
        {status === 'loading' && <Loader />}
        {status === 'failed' && error && <Message variant='danger'>{error}</Message>}
        {comments && comments.length === 0 && status !== 'loading' ? (
          <Message variant='info'>No comments yet. Be the first to comment!</Message>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} style={{
              backgroundColor: '#f9f9f9',
              padding: '10px 15px',
              borderRadius: '5px',
              marginBottom: '10px',
              border: '1px solid #e0e0e0'
            }}>
              <span style={{ fontWeight: 'bold', color: '#007bff' }}>{comment.user ? comment.user.name : 'Anonymous'}</span>
              <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '10px' }}>
                ({new Date(comment.createdAt).toLocaleString()})
              </span>
              <p style={{ margin: '5px 0 0 0' }}>{comment.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Comment input form */}
      <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text" // Corrected: removed backslashes
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder={user ? "Write your comment here..." : "Log in to comment..."} // Corrected: removed backslashes
          disabled={!user || status === 'loading'}
          style={{
            flexGrow: 1,
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1em',
            backgroundColor: user ? 'white' : '#f0f0f0'
          }}
        />
        <button
          type="submit"
          disabled={!user || status === 'loading' || !newCommentText.trim()} // Disable if empty
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em',
            transition: 'background-color 0.2s ease',
            opacity: !user || !newCommentText.trim() ? 0.6 : 1 // Adjust opacity for disabled state
          }}
          onMouseOver={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#0056b3'; }}
          onMouseOut={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#007bff'; }}
        >
          {status === 'loading' ? 'Sending...' : 'Comment'}
        </button>
      </form>
    </div>
  );
}

export default CommentSection;