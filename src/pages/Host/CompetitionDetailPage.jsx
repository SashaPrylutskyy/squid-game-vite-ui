// src/pages/Host/CompetitionDetailPage.jsx
import React, {useState, useEffect, useCallback} from 'react';
import {useParams, Link} from 'react-router-dom';
import api from '../../services/api';

// --- Компонент для керування гравцями ---
const PlayersManager = ({competitionId}) => {
    const [players, setPlayers] = useState([]);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPlayersData = useCallback(async () => {
        setLoading(true);
        setError('');

        // Обгортаємо кожен запит в окремий try...catch, щоб ізолювати помилки
        try {
            const playersResponse = await api.get(`/competition/${competitionId}`);
            setPlayers(playersResponse.data);
        } catch (err) {
            console.error("Помилка завантаження гравців змагання:", err);
            setError('Не вдалося завантажити список гравців у змаганні.');
        }

        try {
            // ПОПЕРЕДЖЕННЯ: Цей ендпоінт має існувати на бекенді
            const availablePlayersResponse = await api.get('/users?role=PLAYER&isAssigned=false');
            setAvailablePlayers(availablePlayersResponse.data);
        } catch (err) {
            console.warn("Помилка завантаження вільних гравців. Створіть endpoint GET /api/users?role=PLAYER&isAssigned=false");
            // Не встановлюємо глобальну помилку, просто показуємо, що список порожній
        }

        setLoading(false);
    }, [competitionId]);

    useEffect(() => {
        fetchPlayersData();
    }, [fetchPlayersData]);

    const handleAddPlayers = async () => { /* ... код без змін ... */
    };
    const handleRemovePlayer = async (playerId) => { /* ... код без змін ... */
    };

    // ... решта коду компонента без змін ...

    // -- скопіюйте цей код з попередньої відповіді або залиште як є --
    return (
        <div style={{border: '1px solid #ccc', padding: '20px', marginTop: '20px'}}>
            <h2>Гравці у змаганні ({players.length})</h2>
            {loading && <p>Завантаження гравців...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
            {!loading && !error && (
                <>
                    <table border="1" style={{width: '100%', borderCollapse: 'collapse'}}>
                        {/* ... таблиця гравців ... */}
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
                                : <option disabled>Немає вільних гравців або помилка завантаження</option>}
                        </select>
                        <button onClick={handleAddPlayers} style={{padding: '10px 20px', alignSelf: 'center'}}>Додати
                        </button>
                    </div>
                </>
            )}
        </div>
    )
};


// --- Компонент для керування раундами ---
const RoundsManager = ({competitionId}) => {
    const [allGames, setAllGames] = useState([]);
    const [selectedGames, setSelectedGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchGamesData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const gamesResponse = await api.get('/game');
            setAllGames(gamesResponse.data);
        } catch (err) {
            console.error("Помилка завантаження даних ігор:", err);
            setError('Не вдалося завантажити список доступних ігор.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGamesData();
    }, [fetchGamesData]);

    // ... решта коду компонента без змін ...

    // -- скопіюйте цей код з попередньої відповіді або залиште як є --
    return (
        <div style={{border: '1px solid #ccc', padding: '20px', marginTop: '20px'}}>
            <h2>Раунди змагання</h2>
            {loading && <p>Завантаження ігор...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
            {!loading && !error && (
                <>
                    {/* ... таблиця створених раундів (буде додано пізніше) ... */}
                    <hr style={{margin: '30px 0'}}/>
                    <h3>Додати раунди (ігри)</h3>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <select multiple value={selectedGames}
                                onChange={(e) => setSelectedGames(Array.from(e.target.selectedOptions, option => Number(option.value)))}
                                style={{width: '100%', minHeight: '150px'}}>
                            {allGames.length > 0
                                ? allGames.map(g => <option key={g.id} value={g.id}>{g.gameTitle}</option>)
                                : <option disabled>Немає доступних ігор</option>
                            }
                        </select>
                        <button style={{padding: '10px 20px', alignSelf: 'center'}}>Створити раунди</button>
                    </div>
                </>
            )}
        </div>
    );
};


// --- Основний компонент сторінки (без змін) ---
const CompetitionDetailPage = () => {
    const {id} = useParams();

    return (
        <div style={{padding: '20px', maxWidth: '1200px', margin: 'auto'}}>
            <Link to="/competitions">{"<-- Назад до списку змагань"}</Link>
            <h1 style={{marginTop: '20px'}}>Керування змаганням #{id}</h1>

            <PlayersManager competitionId={id}/>
            <RoundsManager competitionId={id}/>
        </div>
    );
};

export default CompetitionDetailPage;