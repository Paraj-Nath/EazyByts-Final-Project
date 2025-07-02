// src/services/commentService.js
import axios from 'axios';
import { BASE_URL } from '../utils/constants'; // Ensure BASE_URL is imported

const API_URL = `${BASE_URL}/api/comments`;

// Get comments for a specific event
const getCommentsByEvent = async (eventId) => {
  const response = await axios.get(`${API_URL}/${eventId}`);
  return response.data;
};

// Add a new comment
const addComment = async (commentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  const response = await axios.post(API_URL, commentData, config);
  return response.data;
};

// Delete a comment
const deleteComment = async (commentId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`${API_URL}/${commentId}`, config);
  return response.data;
};


const commentService = {
  getCommentsByEvent,
  addComment,
  deleteComment,
};

export default commentService;