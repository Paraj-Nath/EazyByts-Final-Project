// src/pages/AdminDashboard.js
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Event Slice imports
import {
  getEvents,
  deleteEvent,
  reset as resetEventState
} from '../features/events/eventSlice';

// Admin Slice imports
import {
  getAdminUsers,
  getSystemAnalytics, // Correctly imported from adminSlice
  deleteAdminUser,
  reset as resetAdminState
} from '../features/admin/adminSlice';

// Component imports
import Loader from '../components/Loader';
import Message from '../components/Message'; // Ensure this component exists

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  // Correctly destructuring 'events' (not 'allEvents')
  const { events, status: eventStatus, error: eventError } = useSelector((state) => state.events);
  const { users, analytics, status: adminStatus, error: adminError } = useSelector((state) => state.admin);

  useEffect(() => {
    // Redirect if not admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      toast.error('Unauthorized access');
    } else {
      // Fetch data for admin dashboard
      dispatch(getEvents());          // Fetches into 'events' state
      dispatch(getAdminUsers());
      dispatch(getSystemAnalytics()); // Fetches into 'analytics' state
    }

    return () => {
      dispatch(resetEventState()); // Clean up event state on unmount
      dispatch(resetAdminState()); // Clean up admin state on unmount
    };
  }, [dispatch, user, navigate]);

  const handleDeleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      dispatch(deleteEvent(id));
    }
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      dispatch(deleteAdminUser(id));
    }
  };

  // Determine overall loading and error states for display
  const isLoading = adminStatus === 'loading' || eventStatus === 'loading';
  const isError = adminError || eventError;


  return (
    <div style={{
      maxWidth: '1000px',
      margin: 'auto',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      marginTop: '32px', // py-8 equivalent
      marginBottom: '32px', // py-8 equivalent
      paddingLeft: '16px', // px-4 equivalent
      paddingRight: '16px', // px-4 equivalent
    }}>
      <h2 style={{
        fontSize: '2.5em', // text-4xl
        fontWeight: 'bold',
        color: '#1a202c', // gray-900
        marginBottom: '32px', // mb-8
        textAlign: 'center'
      }}>Admin Dashboard</h2>

      {isLoading && <Loader />}
      {isError && <Message variant='danger'>{adminError || eventError}</Message>}

      {/* Analytics Section */}
      {analytics && (
        <div style={{
          marginBottom: '48px', // mb-12
          padding: '24px', // p-6
          border: '1px solid #fef3c7', // border-yellow-200
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', // shadow-md
          backgroundColor: '#fffbeb', // bg-yellow-50
        }}>
          <h3 style={{
            fontSize: '1.875em', // text-3xl
            fontWeight: 'bold',
            color: '#92400e', // yellow-800
            marginBottom: '24px', // mb-6
          }}>System Analytics</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', // grid-cols-1 md:grid-cols-2 lg:grid-cols-4
            gap: '24px', // gap-6
            textAlign: 'center',
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '16px', // p-4
              borderRadius: '8px',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', // shadow-sm
            }}>
              <p style={{ color: '#4b5563' }}>Total Users</p>
              <p style={{ fontSize: '1.875em', fontWeight: 'bold', color: '#2563eb' }}>{analytics.totalUsers}</p>
            </div>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            }}>
              <p style={{ color: '#4b5563' }}>Total Events</p>
              <p style={{ fontSize: '1.875em', fontWeight: 'bold', color: '#16a34a' }}>{analytics.totalEvents}</p>
            </div>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            }}>
              <p style={{ color: '#4b5563' }}>Total Bookings</p>
              <p style={{ fontSize: '1.875em', fontWeight: 'bold', color: '#9333ea' }}>{analytics.totalBookings}</p>
            </div>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            }}>
              <p style={{ color: '#4b5563' }}>Total Revenue</p>
              <p style={{ fontSize: '1.875em', fontWeight: 'bold', color: '#d97706' }}>₹{analytics.totalRevenue ? analytics.totalRevenue.toFixed(2) : '0.00'}</p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // grid-cols-1 md:grid-cols-2
            gap: '24px', // gap-6
            marginTop: '32px', // mt-8
          }}>
            {/* Most Popular Events */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            }}>
              <h4 style={{ fontSize: '1.25em', fontWeight: 'bold', color: '#333' /* gray-800 */, marginBottom: '16px' }}>Most Popular Events</h4>
              {analytics.popularEvents && analytics.popularEvents.length === 0 ? (
                <p style={{ color: '#4b5563' }}>No popular events yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, /* space-y-2 */ }}>
                  {analytics.popularEvents && analytics.popularEvents.map((event) => (
                    <li key={event._id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: '#4b5563', /* gray-700 */
                      marginBottom: '8px', /* space-y-2 */
                    }}>
                      <span>{event.title} ({event.location})</span>
                      <span style={{ fontWeight: 'bold' }}>{event.totalTicketsBooked} tickets</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Bookings Per Event Type */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            }}>
              <h4 style={{ fontSize: '1.25em', fontWeight: 'bold', color: '#333' /* gray-800 */, marginBottom: '16px' }}>Bookings Per Event Type</h4>
              {analytics.bookingsPerEventType && analytics.bookingsPerEventType.length === 0 ? (
                <p style={{ color: '#4b5563' }}>No bookings by event type yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, /* space-y-2 */ }}>
                  {analytics.bookingsPerEventType && analytics.bookingsPerEventType.map((type) => (
                    <li key={type._id || 'null'} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: '#4b5563', /* gray-700 */
                      marginBottom: '8px', /* space-y-2 */
                    }}>
                      <span style={{ textTransform: 'capitalize' }}>{type._id || 'Uncategorized'}</span>
                      <span style={{ fontWeight: 'bold' }}>{type.count} bookings</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Users Section */}
      <div style={{
        marginBottom: '48px', // mb-12
        padding: '24px', // p-6
        border: '1px solid #bfdbfe', // border-blue-200
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', // shadow-md
        backgroundColor: '#eff6ff', // bg-blue-50
      }}>
        <h3 style={{
          fontSize: '1.875em', // text-3xl
          fontWeight: 'bold',
          color: '#1e40af', // blue-800
          marginBottom: '24px', // mb-6
        }}>All Users ({users ? users.length : 0})</h3>
        {users && users.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#4b5563' }}>No users found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              minWidth: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)', // shadow-md
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#2563eb', color: '#ffffff' }}> {/* bg-blue-600 text-white */}
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Registered On</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users && users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #e5e7eb', /* hover:bg-gray-50 */ }}>
                    <td style={{ padding: '12px 16px', color: '#374151', fontSize: '0.875em' }}>{u._id}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{u.name}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', textTransform: 'capitalize' }}>{u.role}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>
                      {/* Prevent admin from deleting themselves or other admins easily */}
                      {user && u._id !== user._id && u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          style={{
                            backgroundColor: '#ef4444', // bg-red-500
                            color: 'white',
                            fontWeight: 'bold',
                            padding: '4px 12px', // py-1 px-3
                            borderRadius: '4px', // rounded
                            fontSize: '0.875em', // text-sm
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'} // hover:bg-red-700
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                          disabled={adminStatus === 'loading'}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Events Section */}
      <div style={{
        marginBottom: '48px', // mb-12
        padding: '24px', // p-6
        border: '1px solid #dcfce7', // border-green-200
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', // shadow-md
        backgroundColor: '#f0fdf4', // bg-green-50
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px', // mb-6
        }}>
          {/* Changed 'allEvents' to 'events' */}
          <h3 style={{
            fontSize: '1.875em', // text-3xl
            fontWeight: 'bold',
            color: '#14532d', // green-800
          }}>All Events ({events ? events.length : 0})</h3>
          <Link
            to="/admin/events/create"
            style={{
              backgroundColor: '#16a34a', // bg-green-600
              color: 'white',
              fontWeight: 'bold',
              padding: '8px 16px', // py-2 px-4
              borderRadius: '4px', // rounded
              textDecoration: 'none',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'} // hover:bg-green-700
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
          >
            Create New Event
          </Link>
        </div>
        {/* Changed 'allEvents' to 'events' */}
        {events && events.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#4b5563' }}>No events found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              minWidth: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)', // shadow-md
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#16a34a', color: '#ffffff' }}> {/* bg-green-600 text-white */}
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Title</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Location</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Price</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Tickets Left</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Changed 'allEvents' to 'events' */}
                {events && events.map((event) => (
                  <tr key={event._id} style={{ borderBottom: '1px solid #e5e7eb', /* hover:bg-gray-50 */ }}>
                    <td style={{ padding: '12px 16px', color: '#374151', fontSize: '0.875em' }}>{event._id}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{event.title}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{new Date(event.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{event.location}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>₹{event.price}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{event.availableTickets}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', textTransform: 'capitalize' }}>{event.eventType}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>
                      <Link
                        to={`/admin/events/${event._id}/edit`}
                        style={{
                          color: '#3b82f6', // text-blue-500
                          textDecoration: 'none',
                          marginRight: '8px', // mr-2
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'} // hover:text-blue-700
                        onMouseOut={(e) => e.currentTarget.style.color = '#3b82f6'}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        style={{
                          backgroundColor: '#ef4444', // bg-red-500
                          color: 'white',
                          fontWeight: 'bold',
                          padding: '4px 12px', // py-1 px-3
                          borderRadius: '4px', // rounded
                          fontSize: '0.875em', // text-sm
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'} // hover:bg-red-700
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                        disabled={eventStatus === 'loading'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;