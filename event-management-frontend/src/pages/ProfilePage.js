// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, reset } from '../features/auth/authSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, status, error, success } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setName(user.name);
      setEmail(user.email);
      setInterests(user.interests || []);
    }

    if (success) {
      // Profile update successful, handled by authSlice extraReducers
      dispatch(reset());
    }
    if (error) {
      // toast.error(error); // Toast handled by authSlice
    }
  }, [user, navigate, success, error, dispatch]);

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    } else if (interests.includes(newInterest.trim())) {
      toast.info('Interest already added.');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setInterests(interests.filter((interest) => interest !== interestToRemove));
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const userData = {
      name,
      email,
      interests,
    };

    if (password) { // Only send password if user wants to change it
      userData.password = password;
    }

    dispatch(updateUserProfile(userData));
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h2>User Profile</h2>
      {status === 'loading' && <Loader />}
      {error && <Message variant='danger'>{error}</Message>}
      <form onSubmit={submitHandler}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Interests Section */}
        <div style={{ marginBottom: '15px', border: '1px dashed #ccc', padding: '15px', borderRadius: '8px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Your Interests:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            {interests.map((interest, index) => (
              <span key={index} style={{
                backgroundColor: '#e9ecef',
                padding: '5px 10px',
                borderRadius: '20px',
                fontSize: '0.9em',
                display: 'flex',
                alignItems: 'center'
              }}>
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#dc3545',
                    marginLeft: '5px',
                    cursor: 'pointer',
                    fontSize: '1.1em',
                    lineHeight: '1',
                    padding: '0 0 2px 0'
                  }}
                >&times;</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add new interest (e.g., Music, Tech)"
              style={{ flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button
              type="button"
              onClick={handleAddInterest}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '8px 15px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Add
            </button>
          </div>
        </div>

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
          {status === 'loading' ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;