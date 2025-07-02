// src/components/admin/AdminRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AdminRoute() {
  const { user } = useSelector((state) => state.auth);

  // If user is logged in AND is an admin, render the child routes (Outlet)
  // Otherwise, redirect to login page (or a 403 forbidden page)
  return user && user.role === 'admin' ? <Outlet /> : <Navigate to='/login' replace />;
}

export default AdminRoute;