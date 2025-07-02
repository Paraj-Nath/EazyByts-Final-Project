// src/services/authService.js
import axios from 'axios';
import { BASE_URL } from '../utils/constants';

const API_URL = `${BASE_URL}/api/auth`;

// Register user
const register = async (userData) => {
    console.log('Registering to URL:', `${API_URL}/register`);
    const response = await axios.post(`${API_URL}/register`, userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Update user profile
const updateUserProfile = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.put(`${BASE_URL}/users/profile`, userData, config);
  return response.data; // Backend should send back the updated user object
};

const authService = {
  register,
  login,
  logout,
  updateUserProfile,
};

export default authService;