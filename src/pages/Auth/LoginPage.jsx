// src/pages/Auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
// ... (код такий самий, як у попередній відповіді)
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError('Неправильний email або пароль.');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px', marginTop: '100px' }}>
      <h1>Вхід в систему</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '10px 20px', cursor: 'pointer' }}>
          Увійти
        </button>
      </form>
    </div>
  );
};

export default LoginPage;