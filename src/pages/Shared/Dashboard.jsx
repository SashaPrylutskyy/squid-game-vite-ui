// src/pages/Shared/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
// ... (код такий самий, як у попередній відповіді)
const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Вітаємо, {user?.email}!</h1>
        <button onClick={logout}>Вийти</button>
      </header>
      <p>Ваша роль: <strong>{user?.role}</strong></p>
      
      <main>
        <h2>Доступні дії:</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(user?.role === 'HOST' || user?.role === 'FRONTMAN') && (
            <Link to="/competitions">Керування змаганнями</Link>
          )}
          {user?.role === 'PLAYER' && (
            <Link to="/my-game">Мій статус у грі</Link>
          )}
          {/* Додайте інші посилання для інших ролей тут */}
        </nav>
      </main>
    </div>
  );
};

export default Dashboard;