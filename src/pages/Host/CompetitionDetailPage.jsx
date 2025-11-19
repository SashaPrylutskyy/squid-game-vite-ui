// src/pages/Host/CompetitionDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext.jsx';

// --- Компонент для керування гравцями (Ваша робоча версія, без змін) ---
const PlayersManager = ({ competitionId }) => {
    const [players, setPlayers] = useState([]);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlayersData = useCallback(async () => {
        setLoading(true);
        try {
            const playersResponse = await api.get(`/competition/${competitionId}`);
            setPlayers(playersResponse.data);
            const availablePlayersResponse = await api.get('/users?role=PLAYER&isAssigned=false');
            setAvailablePlayers(availablePlayersResponse.data);
        } catch (err) {
            console.error("Помилка завантаження даних гравців:", err);
        } finally {
            setLoading(false);
        }
    }, [competitionId]);

    useEffect(() => {
        fetchPlayersData();
    }, [fetchPlayersData]);

    const handleAddPlayers = async () => {
        if (selectedPlayers.length === 0) return;
        try {
            await api.post('/assignment', { competitionId: Number(competitionId), playerIds: selectedPlayers });
            fetchPlayersData();
            setSelectedPlayers([]);
        } catch (err) {
            alert('Помилка додавання гравців.');
        }
    };

    const handleRemovePlayer = async (playerId) => {
        if (!window.confirm(`Видалити гравця ${playerId}?`)) return;
        try {
            await api.delete('/assignment', { data: { competitionId: Number(competitionId), playerIds: [playerId] } });
            fetchPlayersData();
        } catch (err) {
            alert('Помилка видалення гравця.');
        }
    };

    if (loading) return <div>Завантаження гравців...</div>;

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
            <h2>Гравці у змаганні ({players.length})</h2>
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                                <button onClick={() => handleRemovePlayer(p.id)} style={{ color: 'red' }}>Видалити</button>
                            </td>
                        </tr>
                    )) : <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>Гравців не додано.</td>
                    </tr>}
                </tbody>
            </table>
            <hr style={{ margin: '30px 0' }} />
            <h3>Додати гравців</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
                <select multiple value={selectedPlayers}
                    onChange={(e) => setSelectedPlayers(Array.from(e.target.selectedOptions, option => Number(option.value)))}
                    style={{ width: '100%', minHeight: '150px' }}>
                    {availablePlayers.length > 0
                        ? availablePlayers.map(p => <option key={p.id}
                            value={p.id}>{p.firstName} {p.lastName} ({p.email})</option>)
                        : <option disabled>Немає вільних гравців</option>}
                </select>
                <button onClick={handleAddPlayers} style={{ padding: '10px 20px', alignSelf: 'center' }}>Додати</button>
            </div>
        </div>
    );
};

