import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';


const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { auth } = useContext(AuthContext);

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === '/') {
    return <Navigate to="/dashbaord" replace />;
  }

  return children;
};

export default ProtectedRoute;
