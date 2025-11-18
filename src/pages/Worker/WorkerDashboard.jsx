// src/pages/Worker/WorkerDashboard.jsx
import React, {useState, useEffect, useCallback} from 'react';
import {Link} from 'react-router-dom';
import api from '../../services/api';

const WorkerDashboard = () => {
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAssignment = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/users/worker/assignment');
            setAssignment(response.data);
        } catch (err) {
            // --- ОНОВЛЕНА ЛОГІКА ОБРОБКИ ПОМИЛОК ---
            console.error("Помилка завантаження завдання:", err);

            // Тепер ми можемо безпечно читати повідомлення з тіла відповіді
            if (err.response && err.response.data && err.response.data.error) {
                // Встановлюємо в стан саме те повідомлення, яке прийшло з бекенду
                setError(err.response.data.error);
            } else {
                // Якщо відповідь прийшла в невідомому форматі
                setError("Сталася невідома помилка при завантаженні завдань.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignment();
    }, [fetchAssignment]);

    const handleReportStatus = async (playerId, status) => {
        const roundId = assignment?.currentRound?.id;
        if (!roundId) return;

        try {
            await api.post(`/round_result/${roundId}/${playerId}/${status}`);
            setAssignment(prevAssignment => ({
                ...prevAssignment,
                playersToReport: prevAssignment.playersToReport.map(player =>
                    player.id === playerId ? {...player, reportedStatus: status} : player
                )
            }));
        } catch (err) {
            console.error(`Помилка при звітуванні про гравця ${playerId}:`, err);
            // Показуємо користувачеві помилку, якщо вона є
            const errorMessage = err.response?.data?.error || "Не вдалося відправити звіт.";
            alert(errorMessage);
        }
    };

    if (loading) return <div>Завантаження завдань...</div>;

    return (
        <div style={{padding: '20px', maxWidth: '1000px', margin: 'auto'}}>
            <Link to="/dashboard">{"<-- Назад на дашборд"}</Link>
            <h1 style={{marginTop: '20px'}}>Мої Завдання</h1>

            {error && (
                <p style={{
                    color: '#856404',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeeba',
                    borderRadius: '5px',
                    padding: '15px'
                }}>
                    {/* Тут буде відображено ваше повідомлення, наприклад, "There is no active round yet." */}
                    {error}
                </p>
            )}

            {!error && assignment?.currentRound && (
                <div style={{border: '1px solid #ccc', padding: '20px'}}>
                    <h2>Раунд: {assignment.currentRound.gameTitle}</h2>
                    <p>ID Раунду: {assignment.currentRound.id}</p>

                    <h3 style={{marginTop: '30px'}}>Список Гравців для Звітування</h3>
                    <table border="1" style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                        <tr style={{backgroundColor: '#f2f2f2'}}>
                            <th style={{padding: '10px'}}>ID Гравця</th>
                            <th style={{padding: '10px'}}>Ім'я</th>
                            <th style={{padding: '10px'}}>Статус</th>
                            <th style={{padding: '10px'}}>Дії</th>
                        </tr>
                        </thead>
                        <tbody>
                        {assignment.playersToReport.map(player => (
                            <tr key={player.id}>
                                <td style={{padding: '10px'}}>{player.id}</td>
                                <td style={{padding: '10px'}}>{player.firstName} {player.lastName}</td>
                                <td style={{
                                    padding: '10px',
                                    fontWeight: 'bold',
                                    color: player.reportedStatus === 'PASSED' ? 'green' : (player.reportedStatus === 'ELIMINATED' ? 'red' : 'black')
                                }}>
                                    {player.reportedStatus || 'Очікує звіту'}
                                </td>
                                <td style={{padding: '10px', display: 'flex', gap: '10px', justifyContent: 'center'}}>
                                    {player.reportedStatus === null ? (
                                        <>
                                            <button onClick={() => handleReportStatus(player.id, 'PASSED')} style={{
                                                backgroundColor: 'lightgreen',
                                                border: '1px solid green',
                                                padding: '5px 10px',
                                                cursor: 'pointer'
                                            }}>Пройшов
                                            </button>
                                            <button onClick={() => handleReportStatus(player.id, 'ELIMINATED')} style={{
                                                backgroundColor: 'lightcoral',
                                                border: '1px solid red',
                                                padding: '5px 10px',
                                                cursor: 'pointer'
                                            }}>Вибув
                                            </button>
                                        </>
                                    ) : (
                                        <span>Звіт надіслано</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default WorkerDashboard;