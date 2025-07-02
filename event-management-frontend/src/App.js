// src/App.js
import React, { useEffect, useState, createContext } from 'react'; // Removed useContext
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import Header from './components/Header';
import Footer from './components/Footer';
import { SOCKET_IO_SERVER_URL } from './utils/constants'; 

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import EventListPage from './pages/EventList';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import MyBookingsPage from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';

// Components/Protected Routes
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Create a Context for the Socket.IO instance
export const SocketContext = createContext(null);

function App() {
  const [socket, setSocket] = useState(null);
  const [loadingSocket, setLoadingSocket] = useState(true); // Still unused if block below is commented

  useEffect(() => {
    // Determine the backend URL for the Socket.IO connection
    // Use the constant imported from ./utils/constants
    const BACKEND_SOCKET_URL = SOCKET_IO_SERVER_URL; 

    console.log('Attempting to connect to Socket.IO at:', BACKEND_SOCKET_URL);

    const newSocket = io(BACKEND_SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO backend!');
      setLoadingSocket(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO backend.');
      setLoadingSocket(true);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
      setLoadingSocket(true);
    });

    setSocket(newSocket);

    // Cleanup function: Disconnect the socket when the component unmounts
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []); // Empty dependency array: runs once on mount

  // Optional: You can render a loading indicator here while the socket is connecting
  // If you uncomment this, the 'loadingSocket' warning will disappear.
   if (loadingSocket && !socket) {
     return <div>Connecting to real-time features...</div>;
   }

  return (
    <Router>
      {/* Provide the socket instance to all child components */}
      <SocketContext.Provider value={socket}>
        <Header />
        <main className='py-3'>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/events' element={<EventListPage />} />
            <Route path='/events/:id' element={<EventDetails />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path='/profile' element={<ProfilePage />} />
              <Route path='/my-bookings' element={<MyBookingsPage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<AdminRoute />}>
              <Route path='/admin' element={<AdminDashboard />} />
              <Route path='/admin/events/create' element={<CreateEvent />} />
              <Route path='/admin/events/:id/edit' element={<EditEvent />} />
            </Route>

            {/* Fallback for unknown routes */}
            <Route path='*' element={<h2>Page Not Found</h2>} />
          </Routes>
        </main>
        <Footer />
      </SocketContext.Provider>
    </Router>
  );
}

export default App;