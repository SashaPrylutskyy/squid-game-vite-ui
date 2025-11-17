// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setUser({
            email: decodedToken.sub,
            role: decodedToken.role.replace('ROLE_', ''),
            id: decodedToken.userId,
          });
        } else {
          localStorage.removeItem('jwt_token');
        }
      }
    } catch (error) {
        console.error("Помилка декодування токена:", error);
        localStorage.removeItem('jwt_token');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('jwt_token', token);
    const decodedToken = jwtDecode(token);
    setUser({
      email: decodedToken.sub,
      role: decodedToken.role.replace('ROLE_', ''),
      id: decodedToken.userId,
    });
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    window.location.href = '/login';
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};