import React from 'react';
import { Navigate } from 'react-router-dom';

// This component will check for the role stored in localStorage and navigate accordingly
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Assuming the role is stored in localStorage after login

  if (!token) {
    return <Navigate to="/login" replace />; // Redirect to login if no token is found
  }

  // Redirect user if role doesn't match
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
