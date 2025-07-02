// src/components/EventCard.js
import React from 'react';
import { Link } from 'react-router-dom';

function EventCard({ event }) {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s ease-in-out',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <Link to={`/events/${event._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          />
        )}
        <div style={{ padding: '15px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{event.title}</h3>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>
            <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
          </p>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>
            <strong>Location:</strong> {event.location}
          </p>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
            <strong>Price:</strong> {event.price === 0 ? 'Free' : `₹${event.price}`}
          </p>
          <p style={{ fontSize: '0.8em', color: '#888' }}>
            Available Tickets: {event.availableTickets}
          </p>
        </div>
      </Link>
    </div>
  );
}

export default EventCard;