// src/services/paymentService.js
import axios from 'axios';
import { BASE_URL } from '../utils/constants';

const API_URL = `${BASE_URL}/api/payments`;

// Create a Razorpay order on the backend
const createOrder = async (orderData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  const response = await axios.post(`${API_URL}/create-order`, orderData, config);
  return response.data;
};

// Verify payment details on the backend
const processPayment = async (paymentResult, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  const response = await axios.post(`${API_URL}/verify-payment`, paymentResult, config);
  return response.data;
};

const paymentService = {
  createOrder,
  processPayment,
};

export default paymentService;