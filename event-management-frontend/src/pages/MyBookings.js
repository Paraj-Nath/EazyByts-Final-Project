// src/pages/MyBookingsPage.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserBookings, cancelBooking, reset as resetBookingState } from '../features/bookings/bookingSlice'; // Added cancelBooking
import Loader from '../components/Loader';
import Message from '../components/Message'; // Assuming you have a Message component
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom'; // Added Link for navigation

function MyBookings() {
  const dispatch = useDispatch();
  // Using 'status', 'error', 'isSuccess' as direct state properties if they exist in your slice
  const { bookings, status, error, isSuccess } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth); // To check if user is logged in

  // Derive loading and error states for simpler use in JSX
  const isLoading = status === 'loading';
  const isError = status === 'failed';
  const message = error; // The error message from the slice

  useEffect(() => {
    if (!user) {
      toast.info('Please log in to view your bookings.');
      return; // Exit if no user
    }

    if (isError && message) { // Only toast if there's an actual error message
      toast.error(message);
    }

    // Fetch bookings initially and whenever a booking action (like cancel) is successful
    // The `isSuccess` dependency ensures re-fetch after a successful cancellation.
    dispatch(getUserBookings());

    return () => {
      dispatch(resetBookingState()); // Clean up state on unmount
    };
  }, [dispatch, user, isError, message, isSuccess]); // Added isSuccess as dependency

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        // .unwrap() is used to get the actual payload or throw the error from the thunk
        await dispatch(cancelBooking(bookingId)).unwrap();
        toast.success('Booking cancelled successfully!');
        // No need for manual re-fetch here; `useEffect` with `isSuccess` dependency will handle it.
      } catch (err) {
        // err here is the rejected value from the thunk (the message)
        toast.error(`Cancellation failed: ${err}`);
      }
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div style={{
      maxWidth: '900px', // py-8 px-4 max-w-4xl equivalent
      margin: 'auto', // mx-auto
      padding: '32px 16px', // py-8 px-4
    }}>
      <h1 style={{
        fontSize: '2.5em', // text-4xl
        fontWeight: 'bold',
        color: '#1a202c', // text-gray-900
        marginBottom: '32px', // mb-8
        textAlign: 'center',
      }}>My Bookings</h1>

      {isError && <Message variant='danger'>{message}</Message>}

      {status === 'succeeded' && bookings.length === 0 ? (
        <p style={{
          textAlign: 'center',
          color: '#4b5563', // text-gray-600
          fontSize: '1.125em', // text-lg
          marginTop: '32px', // mt-8
        }}>
          You have no bookings yet. <Link to="/events" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Find an event!</Link>
        </p>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px', // space-y-6
        }}>
          {bookings.map((booking) => (
            <div key={booking._id} style={{
              backgroundColor: '#ffffff', // bg-white
              borderRadius: '8px', // rounded-lg
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', // shadow-md
              padding: '24px', // p-6
              display: 'flex',
              flexDirection: 'column', // flex-col md:flex-row
              alignItems: 'center', // items-center md:items-start
              gap: '16px', // space-y-4 md:space-y-0
              // For md:space-x-6, handled below with margin-left
            }}>
              {/* Event Image and Link */}
              <Link to={`/events/${booking.event._id}`} style={{ flexShrink: 0 }}>
                <img
                  src={booking.event.imageUrl || 'https://via.placeholder.com/100x100?text=Event'}
                  alt={booking.event.title}
                  style={{
                    width: '96px', // w-24
                    height: '96px', // h-24
                    objectFit: 'cover',
                    borderRadius: '6px', // rounded-md
                  }}
                />
              </Link>
              {/* Booking Details */}
              <div style={{
                flexGrow: 1, // flex-grow
                textAlign: 'center', // text-center md:text-left
                // For md:space-x-6, add margin-left on larger screens
                '@media (min-width: 768px)': {
                  marginLeft: '24px', // md:space-x-6 (approx)
                  textAlign: 'left'
                }
              }}>
                <Link
                  to={`/events/${booking.event._id}`}
                  style={{
                    fontSize: '1.25em', // text-xl
                    fontWeight: '600', // font-semibold
                    color: '#1d4ed8', // text-blue-700
                    textDecoration: 'none',
                    display: 'block', // Ensures link takes full width for text alignment
                    marginBottom: '8px',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  {booking.event.title}
                </Link>
                <p style={{ color: '#4b5563', marginBottom: '4px' }}> {/* text-gray-600 */}
                  <span style={{ fontWeight: '500' }}>Date:</span> {new Date(booking.event.date).toLocaleDateString()} at {booking.event.time}
                </p>
                <p style={{ color: '#4b5563', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '500' }}>Location:</span> {booking.event.location}
                </p>
                <p style={{ color: '#4b5563', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '500' }}>Tickets:</span> {booking.numberOfTickets}
                </p>
                <p style={{ color: '#1a202c', fontSize: '1.125em', fontWeight: 'bold', marginBottom: '4px' }}> {/* text-gray-800 text-lg font-bold */}
                  Total Paid: ₹{booking.totalPrice.toFixed(2)}
                </p>
                <p style={{
                  fontWeight: '600', // font-semibold
                  color: booking.paymentStatus === 'paid' ? '#059669' : '#f97316', // text-green-600 : text-orange-500
                  marginBottom: '4px',
                }}>
                  Payment Status: {booking.paymentStatus ? booking.paymentStatus.toUpperCase() : 'N/A'}
                </p>
                <p style={{
                  fontWeight: '600', // font-semibold
                  color: booking.isCancelled ? '#dc2626' : '#059669', // text-red-600 : text-green-600
                }}>
                  Status: {booking.isCancelled ? 'Cancelled' : 'Confirmed'}
                </p>
              </div>
              {/* Cancel Button */}
              <div style={{ flexShrink: 0, marginTop: '16px' }}> {/* flex-shrink-0, space-y-4 */}
                {!booking.isCancelled && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    style={{
                      backgroundColor: '#ef4444', // bg-red-500
                      color: 'white',
                      fontWeight: 'bold',
                      padding: '8px 16px', // py-2 px-4
                      borderRadius: '4px', // rounded
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease', // transition-colors duration-200
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'} // hover:bg-red-600
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                    disabled={isLoading} // Disable button during cancellation process
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;