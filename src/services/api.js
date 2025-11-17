// src/services/api.js
import axios from 'axios';

const api = axios.create({
  // Vite отримує доступ до змінних оточення через import.meta.env
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      // Перезавантажуємо сторінку, щоб AuthContext оновився
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;