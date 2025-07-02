// src/components/PaymentForm.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createOrder, processPayment, reset as resetPaymentState } from '../features/payment/paymentSlice';
import { RAZORPAY_KEY_ID } from '../utils/constants'; // Ensure you have this in constants.js
import Loader from './Loader';
import Message from './Message';
import { createBooking } from '../features/bookings/bookingSlice'; // To create booking after successful payment

function PaymentForm({ event, bookingDetails, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    orderId,
    paymentStatus, // 'idle', 'loading', 'succeeded', 'failed'
    paymentError,
    orderAmount, // The amount from the created order
    status: paymentSliceStatus // General status for async operations in payment slice
  } = useSelector((state) => state.payment);

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const totalAmount = event.price * bookingDetails.numTickets;

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      toast.error('Failed to load Razorpay script.');
      setRazorpayLoaded(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (paymentStatus === 'succeeded') {
      toast.success('Payment Successful!');
      // Dispatch createBooking after successful payment
      dispatch(createBooking({
        event: event._id,
        numTickets: bookingDetails.numTickets,
        totalPrice: totalAmount,
        paymentStatus: 'Paid' // Indicate payment was successful
      }));
      dispatch(resetPaymentState()); // Clear payment state
      onClose(); // Close modal
    } else if (paymentStatus === 'failed') {
      toast.error(`Payment Failed: ${paymentError}`);
      dispatch(resetPaymentState()); // Clear payment state
    }
  }, [paymentStatus, paymentError, dispatch, onClose, event._id, bookingDetails.numTickets, totalAmount]);

  const initiatePayment = () => {
    if (!razorpayLoaded) {
      toast.error('Razorpay script not loaded yet. Please try again.');
      return;
    }
    if (!user) {
      toast.error('You must be logged in to make a payment.');
      return;
    }

    // Create order on backend first
    dispatch(createOrder({ amount: totalAmount }));
  };

  useEffect(() => {
    // If order is created, proceed with Razorpay checkout
    if (orderId && orderAmount && razorpayLoaded && user) {
      const options = {
        key: RAZORPAY_KEY_ID, // Your Razorpay Key ID from constants
        amount: orderAmount, // Amount is in paisa (smallest unit)
        currency: 'INR',
        name: 'Event Management App',
        description: `Booking for ${event.title}`,
        order_id: orderId,
        handler: function (response) {
          // Send payment success details to your backend for verification
          dispatch(processPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            totalAmount: totalAmount // Send total amount for server-side validation
          }));
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '' // Add user phone if available
        },
        notes: {
          event_id: event._id,
          user_id: user._id,
          num_tickets: bookingDetails.numTickets
        },
        theme: {
          color: '#3399CC'
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        toast.error(`Payment failed: ${response.error.description}`);
        dispatch(resetPaymentState());
      });
      rzp1.open();
    }
  }, [orderId, orderAmount, razorpayLoaded, user, dispatch, event.title, event._id, bookingDetails.numTickets, totalAmount]);


  return (
    <div style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', backgroundColor: '#fff', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '20px' }}>Confirm Your Booking</h3>
      <p>Event: <strong>{event.title}</strong></p>
      <p>Tickets: <strong>{bookingDetails.numTickets}</strong></p>
      <p>Total Amount: <strong>₹{totalAmount}</strong></p>

      {paymentSliceStatus === 'loading' && <Loader />}
      {paymentError && <Message variant='danger'>{paymentError}</Message>}

      <button
        onClick={initiatePayment}
        disabled={paymentSliceStatus === 'loading' || !razorpayLoaded}
        style={{
          marginTop: '20px',
          padding: '12px 25px',
          backgroundColor: '#673ab7',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '1em',
          transition: 'background-color 0.2s ease',
        }}
      >
        {paymentSliceStatus === 'loading' ? 'Processing...' : `Pay ₹${totalAmount}`}
      </button>
      <button
        onClick={onClose}
        style={{
          marginTop: '10px',
          marginLeft: '10px',
          padding: '10px 20px',
          backgroundColor: '#ccc',
          color: '#333',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '0.9em',
        }}
      >
        Cancel
      </button>
    </div>
  );
}

export default PaymentForm;