// src/pages/Shared/Dashboard.jsx
import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext.jsx';

const Dashboard = () => {
    const {user, logout} = useAuth();

    // Визначаємо, які ролі мають доступ до яких розділів
    const canManageStaff = ['HOST', 'FRONTMAN', 'MANAGER', 'THE_OFFICER'].includes(user?.role);
    const canManageCompetitions = ['HOST', 'FRONTMAN'].includes(user?.role);
    const isPlayer = user?.role === 'PLAYER';
    const isWorker = user?.role === 'WORKER';
    const isSalesman = user?.role === 'SALESMAN';
    const isVip = user?.role === 'VIP';

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: 'auto'}}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ccc',
                paddingBottom: '10px'
            }}>
                <h1>Вітаємо, {user?.email}!</h1>
                <button onClick={logout} style={{padding: '8px 15px', cursor: 'pointer'}}>Вийти</button>
            </header>
            <p style={{marginTop: '20px'}}>Ваша роль: <strong>{user?.role}</strong></p>

            <main style={{marginTop: '30px'}}>
                <h2>Доступні дії:</h2>
                <nav style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    fontSize: '18px'
                }}>
                    {/* Показуємо посилання тільки якщо користувач має відповідну роль */}

                    {canManageCompetitions && (
                        <Link to="/competitions">Керування змаганнями</Link>
                    )}

                    {canManageStaff && (
                        <Link to="/staff">Керування персоналом</Link>
                    )}

                    {isPlayer && (
                        <Link to="/my-game">Мій статус у грі</Link>
                    )}

                    {isWorker && (
                        <Link to="/my-tasks">Мої завдання</Link>
                    )}

                    {isSalesman && (
                        <Link to="/referral">Мій реферальний код</Link>
                    )}

                    {isVip && (
                        <Link to="/invest">Зробити внесок</Link>
                    )}
                </nav>
            </main>
        </div>
    );
};

export default Dashboard;