// src/pages/Shared/Dashboard.jsx
import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext.jsx';

const Dashboard = () => {
    const {user, logout} = useAuth();
    const canManageStaff = ['HOST', 'FRONTMAN', 'MANAGER', 'THE_OFFICER'].includes(user?.role);
    const canManageCompetitions = ['HOST', 'FRONTMAN'].includes(user?.role);

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: 'auto'}}>
            <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>Вітаємо, {user?.email}!</h1>
                <button onClick={logout}>Вийти</button>
            </header>
            <p>Ваша роль: <strong>{user?.role}</strong></p>

            <main>
                <h2>Доступні дії:</h2>
                <nav style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {canManageCompetitions && (
                        <Link to="/competitions">Керування змаганнями</Link>
                    )}
                    {/* --- НОВЕ ПОСИЛАННЯ --- */}
                    {canManageStaff && (
                        <Link to="/staff">Керування персоналом</Link>
                    )}
                    {user?.role === 'PLAYER' && (
                        <Link to="/my-game">Мій статус у грі</Link>
                    )}
                </nav>
            </main>
        </div>
    );
};

export default Dashboard;