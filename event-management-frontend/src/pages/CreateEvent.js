// src/pages/CreateEvent.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createEvent, reset as resetEventState } from '../features/events/eventSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ImageUploader from '../components/ImageUploader';

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState(''); // Added time
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState(''); // Changed to price
  const [availableTickets, setAvailableTickets] = useState(''); // Changed to availableTickets
  const [eventType, setEventType] = useState(''); // Added eventType
  const [eventImage, setEventImage] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error, success } = useSelector((state) => state.events);

  useEffect(() => {
    if (success) {
      toast.success('Event created successfully!');
      dispatch(resetEventState());
      navigate('/admin');
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error, dispatch, navigate]);

  const handleImageChange = (file) => {
    setEventImage(file);
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!title || !description || !date || !location || price === '' || availableTickets === '') {
      toast.error('Please fill in all required fields');
      return;
    }
    if (price < 0 || availableTickets < 0) {
      toast.error('Price and tickets cannot be negative.');
      return;
    }


    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('date', date);
    formData.append('time', time); // Append time
    formData.append('location', location);
    formData.append('price', price); // Use price
    formData.append('availableTickets', availableTickets); // Use availableTickets
    formData.append('eventType', eventType); // Append eventType
    if (eventImage) {
      formData.append('eventImage', eventImage);
    }

    dispatch(createEvent(formData));
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h2>Create New Event</h2>
      {status === 'loading' && <Loader />}
      {error && <Message variant='danger'>{error}</Message>}
      <form onSubmit={submitHandler}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          ></textarea>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="date" style={{ display: 'block', marginBottom: '5px' }}>Date:</label>
          <input
            type="date" // Changed to date
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="time" style={{ display: 'block', marginBottom: '5px' }}>Time:</label>
          <input
            type="time" // Added time input
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="location" style={{ display: 'block', marginBottom: '5px' }}>Location:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="price" style={{ display: 'block', marginBottom: '5px' }}>Ticket Price (₹):</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            min="0"
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="availableTickets" style={{ display: 'block', marginBottom: '5px' }}>Available Tickets:</label>
          <input
            type="number"
            id="availableTickets"
            value={availableTickets}
            onChange={(e) => setAvailableTickets(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            min="1"
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="eventType" style={{ display: 'block', marginBottom: '5px' }}>Event Type:</label>
          <input
            type="text"
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            placeholder="e.g., Concert, Workshop, Sport"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <ImageUploader onImageChange={handleImageChange} />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1em',
            width: '100%'
          }}
        >
          {status === 'loading' ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

export default CreateEvent;