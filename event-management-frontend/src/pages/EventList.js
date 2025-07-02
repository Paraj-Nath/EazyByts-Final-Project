// src/pages/EventListPage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents, getEventRecommendations, reset as resetEventState } from '../features/events/eventSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import EventCard from '../components/EventCard';
import { toast } from 'react-toastify';

function EventList() {
  const dispatch = useDispatch();

  const { events, recommendations, status, error } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  // State for search/filter parameters
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    // Dispatch action to fetch all events when the component mounts or filters change
    const queryParams = {
      keyword,
      location,
      eventType,
      startDate,
      endDate,
      minPrice,
      maxPrice,
    };
    dispatch(getEvents(queryParams));

    // Fetch recommendations if user is logged in
    if (user) {
      dispatch(getEventRecommendations());
    }

    return () => {
      dispatch(resetEventState()); // Clean up event state on unmount
    };
  }, [dispatch, user, keyword, location, eventType, startDate, endDate, minPrice, maxPrice]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Re-dispatch getEvents will happen automatically due to useEffect dependencies
    toast.info('Applying filters...');
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setEventType('');
    setStartDate('');
    setEndDate('');
    setMinPrice('');
    setMaxPrice('');
    toast.info('Filters cleared.');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>All Events</h2>

      {/* Search and Filter Form */}
      <form onSubmit={handleSearchSubmit} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '15px',
        marginBottom: '30px',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <input type="text" placeholder="Keyword (title, description)" value={keyword} onChange={(e) => setKeyword(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="Event Type (e.g., Concert)" value={eventType} onChange={(e) => setEventType(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="number" placeholder="Min Price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="number" placeholder="Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Search
        </button>
        <button type="button" onClick={handleClearFilters} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Clear Filters
        </button>
      </form>

      {/* Personalized Recommendations Section */}
      {user && recommendations.length > 0 && (
        <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #d4edda', borderRadius: '8px', backgroundColor: '#e2f0e6' }}>
          <h3 style={{ color: '#155724', marginBottom: '20px', textAlign: 'center' }}>
            Recommended For You
            <span role="img" aria-label="star" style={{ marginLeft: '10px' }}>⭐</span>
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            justifyContent: 'center'
          }}>
            {recommendations.map((event) => (
              <EventCard key={`rec-${event._id}`} event={event} />
            ))}
          </div>
          <hr style={{margin: '20px 0', borderColor: '#c3e6cb'}}/>
          <p style={{textAlign: 'center', fontSize: '0.9em', color: '#155724'}}>Scroll down for all events.</p>
        </div>
      )}

      {status === 'loading' && <Loader />}
      {error && <Message variant='danger'>{error}</Message>}
      {status === 'succeeded' && events.length === 0 && (
        <Message variant='info'>No events found matching your criteria.</Message>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '25px',
        justifyContent: 'center'
      }}>
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}

export default EventList;