// src/services/eventService.js
import axios from 'axios';
import { BASE_URL } from '../utils/constants'; // Ensure BASE_URL is imported

const API_URL = `${BASE_URL}/api/events`;

// Get all events
const getEvents = async (queryParams) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await axios.get(`${API_URL}?${queryString}`);
  return response.data;
};

// Get event by ID
const getEventById = async (id) => {
    console.log('Fetching event details from URL:', `${API_URL}/${id}`);
    const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Create event (Admin only)
const createEvent = async (eventData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data', // Important for file uploads
    },
  };
  const response = await axios.post(API_URL, eventData, config);
  return response.data;
};

// Update event (Admin only)
const updateEvent = async (id, eventData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data', // Important for file uploads
    },
  };
  const response = await axios.put(`${API_URL}/${id}`, eventData, config);
  return response.data;
};

// Delete event (Admin only)
const deleteEvent = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};

// Get event recommendations
const getEventRecommendations = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/recommendations`, config);
  return response.data;
};


const eventService = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRecommendations,
};

export default eventService;