// src/components/RoleGuard.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const RoleGuard = ({ roles }) => {
  const { user } = useAuth();
  if (user && roles.includes(user.role)) {
    return <Outlet />;
  }
  return <Navigate to="/dashboard" />; 
};
export default RoleGuard;