// src/pages/Host/CompetitionDetailPage.jsx
import React, {useState, useEffect, useCallback} from 'react';
import {useParams, Link} from 'react-router-dom';
import api from '../../services/api';

const CompetitionDetailPage = () => {
    const {id} = useParams(); // Отримуємо ID змагання з URL

    // Стан для всієї сторінки
    const [competition, setCompetition] = useState(null);
    const [players, setPlayers] = useState([]);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Функція для завантаження всіх даних ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            // 1. Отримуємо список гравців у змаганні
            const playersResponse = await api.get(`/competition/${id}`);
            setPlayers(playersResponse.data);

            // --- ПОТРІБЕН НОВИЙ ENDPOINT ---
            // 2. Отримуємо список ВІЛЬНИХ гравців, яких можна додати.
            // Цей endpoint має повертати гравців, які ще не беруть участь у жодній грі.
            // Якщо його немає, ця частина не працюватиме.
            try {
                const availablePlayersResponse = await api.get('/users?role=PLAYER&isAssigned=false');
                setAvailablePlayers(availablePlayersResponse.data);
            } catch (e) {
                console.warn("Не вдалося завантажити список вільних гравців. Створіть endpoint GET /api/users?role=PLAYER&isAssigned=false");
            }

            // Тут можна додати завантаження даних про раунди, загальну інформацію і т.д.
            // Для спрощення, поки що сфокусуємось на гравцях.

        } catch (err) {
            setError('Помилка завантаження даних змагання.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Обробники дій для гравців ---
    const handleAddPlayers = async () => {
        if (selectedPlayers.length === 0) return;
        try {
            await api.post('/assignment', {
                competitionId: id,
                playerIds: selectedPlayers,
            });
            // Оновлюємо дані після додавання
            fetchData();
            setSelectedPlayers([]);
        } catch (err) {
            alert('Помилка додавання гравців.');
            console.error(err);
        }
    };

    const handleRemovePlayer = async (playerId) => {
        if (!window.confirm(`Ви впевнені, що хочете видалити гравця ${playerId}?`)) return;
        try {
            // API вимагає body навіть для DELETE, що не є стандартним, але ми слідуємо документації
            await api.delete('/assignment', {
                data: {
                    competitionId: id,
                    playerIds: [playerId],
                }
            });
            // Оновлюємо дані
            fetchData();
        } catch (err) {
            alert('Помилка видалення гравця.');
            console.error(err);
        }
    };

    // --- Рендеринг компонента ---
    if (loading) return <div>Завантаження даних змагання...</div>;
    if (error) return <div style={{color: 'red'}}>{error}</div>;

    return (
        <div style={{padding: '20px', maxWidth: '1200px', margin: 'auto'}}>
            <Link to="/competitions">{"<-- Назад до списку змагань"}</Link>
            <h1 style={{marginTop: '20px'}}>Керування змаганням #{id}</h1>

            {/* Секція керування гравцями */}
            <div style={{border: '1px solid #ccc', padding: '20px', marginTop: '20px'}}>
                <h2>Гравці у змаганні ({players.length})</h2>
                <table border="1" style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Ім'я</th>
                        <th>Статус</th>
                        <th>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {players.length > 0 ? players.map(p => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.email}</td>
                            <td>{p.firstName} {p.lastName}</td>
                            <td>{p.status}</td>
                            <td>
                                <button onClick={() => handleRemovePlayer(p.id)} style={{color: 'red'}}>Видалити
                                </button>
                            </td>
                        </tr>
                    )) : <tr>
                        <td colSpan="5" style={{textAlign: 'center'}}>Гравців ще не додано.</td>
                    </tr>}
                    </tbody>
                </table>

                <hr style={{margin: '30px 0'}}/>

                <h3>Додати гравців</h3>
                <div style={{display: 'flex', gap: '10px'}}>
                    <select
                        multiple
                        value={selectedPlayers}
                        onChange={(e) => setSelectedPlayers(Array.from(e.target.selectedOptions, option => Number(option.value)))}
                        style={{width: '100%', minHeight: '150px'}}
                    >
                        {availablePlayers.length > 0
                            ? availablePlayers.map(p => <option key={p.id}
                                                                value={p.id}>{p.firstName} {p.lastName} ({p.email})</option>)
                            : <option disabled>Немає вільних гравців для додавання</option>
                        }
                    </select>
                    <button onClick={handleAddPlayers} style={{padding: '10px 20px', alignSelf: 'center'}}>Додати
                        обраних
                    </button>
                </div>
                <p><em>(Затисніть Ctrl/Cmd, щоб обрати декількох гравців)</em></p>
            </div>

            {/* Тут будуть секції для керування раундами та інше */}
        </div>
    );
};

export default CompetitionDetailPage;