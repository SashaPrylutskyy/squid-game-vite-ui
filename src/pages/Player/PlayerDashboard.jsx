// src/pages/Player/PlayerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
// ... (код такий самий, як у попередній відповіді, з попередженням про відсутній ендпоінт)
const PlayerDashboard = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlayerStatus = async () => {
            try {
                // ===================================================================
                // УВАГА: ЦЕЙ ENDPOINT ПОТРІБНО СТВОРИТИ НА БЕКЕНДІ
                // Зараз цей запит завершиться помилкою 404.
                // ===================================================================
                const response = await api.get('/player/status'); 
                setStatus(response.data);
            } catch (err) {
                setError('Не вдалося отримати статус гравця. Можливо, ви ще не в грі, або endpoint /api/player/status не створено.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerStatus();
    }, []);

    if (loading) return <div>Оновлення статусу...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <Link to="/dashboard">{"<-- Назад на дашборд"}</Link>
            <h1 style={{ marginTop: '20px' }}>Статус у Грі</h1>
            {error && <p style={{ color: 'orange', border: '1px solid orange', padding: '10px' }}>{error}</p>}
            
            {status ? (
                <div>
                    <h2>Змагання: {status.competition.title}</h2>
                    <p>Ваш статус: {status.statusInCompetition}</p>
                    <hr/>
                    <h3>Поточний раунд: {status.currentRound.gameTitle}</h3>
                    <p>Статус раунду: {status.currentRound.status}</p>
                </div>
            ) : (
                !error && <p>Інформація про вашу участь у грі відсутня.</p>
            )}
        </div>
    );
};

export default PlayerDashboard;