// --- Компонент для керування раундами (Ваша робоча версія, без змін) ---
const RoundsManager = ({ competitionId, onRoundsCreated }) => {
    const [allGames, setAllGames] = useState([]);
    const [selectedGames, setSelectedGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGames = async () => {
            setLoading(true);
            try {
                const gamesResponse = await api.get('/game');
                setAllGames(gamesResponse.data);
            } catch (err) {
                console.error("Помилка завантаження ігор:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, []);

    const handleCreateRounds = async () => {
        if (selectedGames.length === 0) return;
        try {
            await api.post('/round', {
                competitionId: Number(competitionId),
                gameIds: selectedGames,
            });
            alert('Раунди успішно створено!');
            setSelectedGames([]);
            if (onRoundsCreated) onRoundsCreated();
        } catch (err) {
            alert('Помилка створення раундів');
            console.error(err);
        }
    };

    if (loading) return <div>Завантаження ігор...</div>;

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
            <h3>Додати раунди (ігри)</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
                <select multiple value={selectedGames}
                    onChange={(e) => setSelectedGames(Array.from(e.target.selectedOptions, option => Number(option.value)))}
                    style={{ width: '100%', minHeight: '150px' }}>
                    {allGames.map(g => <option key={g.id} value={g.id}>{g.gameTitle}</option>)}
                </select>
                <button onClick={handleCreateRounds} style={{ padding: '10px 20px', alignSelf: 'center' }}>Створити
                    раунди
                </button>
            </div>
        </div>
    );
};

// --- КОМПОНЕНТ ДЛЯ ПІДТВЕРДЖЕННЯ (ТЕПЕР З ПОВНОЮ ЛОГІКОЮ) ---
const ConfirmationManager = ({ round }) => {
    const [reportedPlayers, setReportedPlayers] = useState([]);
    const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Функція для завантаження звітів
    const fetchReportedPlayers = async () => {
        if (!round) return;
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/round_result/${round.id}/reported`);
            setReportedPlayers(response.data.players || []);
            setSelectedPlayerIds([]); // Скидаємо вибір
        } catch (err) {
            setError(err.response?.data?.error || "Не вдалося завантажити звіти.");
        } finally {
            setLoading(false);
        }
    };

    // Функція для підтвердження/відхилення
    const handleConfirmation = async (valid) => {
        if (selectedPlayerIds.length === 0) {
            alert("Оберіть гравців для дії.");
            return;
        }
        try {
            await api.patch('/round_result/confirmation', {
                valid,
                roundId: round.id,
                playerIds: selectedPlayerIds,
            });
            alert(`Дію для ${selectedPlayerIds.length} гравців виконано.`);
            fetchReportedPlayers(); // Оновлюємо список
        } catch (err) {
            alert(err.response?.data?.error || "Помилка підтвердження.");
        }
    };

    // Функція для вибору всіх гравців
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedPlayerIds(reportedPlayers.map(p => p.id));
        } else {
            setSelectedPlayerIds([]);
        }
    };

    return (
        <div style={{ borderTop: '2px solid blue', marginTop: '15px', paddingTop: '15px' }}>
            <h4>Підтвердження Результатів Раунду</h4>
            <button onClick={fetchReportedPlayers} disabled={loading}>
                {loading ? "Завантаження..." : "Переглянути звіти Працівників"}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {reportedPlayers.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                    <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center' }}><input type="checkbox" onChange={handleSelectAll} /></th>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Статус (від Worker)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportedPlayers.map(p => (
                                <tr key={p.id}>
                                    <td style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedPlayerIds.includes(p.id)}
                                            onChange={() => {
                                                setSelectedPlayerIds(ids => ids.includes(p.id) ? ids.filter(id => id !== p.id) : [...ids, p.id]);
                                            }}
                                        />
                                    </td>
                                    <td>{p.id}</td>
                                    <td>{p.email}</td>
                                    <td style={{
                                        fontWeight: 'bold',
                                        color: p.status === 'PASSED' ? 'green' : 'red'
                                    }}>{p.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleConfirmation(true)}
                            disabled={selectedPlayerIds.length === 0}>Підтвердити обраних
                        </button>
                        <button onClick={() => handleConfirmation(false)}
                            disabled={selectedPlayerIds.length === 0}>Відхилити обраних
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Компонент Керування Ігровим Процесом (ОНОВЛЕНО) ---
const GameFlowManager = ({ competitionId }) => {
    const { user } = useAuth();
    const [competitionStatus, setCompetitionStatus] = useState(null);
    const [rounds, setRounds] = useState([]);
    const [currentRound, setCurrentRound] = useState(null);
    const [nextRound, setNextRound] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        // Залишаємо цю функцію без змін, як у вашій робочій версії
        setLoading(true);
        try {
            // Завантажуємо статус змагання
            const competitionsResponse = await api.get('/competition');
            const thisComp = competitionsResponse.data.find(c => c.id == competitionId);
            if (thisComp) {
                setCompetitionStatus(thisComp.status);
            }
            const roundsResponse = await api.get(`/round/${competitionId}/rounds`);
            setRounds(roundsResponse.data);
            const nextRoundResponse = await api.get(`/round/${competitionId}/next_round`);
            setNextRound(nextRoundResponse.data);
            const currentRoundResponse = await api.get(`/round/${competitionId}/current_round`);
            setCurrentRound(currentRoundResponse.data);
        } catch (err) {
            console.warn("Помилка завантаження даних ігрового процесу:", err.message);
        } finally {
            setLoading(false);
        }
    }, [competitionId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- ОНОВЛЕНА РЕАЛІЗАЦІЯ ЛОГІКИ КНОПОК З TRY...CATCH ---
    const handleStartCompetition = async () => {
        if (!window.confirm("Ви впевнені, що хочете розпочати змагання?")) return;
        try {
            await api.patch(`/competition/${competitionId}/start`);
            alert('Змагання успішно розпочато!');
            fetchData();
        } catch (err) {
            console.error("Помилка старту змагання:", err);
            // Виводимо повідомлення з JSON-відповіді, якщо воно є
            const errorMessage = err.response?.data?.error || "Сталася невідома помилка.";
            alert(`Помилка: ${errorMessage}`);
        }
    };

    const handleStartNextRound = async () => {
        if (!window.confirm("Розпочати наступний раунд?")) return;
        try {
            await api.patch(`/round/${competitionId}/next_round/start`);
            alert('Наступний раунд розпочато!');
            fetchData();
        } catch (err) {
            console.error("Помилка старту раунду:", err);
            const errorMessage = err.response?.data?.error || "Сталася невідома помилка.";
            alert(`Помилка: ${errorMessage}`);
        }
    };

    const handleEndCurrentRound = async () => {
        if (!window.confirm("Завершити поточний раунд?")) return;
        try {
            await api.patch(`/round/${competitionId}/current_round/end`);
            alert('Поточний раунд завершено!');
            fetchData();
        } catch (err) {
            console.error("Помилка завершення раунду:", err);
            const errorMessage = err.response?.data?.error || "Сталася невідома помилка.";
            alert(`Помилка: ${errorMessage}`);
        }
    };

    if (loading) return <div>Завантаження стану гри...</div>;

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px', backgroundColor: '#f9f9f9' }}>
            <h2>Панель Керування Грою</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '20px' }}>
                <div>Статус змагання: <strong>{competitionStatus || 'PENDING'}</strong></div>
                <button onClick={handleStartCompetition} disabled={competitionStatus !== 'FUNDED'}>
                    Розпочати змагання
                </button>
            </div>
            <hr />
            <h3>Список Раундів</h3>
            {rounds.length > 0 ? (
                <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#e9e9e9' }}>
                            <th style={{ padding: '8px' }}>№</th>
                            <th style={{ padding: '8px' }}>Назва Гри</th>
                            <th style={{ padding: '8px' }}>Статус</th>
                        </tr>
                    </thead>
                    <tbody>{rounds.map((r, index) => (<tr key={r.id}>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ padding: '8px' }}>{r.title}</td>
                        <td style={{ padding: '8px' }}>{r.status}</td>
                    </tr>))}</tbody>
                </table>
            ) : <p>Раундів ще не створено або не вдалося завантажити.</p>}
            <hr />
            <h3>Керування Раундами</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                    <h4>Поточний раунд</h4>
                    {currentRound ? (
                        <>
                            <p>Раунд #{currentRound.roundNumber} (Статус: {currentRound.status})</p>
                            <button onClick={handleEndCurrentRound} disabled={!currentRound}>Завершити поточний раунд
                            </button>
                            {user.role === 'FRONTMAN' && <ConfirmationManager round={currentRound} />}
                        </>
                    ) : <p>Немає активного раунду.</p>}
                </div>
                <div style={{ flex: 1 }}>
                    <h4>Наступний раунд</h4>
                    {nextRound ? <p>Раунд #{nextRound.roundNumber}</p> : <p>Це останній раунд або раундів немає.</p>}
                    <button onClick={handleStartNextRound} disabled={!nextRound}>Розпочати наступний раунд</button>
                </div>
            </div>
        </div>
    );
};


// --- Основний компонент сторінки (Ваша робоча версія, без змін) ---
const CompetitionDetailPage = () => {
    const { id } = useParams();
    const [gameFlowKey, setGameFlowKey] = useState(Date.now());

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
            <Link to="/competitions">{"<-- Назад до списку змагань"}</Link>
            <h1 style={{ marginTop: '20px' }}>Керування змаганням #{id}</h1>
            <div style={{ marginBottom: '20px' }}>
                <Link to={`/competitions/${id}/statistics`} style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px'
                }}>
                    Переглянути Статистику
                </Link>
            </div>
            <GameFlowManager key={gameFlowKey} competitionId={id} />
            <PlayersManager competitionId={id} />
            <RoundsManager competitionId={id} onRoundsCreated={() => setGameFlowKey(Date.now())} />
        </div>
    );
};

export default CompetitionDetailPage;