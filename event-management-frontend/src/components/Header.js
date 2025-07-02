// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const logoutHandler = () => {
    dispatch(logout());
    dispatch(reset()); // Reset auth state
    toast.info('Logged out successfully!');
    navigate('/login');
  };

  return (
    <header style={{
      backgroundColor: '#007bff',
      color: 'white',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    }}>
      <Link to='/' style={{ color: 'white', textDecoration: 'none', fontSize: '1.5em', fontWeight: 'bold' }}>
        EventApp
      </Link>
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '20px' }}>
          <li>
            <Link to='/events' style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
              Events
            </Link>
          </li>
          {user ? (
            <>
              {user.role === 'admin' && (
                <li>
                  <Link to='/admin' style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <Link to='/my-bookings' style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to='/profile' style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
                  {user.name} (Profile)
                </Link>
              </li>
              <li>
                <button
                  onClick={logoutHandler}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: 'none',
                    fontSize: '1.1em',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to='/login' style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
                  Login
                </Link>
              </li>
              <li>
                <Link to='/register' style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;