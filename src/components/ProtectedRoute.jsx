// components/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = []
}) => {
  const { isAuthenticated, getUserRole, loading } = useAuth();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Use effect to handle async authentication check
  useEffect(() => {
    const timer = setTimeout(() => {
      setCheckingAuth(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading spinner while checking authentication
  if (loading || checkingAuth) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        <CircularProgress size={60} sx={{ color: '#ff8c00' }} />
      </Box>
    );
  }

  // Check authentication
  const isAuth = isAuthenticated();
  
  // If not authenticated, redirect to login with return url
  if (!isAuth) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ from: location.pathname }}
      />
    );
  }

  // Get current user role
  const userRole = getUserRole();
  
  // If no role, redirect to login
  if (!userRole) {
    console.warn('User has no role assigned, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is allowed for this route
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.warn(`User role ${userRole} not allowed for this route`);
    
    // Redirect to dashboard (since all roles use the same dashboard)
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Higher-order component for role-based protection
export const withRoleProtection = (Component, allowedRoles = []) => {
  return (props) => (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

export default ProtectedRoute;