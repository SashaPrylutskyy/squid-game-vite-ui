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
            // УВАГА: ЦЕЙ ENDPOINT ПОТРІБНО СТВОРИТИ НА БЕКЕНДІ
            // Без нього цей компонент не буде працювати коректно.
            // ===================================================================
            const response = await api.get('/users/player/status');
            setPlayerStatus(response.data);
        } catch (err) {
            console.error("Помилка завантаження статусу гравця:", err);
            const errorMessage = err.response?.data?.error || "Не вдалося завантажити ваш статус.";
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
        }
    };

    if (loading) return <div>Завантаження вашого статусу...</div>;

    const statusStyles = {
        ALIVE: {color: 'green', text: 'Живий'},
        ELIMINATED: {color: 'red', text: 'Вибув'},
        WINNER: {color: 'gold', text: 'Переможець'},
        NOT_IN_GAME: {color: 'gray', text: 'Не в грі'}
    };

    const currentStatus = playerStatus?.statusInCompetition || 'NOT_IN_GAME';
    const displayStatus = statusStyles[currentStatus] || statusStyles.NOT_IN_GAME;

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: 'auto'}}>
            <Link to="/dashboard">{"<-- Назад на дашборд"}</Link>
            <h1 style={{marginTop: '20px'}}>Мій Статус у Грі</h1>

            {error && <p style={{color: 'red', border: '1px solid red', padding: '10px'}}>{error}</p>}

            {!error && playerStatus && (
                <div>
                    {/* --- Блок загального статусу --- */}
                    <div style={{border: '1px solid #ccc', padding: '20px', marginBottom: '20px'}}>
                        <h2>Загальний Статус</h2>
                        <p>Змагання: <strong>{playerStatus.competition?.title || 'Ви не берете участі у змаганні'}</strong>
                        </p>
                        <p>Ваш статус: <strong style={{color: displayStatus.color}}>{displayStatus.text}</strong></p>
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
                        <div style={{border: '1px solid #007bff', padding: '20px', backgroundColor: '#f0f8ff'}}>
                            <h2>Голосування Відкрито!</h2>
                            {playerStatus.activeVote.hasVoted ? (
                                <p style={{color: 'green', fontWeight: 'bold'}}>Дякуємо, ви вже проголосували в цьому
                                    раунді.</p>
                            ) : (
                                <>
                                    <p>Бажаєте продовжити гру чи покинути її?</p>
                                    <div style={{display: 'flex', gap: '20px', marginTop: '15px'}}>
                                        <button onClick={() => handleVote(false)} style={{
                                            flex: 1,
                                            padding: '15px',
                                            cursor: 'pointer',
                                            backgroundColor: 'lightgreen',
                                            border: '1px solid green'
                                        }}>
                                            Продовжити Гру
                                        </button>
                                        <button onClick={() => handleVote(true)} style={{
                                            flex: 1,
                                            padding: '15px',
                                            cursor: 'pointer',
                                            backgroundColor: 'lightcoral',
                                            border: '1px solid red'
                                        }}>
                                            Покинути Гру
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