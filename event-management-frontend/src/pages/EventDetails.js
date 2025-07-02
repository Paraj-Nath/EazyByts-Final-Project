// src/pages/EventDetails.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getEventDetails, clearEventDetails } from '../features/events/eventSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import PaymentForm from '../components/PaymentForm';
import CommentSection from '../components/CommentSection'; // Ensure this path is correct
import { toast } from 'react-toastify';

function EventDetails() {
  const { id: eventId } = useParams();
  const dispatch = useDispatch();

  const { event, status, error } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [numTickets, setNumTickets] = useState(1);

  useEffect(() => {
    // Fetch event details if not already loaded or if it's a different event
    if (!event || event._id !== eventId) {
      dispatch(getEventDetails(eventId));
    }

    // Cleanup function to clear event details when component unmounts
    return () => {
      dispatch(clearEventDetails());
    };
  }, [eventId, event, dispatch]); // Depend on eventId, event, and dispatch

  const handleBookTickets = () => {
    if (!user) {
      toast.info('Please log in to book tickets.');
      // You might want to redirect to login page here if not handled by ProtectedRoute
      return;
    }
    if (numTickets <= 0 || numTickets > event.availableTickets) {
      toast.error('Invalid number of tickets.');
      return;
    }
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      {status === 'loading' && <Loader />}
      {error && <Message variant='danger'>{error}</Message>}
      {event && (
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <img
              src={event.imageUrl}
              alt={event.title}
              style={{ width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            />
          </div>
          <div style={{ flex: '2 1 400px' }}>
            <h1 style={{ color: '#333', marginBottom: '10px' }}>{event.title}</h1>
            <p style={{ color: '#666', fontSize: '1.1em', marginBottom: '15px' }}>{event.description}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {event.time}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Type:</strong> {event.eventType}</p>
            <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Price: ₹{event.price}</p>
            <p>Tickets Available: {event.availableTickets}</p>
          </div>
        </div>
      )}

      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

      {/* Ticket Booking Section */}
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Book Tickets</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label htmlFor='numTickets' style={{ fontSize: '1.1em', color: '#555' }}>Number of Tickets:</label>
          <input
            type='number'
            id='numTickets'
            min='1'
            max={event?.availableTickets || 1}
            value={numTickets}
            onChange={(e) => setNumTickets(Math.max(1, Math.min(parseInt(e.target.value) || 1, event?.availableTickets || 1)))}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              width: '100%',
              maxWidth: '150px'
            }}
          />
          {event?.availableTickets > 0 ? (
            <div>
              <button
                onClick={handleBookTickets}
                disabled={!user || numTickets <= 0 || numTickets > (event?.availableTickets || 0)}
                style={{
                  marginTop: '20px',
                  padding: '12px 25px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1em'
                }}
              >
                Book Now
              </button>
            </div>
          ) : (
            <Message variant='info' style={{ marginTop: '20px' }}>Tickets are sold out!</Message>
          )}

          {showPaymentModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', position: 'relative' }}>
                <button
                  onClick={closePaymentModal}
                  style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer'
                  }}
                >&times;</button>
                <PaymentForm
                  event={event}
                  bookingDetails={{ numTickets: numTickets }}
                  onClose={closePaymentModal}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <hr style={{ margin: '30px 0', borderColor: '#eee' }} />
      <CommentSection eventId={eventId} />
    </div>
  );
}

export default EventDetails;