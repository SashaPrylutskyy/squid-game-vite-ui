// src/pages/Player/PlayerDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import retroTheme from '../../styles/retroTheme';

const PlayerDashboard = () => {
    const [playerStatus, setPlayerStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPlayerStatus = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/users/player/status');
            setPlayerStatus(response.data);
        } catch (err) {
            console.error("Error loading player status:", err);
            const errorMessage = err.response?.data?.error || "Failed to load status. You may not be in a game.";
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
            alert("No active round found for voting.");
            return;
        }

        setLoading(true);
        try {
            await api.post(`/voting/${roundId}/vote/${isQuit}`);
            alert("Vote registered successfully.");
            fetchPlayerStatus();
        } catch (err) {
            console.error("Voting error:", err);
            const errorMessage = err.response?.data?.error || "Failed to register vote.";
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !playerStatus) return <div style={{ padding: '20px', fontFamily: retroTheme.fonts.main }}>Loading player interface...</div>;

    // Status styles
    const statusStyles = {
        ALIVE: { color: 'green', text: 'ACTIVE' },
        ELIMINATED: { color: 'red', text: 'ELIMINATED' },
        WINNER: { color: '#b38f00', text: 'VICTOR' },
        NOT_IN_GAME: { color: 'gray', text: 'INACTIVE' }
    };

    const currentStatusKey = playerStatus?.statusInCompetition || 'NOT_IN_GAME';
    const displayStatus = statusStyles[currentStatusKey] || statusStyles.NOT_IN_GAME;

    return (
        <div style={retroTheme.common.pageContainer}>
            <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <Link to="/dashboard" style={retroTheme.common.link}>&lt;&lt; BACK TO DASHBOARD</Link>
                </div>

                <div style={{
                    backgroundColor: retroTheme.colors.headerBg,
                    border: `1px solid ${retroTheme.colors.border}`,
                    padding: '15px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <h1 style={{ margin: 0, fontSize: retroTheme.fonts.size.title }}>PLAYER TERMINAL</h1>
                    <div style={{ fontSize: retroTheme.fonts.size.small, color: retroTheme.colors.textLight }}>ID: {playerStatus?.id || 'UNKNOWN'}</div>
                </div>

                {error && (
                    <div style={{
                        border: '2px solid red',
                        backgroundColor: '#ffeeee',
                        padding: '15px',
                        marginBottom: '20px',
                        color: 'red',
                        fontFamily: retroTheme.fonts.main
                    }}>
                        <strong>SYSTEM ERROR:</strong> {error}
                    </div>
                )}

                {!error && playerStatus && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Status Card */}
                        <div style={retroTheme.common.card}>
                            <div style={{
                                backgroundColor: retroTheme.colors.sectionHeaderBg,
                                padding: '5px 10px',
                                borderBottom: `1px solid ${retroTheme.colors.borderLight}`,
                                fontWeight: 'bold'
                            }}>
                                STATUS REPORT
                            </div>
                            <div style={{ padding: '15px' }}>
                                <div style={{ marginBottom: '10px' }}>
                                    <span style={{ fontWeight: 'bold' }}>COMPETITION:</span> {playerStatus.competition?.title || 'N/A'}
                                </div>
                                <div>
                                    <span style={{ fontWeight: 'bold' }}>CURRENT STATUS:</span>
                                    <span style={{
                                        marginLeft: '10px',
                                        fontWeight: 'bold',
                                        fontSize: retroTheme.fonts.size.large,
                                        color: displayStatus.color,
                                        border: `1px solid ${displayStatus.color}`,
                                        padding: '2px 8px',
                                        backgroundColor: '#fff'
                                    }}>
                                        {displayStatus.text}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Round Card */}
                        {playerStatus.currentRound && (
                            <div style={retroTheme.common.card}>
                                <div style={{
                                    backgroundColor: retroTheme.colors.sectionHeaderBg,
                                    padding: '5px 10px',
                                    borderBottom: `1px solid ${retroTheme.colors.borderLight}`,
                                    fontWeight: 'bold'
                                }}>
                                    CURRENT ROUND PROTOCOL
                                </div>
                                <div style={{ padding: '15px' }}>
                                    <div style={{ fontSize: retroTheme.fonts.size.large, marginBottom: '5px' }}>
                                        {playerStatus.currentRound.gameTitle}
                                    </div>
                                    <div style={{ color: retroTheme.colors.textLight }}>
                                        STATUS: {playerStatus.currentRound.status}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Voting Card */}
                        {playerStatus.activeVote?.canVote && (
                            <div style={{
                                border: '3px double #000',
                                backgroundColor: '#e6f7ff',
                                padding: '5px'
                            }}>
                                <div style={{
                                    border: '1px solid #007bff',
                                    padding: '15px',
                                    backgroundColor: '#fff'
                                }}>
                                    <h2 style={{
                                        marginTop: 0,
                                        textAlign: 'center',
                                        color: '#0056b3',
                                        borderBottom: '1px solid #007bff',
                                        paddingBottom: '10px'
                                    }}>
                                        VOTING SESSION ACTIVE
                                    </h2>

                                    {playerStatus.activeVote.hasVoted ? (
                                        <div style={{ textAlign: 'center', padding: '20px', color: 'green', fontWeight: 'bold' }}>
                                            VOTE REGISTERED. AWAITING RESULTS.
                                        </div>
                                    ) : (
                                        <>
                                            <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                                                DECISION REQUIRED: Do you wish to continue participation?
                                            </p>
                                            <div style={{ display: 'flex', gap: '20px' }}>
                                                <button
                                                    onClick={() => handleVote(false)}
                                                    disabled={loading}
                                                    style={{
                                                        flex: 1,
                                                        padding: '15px',
                                                        cursor: 'pointer',
                                                        backgroundColor: '#d4edda',
                                                        color: '#155724',
                                                        border: '2px solid #c3e6cb',
                                                        fontWeight: 'bold',
                                                        fontFamily: retroTheme.fonts.main
                                                    }}>
                                                    {loading ? 'PROCESSING...' : '[ CONTINUE ]'}
                                                </button>
                                                <button
                                                    onClick={() => handleVote(true)}
                                                    disabled={loading}
                                                    style={{
                                                        flex: 1,
                                                        padding: '15px',
                                                        cursor: 'pointer',
                                                        backgroundColor: '#f8d7da',
                                                        color: '#721c24',
                                                        border: '2px solid #f5c6cb',
                                                        fontWeight: 'bold',
                                                        fontFamily: retroTheme.fonts.main
                                                    }}>
                                                    {loading ? 'PROCESSING...' : '[ QUIT ]'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerDashboard;