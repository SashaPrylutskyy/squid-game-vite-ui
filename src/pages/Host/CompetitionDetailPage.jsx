// src/pages/Host/CompetitionDetailPage.jsx
import React, {useState, useEffect, useCallback} from 'react';
import {useParams, Link} from 'react-router-dom';
import api from '../../services/api';

// --- Компонент для керування гравцями (без змін) ---
const PlayersManager = ({competitionId}) => {
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
            await api.post('/assignment', {competitionId: Number(competitionId), playerIds: selectedPlayers});
            fetchPlayersData();
            setSelectedPlayers([]);
        } catch (err) {
            alert('Помилка додавання гравців.');
        }
    };

    const handleRemovePlayer = async (playerId) => {
        if (!window.confirm(`Видалити гравця ${playerId}?`)) return;
        try {
            await api.delete('/assignment', {data: {competitionId: Number(competitionId), playerIds: [playerId]}});
            fetchPlayersData();
        } catch (err) {
            alert('Помилка видалення гравця.');
        }
    };

    if (loading) return <div>Завантаження гравців...</div>;

    return (
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
                            <button onClick={() => handleRemovePlayer(p.id)} style={{color: 'red'}}>Видалити</button>
                        </td>
                    </tr>
                )) : <tr>
                    <td colSpan="5" style={{textAlign: 'center'}}>Гравців не додано.</td>
                </tr>}
                </tbody>
            </table>
            <hr style={{margin: '30px 0'}}/>
            <h3>Додати гравців</h3>
            <div style={{display: 'flex', gap: '10px'}}>
                <select multiple value={selectedPlayers}
                        onChange={(e) => setSelectedPlayers(Array.from(e.target.selectedOptions, option => Number(option.value)))}
                        style={{width: '100%', minHeight: '150px'}}>
                    {availablePlayers.length > 0
                        ? availablePlayers.map(p => <option key={p.id}
                                                            value={p.id}>{p.firstName} {p.lastName} ({p.email})</option>)
                        : <option disabled>Немає вільних гравців</option>}
                </select>
                <button onClick={handleAddPlayers} style={{padding: '10px 20px', alignSelf: 'center'}}>Додати</button>
            </div>
        </div>
    );
};

// --- Компонент для керування раундами (без змін) ---
const RoundsManager = ({competitionId, onRoundsCreated}) => {
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
        <div style={{border: '1px solid #ccc', padding: '20px', marginTop: '20px'}}>
            <h3>Додати раунди (ігри)</h3>
            <div style={{display: 'flex', gap: '10px'}}>
                <select multiple value={selectedGames}
                        onChange={(e) => setSelectedGames(Array.from(e.target.selectedOptions, option => Number(option.value)))}
                        style={{width: '100%', minHeight: '150px'}}>
                    {allGames.map(g => <option key={g.id} value={g.id}>{g.gameTitle}</option>)}
                </select>
                <button onClick={handleCreateRounds} style={{padding: '10px 20px', alignSelf: 'center'}}>Створити
                    раунди
                </button>
            </div>
        </div>
    );
};


// --- Компонент Керування Ігровим Процесом (ОНОВЛЕНО) ---
const GameFlowManager = ({competitionId}) => {
    const [competitionStatus, setCompetitionStatus] = useState(null);
    const [rounds, setRounds] = useState([]);
    const [currentRound, setCurrentRound] = useState(null);
    const [nextRound, setNextRound] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const roundsResponse = await api.get(`/round/${competitionId}/rounds`);
            setRounds(roundsResponse.data);

            const currentRoundResponse = await api.get(`/round/${competitionId}/current_round`);
            setCurrentRound(currentRoundResponse.data);

            const nextRoundResponse = await api.get(`/round/${competitionId}/next_round`);
            setNextRound(nextRoundResponse.data);

        } catch (err) {
            console.warn("Помилка завантаження даних ігрового процесу:", err.message);
        } finally {
            setLoading(false);
        }
    }, [competitionId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStartCompetition = async () => { /* ... код без змін ... */
    };
    const handleStartNextRound = async () => { /* ... код без змін ... */
    };
    const handleEndCurrentRound = async () => { /* ... код без змін ... */
    };

    if (loading) return <div>Завантаження стану гри...</div>;

    return (
        <div style={{border: '1px solid #ccc', padding: '20px', marginTop: '20px', backgroundColor: '#f9f9f9'}}>
            <h2>Панель Керування Грою</h2>

            <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '20px'}}>
                <div>Статус змагання: <strong>{competitionStatus || 'PENDING'}</strong></div>
                <button onClick={handleStartCompetition}>Розпочати змагання</button>
            </div>

            <hr/>

            <h3>Список Раундів</h3>
            {rounds.length > 0 ? (
                <table border="1" style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                    <tr style={{backgroundColor: '#e9e9e9'}}>
                        <th style={{padding: '8px'}}>№</th>
                        <th style={{padding: '8px'}}>Назва Гри</th>
                        <th style={{padding: '8px'}}>Статус</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* --- ЗМІНИ ТУТ --- */}
                    {rounds.map((r, index) => ( // Додаємо index для нумерації
                        <tr key={r.id}>
                            <td style={{padding: '8px', textAlign: 'center'}}>{index + 1}</td>
                            {/* Використовуємо index + 1 */}
                            <td style={{padding: '8px'}}>{r.title}</td>
                            {/* Використовуємо прямий доступ до title */}
                            <td style={{padding: '8px'}}>{r.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : <p>Раундів ще не створено або не вдалося завантажити.</p>}

            <hr/>

            <h3>Керування Раундами</h3>
            <div style={{display: 'flex', justifyContent: 'space-between', gap: '15px'}}>
                <div style={{flex: 1}}>
                    <h4>Поточний раунд</h4>
                    {currentRound ? <p>Раунд #{currentRound.roundNumber} (Статус: {currentRound.status})</p> :
                        <p>Немає активного раунду.</p>}
                    <button onClick={handleEndCurrentRound} disabled={!currentRound}>Завершити поточний раунд</button>
                </div>
                <div style={{flex: 1}}>
                    <h4>Наступний раунд</h4>
                    {nextRound ? <p>Раунд #{nextRound.roundNumber}</p> : <p>Це останній раунд або раундів немає.</p>}
                    <button onClick={handleStartNextRound} disabled={!nextRound}>Розпочати наступний раунд</button>
                </div>
            </div>
        </div>
    );
};


// --- Основний компонент сторінки (без змін) ---
const CompetitionDetailPage = () => {
    const {id} = useParams();
    const [gameFlowKey, setGameFlowKey] = useState(Date.now());

    return (
        <div style={{padding: '20px', maxWidth: '1200px', margin: 'auto'}}>
            <Link to="/competitions">{"<-- Назад до списку змагань"}</Link>
            <h1 style={{marginTop: '20px'}}>Керування змаганням #{id}</h1>

            <GameFlowManager key={gameFlowKey} competitionId={id}/>
            <PlayersManager competitionId={id}/>
            <RoundsManager competitionId={id} onRoundsCreated={() => setGameFlowKey(Date.now())}/>
        </div>
    );
};

export default CompetitionDetailPage;