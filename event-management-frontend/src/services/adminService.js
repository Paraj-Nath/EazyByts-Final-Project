// src/services/adminService.js
import axios from 'axios';
// Ensure BASE_URL is correctly defined, e.g., in a constants file or directly here
// const BASE_URL = 'http://localhost:5000'; // Replace with your actual backend URL or import from constants
import { BASE_URL } from '../utils/constants'; // Assuming you have a constants file

const API_URL = `${BASE_URL}/api/admin`; // Your admin API endpoint

// Function to get system analytics
const getSystemAnalytics = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/analytics`, config);
  return response.data;
};

// Function to get all users for admin management
const getUsers = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/users`, config);
  return response.data;
};

// Function to delete a user
const deleteUser = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`${API_URL}/users/${userId}`, config);
  return response.data;
};

const adminService = {
  getSystemAnalytics,
  getUsers,
  deleteUser,
};

export default adminService;