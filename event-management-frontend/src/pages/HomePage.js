// src/pages/HomePage.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getEventRecommendations, reset as resetEventState } from '../features/events/eventSlice';
import EventCard from '../components/EventCard'; // Assuming EventCard also uses inline styles or is a simple component
import Loader from '../components/Loader';       // Assuming Loader uses inline styles or is a simple component
import { toast } from 'react-toastify';

function HomePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { recommendations, status, error } = useSelector((state) => state.events); // Using 'status' and 'error'

  // Determine isLoading and isError based on 'status'
  const isLoading = status === 'loading';
  const isError = status === 'failed';
  const message = error; // The error message from the slice

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (user) {
      dispatch(getEventRecommendations());
    }
    return () => {
      dispatch(resetEventState()); // Clean up on unmount
    };
  }, [dispatch, user, isError, message]);

  return (
    <div style={{
      textAlign: 'center',
      padding: '50px 20px',
      minHeight: 'calc(100vh - 150px)', // Adjust based on header/footer height
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f2f5',
    }}>
      <section style={{
        marginBottom: '48px', // mb-12
        padding: '32px', // p-8
        background: 'linear-gradient(to right, #3b82f6, #4f46e5)', // from-blue-500 to-indigo-600
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // shadow-lg
        width: '100%', // Ensure it takes full width of parent
        maxWidth: '800px', // Optional: limit width for better appearance
        boxSizing: 'border-box' // Include padding in width
      }}>
        <h1 style={{
          fontSize: '3.5em', // text-5xl
          fontWeight: '800', // font-extrabold
          marginBottom: '16px', // mb-4
          // Animations are complex for inline styles, simplifying for now
          // For real animations, you'd typically use a CSS file or a library like framer-motion
        }}>Welcome to EventHub!</h1>
        <p style={{
          fontSize: '1.25em', // text-xl
          marginBottom: '24px', // mb-6
          opacity: '0.9', // opacity-90
          // Animations are complex for inline styles, simplifying for now
        }}>Discover and book amazing events near you.</p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to="/events"
            style={{
              backgroundColor: '#ffffff', // bg-white
              color: '#2563eb', // text-blue-600
              fontWeight: 'bold',
              padding: '12px 32px', // py-3 px-8
              borderRadius: '9999px', // rounded-full
              fontSize: '1.125em', // text-lg
              textDecoration: 'none',
              transition: 'all 0.3s ease', // transition-all duration-300
              // transform: 'scale(1.0)', // Initial transform
              // '&:hover': { transform: 'scale(1.05)', backgroundColor: '#f3f4f6' } // hover:scale-105 hover:bg-gray-100
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
          >
            Explore Events
          </Link>
          {/* Sign Up link from the second snippet, kept if user is not logged in */}
          {!user && (
            <Link
              to="/register"
              style={{
                padding: '15px 30px',
                backgroundColor: '#28a745',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1.1em',
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              Sign Up
            </Link>
          )}
        </div>
      </section>

      {user && (
        <section style={{ marginBottom: '48px', width: '100%', maxWidth: '1000px' }}> {/* mb-12, adjusted width */}
          <h2 style={{
            fontSize: '2em', // text-3xl
            fontWeight: 'bold',
            color: '#374151', // gray-800
            textAlign: 'center',
            marginBottom: '24px', // mb-6
          }}>
            Personalized Recommendations
          </h2>
          {isLoading ? (
            <Loader />
          ) : recommendations && recommendations.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
              gap: '24px', // gap-6
              justifyContent: 'center' // Center grid items if they don't fill the row
            }}>
              {recommendations.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#4b5563' }}>
              No personalized recommendations yet. Update your interests in your profile!
              <br/>
              Or <Link to="/events" style={{ color: '#3b82f6', textDecoration: 'underline' }}>explore all events</Link>.
            </p>
          )}
        </section>
      )}

      <section style={{ width: '100%', maxWidth: '1000px' }}>
        <h2 style={{
          fontSize: '2em', // text-3xl
          fontWeight: 'bold',
          color: '#374151', // gray-800
          textAlign: 'center',
          marginBottom: '24px', // mb-6
        }}>
          Upcoming Events
        </h2>
        <p style={{ textAlign: 'center', color: '#4b5563' }}>
          Find concerts, workshops, festivals, and more.
          <br/>
          <Link to="/events" style={{ color: '#3b82f6', textDecoration: 'underline' }}>View all events</Link>.
        </p>
        {/* You could fetch a few 'latest' events here or just point to EventList */}
      </section>
    </div>
  );
}

export default HomePage;