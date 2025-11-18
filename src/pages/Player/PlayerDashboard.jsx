// src/pages/Player/PlayerDashboard.jsx
import React, {useState, useEffect, useCallback} from 'react';
import {Link} from 'react-router-dom';
import api from '../../services/api';

const PlayerDashboard = () => {
    const [playerStatus, setPlayerStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPlayerStatus = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // ===================================================================
            // УВАГА: ЦЕЙ ENDPOINT МАЄ ІСНУВАТИ НА БЕКЕНДІ
            // ===================================================================
            const response = await api.get('/users/player/status');
            setPlayerStatus(response.data);
        } catch (err) {
            console.error("Помилка завантаження статусу гравця:", err);
            const errorMessage = err.response?.data?.error || "Не вдалося завантажити ваш статус. Можливо, ви ще не в грі.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlayerStatus();
    }, [fetchPlayerStatus]);

    const handleVote = async (isQuit) => {
        const roundId = playerStatus?.currentRound?.id;
        if (!roundId) {
            alert("Не знайдено активного раунду для голосування.");
            return;
        }

        // Блокуємо кнопки, щоб уникнути подвійних натискань
        setLoading(true);
        try {
            // Використовуємо існуючий ендпоінт для голосування
            await api.post(`/voting/${roundId}/vote/${isQuit}`);
            alert("Ваш голос зараховано!");
            // Оновлюємо статус, щоб показати, що гравець проголосував
            fetchPlayerStatus();
        } catch (err) {
            console.error("Помилка голосування:", err);
            const errorMessage = err.response?.data?.error || "Не вдалося проголосувати.";
            alert(`Помилка: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !playerStatus) return <div>Завантаження вашого статусу...</div>;

    // Словник для красивого відображення статусів
    const statusStyles = {
        ALIVE: {color: 'green', text: 'Живий'},
        ELIMINATED: {color: 'red', text: 'Вибув'},
        WINNER: {color: 'gold', text: 'Переможець'},
        NOT_IN_GAME: {color: 'gray', text: 'Не в грі'}
    };

    const currentStatusKey = playerStatus?.statusInCompetition || 'NOT_IN_GAME';
    const displayStatus = statusStyles[currentStatusKey] || statusStyles.NOT_IN_GAME;

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: 'auto'}}>
            <Link to="/dashboard">{"<-- Назад на дашборд"}</Link>
            <h1 style={{marginTop: '20px'}}>Мій Статус у Грі</h1>

            {error && <p style={{color: 'red', border: '1px solid red', padding: '10px'}}>{error}</p>}

            {/* Показуємо контент тільки якщо немає глобальної помилки */}
            {!error && playerStatus && (
                <div>
                    {/* --- Блок загального статусу --- */}
                    <div style={{border: '1px solid #ccc', padding: '20px', marginBottom: '20px'}}>
                        <h2>Загальний Статус</h2>
                        <p>Змагання: <strong>{playerStatus.competition?.title || 'Ви не берете участі у змаганні'}</strong>
                        </p>
                        <p>Ваш статус: <strong
                            style={{color: displayStatus.color, fontSize: '1.2em'}}>{displayStatus.text}</strong></p>
                    </div>

                    {/* --- Блок поточного раунду --- */}
                    {playerStatus.currentRound && (
                        <div style={{border: '1px solid #ccc', padding: '20px', marginBottom: '20px'}}>
                            <h2>Поточний Раунд</h2>
                            <p>Гра: <strong>{playerStatus.currentRound.gameTitle}</strong></p>
                            <p>Статус раунду: <strong>{playerStatus.currentRound.status}</strong></p>
                        </div>
                    )}

                    {/* --- Блок голосування --- */}
                    {playerStatus.activeVote?.canVote && (
                        <div style={{
                            border: '2px solid #007bff',
                            padding: '20px',
                            borderRadius: '8px',
                            backgroundColor: '#f0f8ff'
                        }}>
                            <h2 style={{textAlign: 'center', marginTop: 0}}>Відкрито Голосування!</h2>
                            {playerStatus.activeVote.hasVoted ? (
                                <p style={{color: 'green', fontWeight: 'bold', textAlign: 'center'}}>Дякуємо, ви вже
                                    проголосували в цьому раунді.</p>
                            ) : (
                                <>
                                    <p style={{textAlign: 'center'}}>Ваша доля у ваших руках. Бажаєте продовжити гру чи
                                        покинути її?</p>
                                    <div style={{display: 'flex', gap: '20px', marginTop: '15px'}}>
                                        <button
                                            onClick={() => handleVote(false)}
                                            disabled={loading}
                                            style={{
                                                flex: 1,
                                                padding: '15px',
                                                cursor: 'pointer',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                fontSize: '16px'
                                            }}>
                                            {loading ? '...' : 'Продовжити Гру'}
                                        </button>
                                        <button
                                            onClick={() => handleVote(true)}
                                            disabled={loading}
                                            style={{
                                                flex: 1,
                                                padding: '15px',
                                                cursor: 'pointer',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                fontSize: '16px'
                                            }}>
                                            {loading ? '...' : 'Покинути Гру'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlayerDashboard;