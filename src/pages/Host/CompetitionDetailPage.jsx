// src/pages/Host/CompetitionDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext.jsx';
import retroTheme from '../../styles/retroTheme';

// --- Shared Retro Components ---
const RetroSection = ({ title, children }) => (
    <div style={{ ...retroTheme.common.card, marginBottom: '20px' }}>
        <div style={{
            backgroundColor: retroTheme.colors.sectionHeaderBg,
            padding: '5px 10px',
            borderBottom: `1px solid ${retroTheme.colors.borderLight}`,
            fontWeight: 'bold',
            marginBottom: '15px',
            fontSize: retroTheme.fonts.size.large,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            {title}
        </div>
        <div style={{ padding: '10px' }}>
            {children}
        </div>
    </div>
);

const RetroButton = ({ onClick, disabled, children, variant = 'normal' }) => {
    let style = { ...retroTheme.common.button };
    if (variant === 'danger') {
        style = { ...style, color: 'red', borderColor: '#ffcccc', backgroundColor: '#fff5f5' };
    } else if (variant === 'primary') {
        style = { ...style, fontWeight: 'bold', border: '2px solid #999' };
    }

    if (disabled) {
        style = { ...style, opacity: 0.5, cursor: 'not-allowed' };
    }

    return (
        <button onClick={onClick} disabled={disabled} style={style}>
            {children}
        </button>
    );
};

// --- Players Manager ---
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
            console.error("Error loading players:", err);
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
            alert('Error adding players.');
        }
    };

    const handleRemovePlayer = async (playerId) => {
        if (!window.confirm(`Remove player ${playerId}?`)) return;
        try {
            await api.delete('/assignment', { data: { competitionId: Number(competitionId), playerIds: [playerId] } });
            fetchPlayersData();
        } catch (err) {
            alert('Error removing player.');
        }
    };

    if (loading) return <div>Loading player database...</div>;

    return (
        <RetroSection title={`PLAYER DATABASE (${players.length})`}>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: `1px solid ${retroTheme.colors.borderLight}`, marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: retroTheme.fonts.size.small }}>
                    <thead>
                        <tr style={{ backgroundColor: '#eee', position: 'sticky', top: 0 }}>
                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>EMAIL</th>
                            <th style={thStyle}>NAME</th>
                            <th style={thStyle}>STATUS</th>
                            <th style={thStyle}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.length > 0 ? players.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={tdStyle}>#{p.id}</td>
                                <td style={tdStyle}>{p.email}</td>
                                <td style={tdStyle}>{p.firstName} {p.lastName}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        color: p.status === 'ALIVE' ? 'green' : 'red',
                                        fontWeight: 'bold'
                                    }}>{p.status}</span>
                                </td>
                                <td style={tdStyle}>
                                    <RetroButton onClick={() => handleRemovePlayer(p.id)} variant="danger">EJECT</RetroButton>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No players registered.</td></tr>}
                    </tbody>
                </table>
            </div>

            <div style={{ backgroundColor: '#f9f9f9', padding: '10px', border: `1px solid ${retroTheme.colors.borderLight}` }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: retroTheme.fonts.size.small }}>ADD NEW PLAYERS</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select multiple value={selectedPlayers}
                        onChange={(e) => setSelectedPlayers(Array.from(e.target.selectedOptions, option => Number(option.value)))}
                        style={{ ...retroTheme.common.input, height: '100px', flex: 1 }}>
                        {availablePlayers.length > 0
                            ? availablePlayers.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.email})</option>)
                            : <option disabled>No available players found</option>}
                    </select>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <RetroButton onClick={handleAddPlayers} disabled={selectedPlayers.length === 0}>
                            &lt;&lt; ASSIGN
                        </RetroButton>
                    </div>
                </div>
            </div>
        </RetroSection>
    );
};

// --- Rounds Manager ---
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
                console.error("Error loading games:", err);
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
            alert('Rounds initialized successfully.');
            setSelectedGames([]);
            if (onRoundsCreated) onRoundsCreated();
        } catch (err) {
            alert('Error creating rounds.');
            console.error(err);
        }
    };

    if (loading) return <div>Loading game modules...</div>;

    return (
        <RetroSection title="ROUND CONFIGURATION">
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: retroTheme.fonts.size.small }}>AVAILABLE GAMES:</label>
                    <select multiple value={selectedGames}
                        onChange={(e) => setSelectedGames(Array.from(e.target.selectedOptions, option => Number(option.value)))}
                        style={{ ...retroTheme.common.input, height: '120px' }}>
                        {allGames.map(g => <option key={g.id} value={g.id}>{g.gameTitle}</option>)}
                    </select>
                </div>
                <div style={{ paddingTop: '20px' }}>
                    <RetroButton onClick={handleCreateRounds} disabled={selectedGames.length === 0}>
                        INITIALIZE ROUNDS &gt;&gt;
                    </RetroButton>
                </div>
            </div>
        </RetroSection>
    );
};

// --- Confirmation Manager ---
const ConfirmationManager = ({ round }) => {
    const [reportedPlayers, setReportedPlayers] = useState([]);
    const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchReportedPlayers = async () => {
        if (!round) return;
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/round_result/${round.id}/reported`);
            setReportedPlayers(response.data.players || []);
            setSelectedPlayerIds([]);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to load reports.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmation = async (valid) => {
        if (selectedPlayerIds.length === 0) {
            alert("Select players first.");
            return;
        }
        try {
            await api.patch('/round_result/confirmation', {
                valid,
                roundId: round.id,
                playerIds: selectedPlayerIds,
            });
            alert(`Action completed for ${selectedPlayerIds.length} players.`);
            fetchReportedPlayers();
        } catch (err) {
            alert(err.response?.data?.error || "Confirmation error.");
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedPlayerIds(reportedPlayers.map(p => p.id));
        } else {
            setSelectedPlayerIds([]);
        }
    };

    return (
        <div style={{ borderTop: `2px solid ${retroTheme.colors.border}`, marginTop: '15px', paddingTop: '15px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'blue' }}>:: WORKER REPORT VERIFICATION ::</div>
            <RetroButton onClick={fetchReportedPlayers} disabled={loading}>
                {loading ? "LOADING..." : "FETCH REPORTS"}
            </RetroButton>
            {error && <p style={{ color: 'red', fontSize: retroTheme.fonts.size.small }}>{error}</p>}

            {reportedPlayers.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: retroTheme.fonts.size.small, border: '1px solid #ccc' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#eee' }}>
                                <th style={thStyle}><input type="checkbox" onChange={handleSelectAll} /></th>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>EMAIL</th>
                                <th style={thStyle}>REPORTED STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportedPlayers.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedPlayerIds.includes(p.id)}
                                            onChange={() => {
                                                setSelectedPlayerIds(ids => ids.includes(p.id) ? ids.filter(id => id !== p.id) : [...ids, p.id]);
                                            }}
                                        />
                                    </td>
                                    <td style={tdStyle}>{p.id}</td>
                                    <td style={tdStyle}>{p.email}</td>
                                    <td style={{
                                        ...tdStyle,
                                        fontWeight: 'bold',
                                        color: p.status === 'PASSED' ? 'green' : 'red'
                                    }}>{p.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <RetroButton onClick={() => handleConfirmation(true)} disabled={selectedPlayerIds.length === 0}>
                            CONFIRM SELECTED
                        </RetroButton>
                        <RetroButton onClick={() => handleConfirmation(false)} disabled={selectedPlayerIds.length === 0} variant="danger">
                            REJECT SELECTED
                        </RetroButton>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Game Flow Manager ---
const GameFlowManager = ({ competitionId }) => {
    const { user } = useAuth();
    const [competitionStatus, setCompetitionStatus] = useState(null);
    const [rounds, setRounds] = useState([]);
    const [currentRound, setCurrentRound] = useState(null);
    const [nextRound, setNextRound] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
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
            console.warn("Error loading game flow:", err.message);
        } finally {
            setLoading(false);
        }
    }, [competitionId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStartCompetition = async () => {
        if (!window.confirm("Are you sure you want to START the competition?")) return;
        try {
            await api.patch(`/competition/${competitionId}/start`);
            alert('Competition STARTED.');
            fetchData();
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Unknown error.";
            alert(`Error: ${errorMessage}`);
        }
    };

    const handleStartNextRound = async () => {
        if (!window.confirm("Start next round?")) return;
        try {
            await api.patch(`/round/${competitionId}/next_round/start`);
            alert('Round STARTED.');
            fetchData();
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Unknown error.";
            alert(`Error: ${errorMessage}`);
        }
    };

    const handleEndCurrentRound = async () => {
        if (!window.confirm("End current round?")) return;
        try {
            await api.patch(`/round/${competitionId}/current_round/end`);
            alert('Round ENDED.');
            fetchData();
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Unknown error.";
            alert(`Error: ${errorMessage}`);
        }
    };

    if (loading) return <div>Loading system status...</div>;

    return (
        <RetroSection title="GAME CONTROL PANEL">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                backgroundColor: '#e3f2fd',
                padding: '10px',
                border: '1px solid #90caf9'
            }}>
                <div>SYSTEM STATUS: <strong style={{ color: competitionStatus === 'ACTIVE' ? 'green' : 'black' }}>{competitionStatus || 'PENDING'}</strong></div>
                <RetroButton onClick={handleStartCompetition} disabled={competitionStatus !== 'FUNDED'} variant="primary">
                    INITIATE COMPETITION
                </RetroButton>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: retroTheme.fonts.size.small }}>ROUND SEQUENCE:</div>
                {rounds.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: retroTheme.fonts.size.small, border: '1px solid #ccc' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#eee' }}>
                                <th style={thStyle}>#</th>
                                <th style={thStyle}>GAME TITLE</th>
                                <th style={thStyle}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>{rounds.map((r, index) => (<tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>{index + 1}</td>
                            <td style={tdStyle}>{r.title}</td>
                            <td style={tdStyle}>{r.status}</td>
                        </tr>))}</tbody>
                    </table>
                ) : <p style={{ color: '#777' }}>No rounds configured.</p>}
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1, border: '1px solid #ccc', padding: '10px', backgroundColor: '#fff' }}>
                    <h4 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '5px' }}>CURRENT ROUND</h4>
                    {currentRound ? (
                        <>
                            <p><strong>Round #{currentRound.roundNumber}</strong></p>
                            <p>Status: <span style={{ color: 'blue' }}>{currentRound.status}</span></p>
                            <RetroButton onClick={handleEndCurrentRound} disabled={!currentRound} variant="danger">
                                TERMINATE ROUND
                            </RetroButton>
                            {user.role === 'FRONTMAN' && <ConfirmationManager round={currentRound} />}
                        </>
                    ) : <p style={{ color: '#777' }}>No active round.</p>}
                </div>
                <div style={{ flex: 1, border: '1px solid #ccc', padding: '10px', backgroundColor: '#fff' }}>
                    <h4 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '5px' }}>NEXT ROUND</h4>
                    {nextRound ? (
                        <>
                            <p><strong>Round #{nextRound.roundNumber}</strong></p>
                            <RetroButton onClick={handleStartNextRound} disabled={!nextRound} variant="primary">
                                START ROUND
                            </RetroButton>
                        </>
                    ) : <p style={{ color: '#777' }}>Sequence complete or not initialized.</p>}
                </div>
            </div>
        </RetroSection>
    );
};

// --- Main Page ---
const CompetitionDetailPage = () => {
    const { id } = useParams();
    const [gameFlowKey, setGameFlowKey] = useState(Date.now());

    return (
        <div style={retroTheme.common.pageContainer}>
            <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <Link to="/competitions" style={retroTheme.common.link}>&lt;&lt; BACK TO LIST</Link>
                </div>

                <div style={{
                    backgroundColor: retroTheme.colors.headerBg,
                    border: `1px solid ${retroTheme.colors.border}`,
                    padding: '15px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: retroTheme.fonts.size.title }}>MAINFRAME CONTROL: COMPETITION #{id}</h1>
                        <div style={{ fontSize: retroTheme.fonts.size.small, color: retroTheme.colors.textLight }}>ACCESS LEVEL: HOST/FRONTMAN</div>
                    </div>
                    <Link to={`/competitions/${id}/statistics`} style={{ textDecoration: 'none' }}>
                        <RetroButton>VIEW STATISTICS &gt;&gt;</RetroButton>
                    </Link>
                </div>

                <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                    <GameFlowManager key={gameFlowKey} competitionId={id} />
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <PlayersManager competitionId={id} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <RoundsManager competitionId={id} onRoundsCreated={() => setGameFlowKey(Date.now())} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const thStyle = {
    padding: '5px',
    textAlign: 'left',
    fontSize: '10px',
    borderBottom: '1px solid #ccc'
};

const tdStyle = {
    padding: '5px',
    fontSize: '11px'
};

export default CompetitionDetailPage;