// src/pages/Worker/WorkerDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import retroTheme from '../../styles/retroTheme';

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
            console.error("Error loading assignment:", err);
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("Unknown error loading tasks.");
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
                    player.id === playerId ? { ...player, reportedStatus: status } : player
                )
            }));
        } catch (err) {
            console.error(`Error reporting player ${playerId}:`, err);
            const errorMessage = err.response?.data?.error || "Failed to send report.";
            alert(errorMessage);
        }
    };

    if (loading) return <div style={{ padding: '20px', fontFamily: retroTheme.fonts.main }}>Loading tasks...</div>;

    return (
        <div style={retroTheme.common.pageContainer}>
            <div style={{ maxWidth: '1000px', margin: 'auto', padding: '20px' }}>
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
                    <h1 style={{ margin: 0, fontSize: retroTheme.fonts.size.title }}>WORKER ASSIGNMENTS</h1>
                </div>

                {error && (
                    <div style={{
                        border: '2px solid #856404',
                        backgroundColor: '#fff3cd',
                        padding: '15px',
                        color: '#856404',
                        fontFamily: retroTheme.fonts.main,
                        marginBottom: '20px'
                    }}>
                        <strong>NOTICE:</strong> {error}
                    </div>
                )}

                {!error && assignment?.currentRound && (
                    <div style={retroTheme.common.card}>
                        <div style={{
                            backgroundColor: retroTheme.colors.sectionHeaderBg,
                            padding: '10px',
                            borderBottom: `1px solid ${retroTheme.colors.borderLight}`,
                            fontWeight: 'bold'
                        }}>
                            ACTIVE DUTY: {assignment.currentRound.gameTitle} (ID: {assignment.currentRound.id})
                        </div>

                        <div style={{ padding: '20px' }}>
                            <h3 style={{
                                fontSize: retroTheme.fonts.size.large,
                                borderBottom: `2px solid ${retroTheme.colors.border}`,
                                paddingBottom: '5px',
                                marginBottom: '15px'
                            }}>
                                SURVEILLANCE LIST
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', border: `1px solid ${retroTheme.colors.border}` }}>
                                    <thead>
                                        <tr style={{ backgroundColor: retroTheme.colors.headerBg }}>
                                            <th style={{ padding: '10px', border: `1px solid ${retroTheme.colors.border}`, textAlign: 'left' }}>PLAYER ID</th>
                                            <th style={{ padding: '10px', border: `1px solid ${retroTheme.colors.border}`, textAlign: 'left' }}>NAME</th>
                                            <th style={{ padding: '10px', border: `1px solid ${retroTheme.colors.border}`, textAlign: 'left' }}>STATUS</th>
                                            <th style={{ padding: '10px', border: `1px solid ${retroTheme.colors.border}`, textAlign: 'center' }}>ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignment.playersToReport.map(player => (
                                            <tr key={player.id}>
                                                <td style={{ padding: '10px', border: `1px solid ${retroTheme.colors.borderLight}` }}>{player.id}</td>
                                                <td style={{ padding: '10px', border: `1px solid ${retroTheme.colors.borderLight}` }}>{player.firstName} {player.lastName}</td>
                                                <td style={{
                                                    padding: '10px',
                                                    border: `1px solid ${retroTheme.colors.borderLight}`,
                                                    fontWeight: 'bold',
                                                    color: player.reportedStatus === 'PASSED' ? 'green' : (player.reportedStatus === 'ELIMINATED' ? 'red' : 'black')
                                                }}>
                                                    {player.reportedStatus || 'PENDING'}
                                                </td>
                                                <td style={{ padding: '10px', border: `1px solid ${retroTheme.colors.borderLight}`, textAlign: 'center' }}>
                                                    {player.reportedStatus === null ? (
                                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                            <button onClick={() => handleReportStatus(player.id, 'PASSED')} style={{
                                                                backgroundColor: '#d4edda',
                                                                border: '1px solid #c3e6cb',
                                                                color: '#155724',
                                                                padding: '5px 10px',
                                                                cursor: 'pointer',
                                                                fontFamily: retroTheme.fonts.main,
                                                                fontWeight: 'bold'
                                                            }}>PASS
                                                            </button>
                                                            <button onClick={() => handleReportStatus(player.id, 'ELIMINATED')} style={{
                                                                backgroundColor: '#f8d7da',
                                                                border: '1px solid #f5c6cb',
                                                                color: '#721c24',
                                                                padding: '5px 10px',
                                                                cursor: 'pointer',
                                                                fontFamily: retroTheme.fonts.main,
                                                                fontWeight: 'bold'
                                                            }}>ELIMINATE
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: retroTheme.colors.textLight, fontStyle: 'italic' }}>REPORT FILED</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkerDashboard;