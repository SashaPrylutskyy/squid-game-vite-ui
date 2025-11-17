// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Завантаження...</div>;
  return user ? <Outlet /> : <Navigate to="/login" />;
};
export default ProtectedRoute;