import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const CompetitionStatisticsPage = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [generalStats, setGeneralStats] = useState({
        total: 0,
        sexCounts: { MALE: 0, FEMALE: 0 }
    });
    const [roundsStats, setRoundsStats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // --- 1. General Stats (Keep existing robust logic) ---
                // Fetch total users to get the count
                const mainResponse = await api.get(`/competition/${id}`);
                const allUsers = mainResponse.data;

                // Fetch sex breakdown robustly (Status x Sex)
                const statuses = ['ALIVE', 'PASSED', 'ELIMINATED', 'TIMEOUT'];
                const sexes = ['MALE', 'FEMALE'];
                const sexTotals = { MALE: 0, FEMALE: 0 };

                const sexPromises = [];
                statuses.forEach(status => {
                    sexes.forEach(sex => {
                        const p = api.get(`/competition/${id}/${status}/${sex}`)
                            .then(res => {
                                sexTotals[sex] += res.data.length;
                            })
                            .catch(err => {
                                console.warn(`Failed to fetch ${status}/${sex}`, err);
                            });
                        sexPromises.push(p);
                    });
                });
                await Promise.all(sexPromises);

                setGeneralStats({
                    total: allUsers.length,
                    sexCounts: sexTotals
                });

                // --- 2. Round Stats (New Logic) ---
                // Fetch all rounds
                const roundsResponse = await api.get(`/round/${id}/rounds`);
                const rounds = roundsResponse.data;

                // For each round, fetch its users to calculate stats
                const roundsDataPromises = rounds.map(async (round) => {
                    try {
                        const usersResponse = await api.get(`/round/${round.id}`);
                        const roundUsers = usersResponse.data;

                        const stats = {
                            total: roundUsers.length,
                            PASSED: 0,
                            ELIMINATED: 0,
                            TIMEOUT: 0,
                            ALIVE: 0, // Assuming ALIVE might be a status in a round context too
                            OTHER: 0
                        };

                        roundUsers.forEach(u => {
                            if (stats.hasOwnProperty(u.status)) {
                                stats[u.status]++;
                            } else {
                                stats.OTHER++;
                            }
                        });

                        return {
                            ...round,
                            stats
                        };
                    } catch (err) {
                        console.error(`Error fetching users for round ${round.id}`, err);
                        return { ...round, stats: null };
                    }
                });

                const roundsWithStats = await Promise.all(roundsDataPromises);
                // Sort rounds by roundNumber if available, or id
                roundsWithStats.sort((a, b) => (a.roundNumber || a.id) - (b.roundNumber || b.id));
                setRoundsStats(roundsWithStats);

            } catch (err) {
                console.error("Error fetching statistics:", err);
                setError("Не вдалося завантажити статистику.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <div style={{ padding: '20px' }}>Завантаження статистики...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
            <Link to={`/competitions/${id}`}>{"<-- Назад до панелі керування"}</Link>
            <h1 style={{ marginTop: '20px', marginBottom: '30px' }}>Статистика Змагання #{id}</h1>

            {/* General Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={cardStyle}>
                    <h3>Всього Учасників</h3>
                    <p style={numberStyle}>{generalStats.total}</p>
                </div>

                <div style={cardStyle}>
                    <h3>Чоловіки / Жінки</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '2rem', color: '#3498db', fontWeight: 'bold' }}>{generalStats.sexCounts.MALE}</span>
                            <span>Male</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '2rem', color: '#e91e63', fontWeight: 'bold' }}>{generalStats.sexCounts.FEMALE}</span>
                            <span>Female</span>
                        </div>
                    </div>
                    {/* Visual Bar */}
                    {(generalStats.sexCounts.MALE > 0 || generalStats.sexCounts.FEMALE > 0) && (
                        <div style={{ marginTop: '15px', height: '10px', width: '100%', display: 'flex', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ width: `${(generalStats.sexCounts.MALE / (generalStats.sexCounts.MALE + generalStats.sexCounts.FEMALE)) * 100}%`, backgroundColor: '#3498db' }} />
                            <div style={{ width: `${(generalStats.sexCounts.FEMALE / (generalStats.sexCounts.MALE + generalStats.sexCounts.FEMALE)) * 100}%`, backgroundColor: '#e91e63' }} />
                        </div>
                    )}
                </div>
            </div>

            {/* Round Statistics Table */}
            <h3>Статистика по Раундах</h3>
            {roundsStats.length > 0 ? (
                <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', backgroundColor: 'white' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <th style={{ padding: '10px' }}>Раунд #</th>
                            <th style={{ padding: '10px' }}>Назва Гри</th>
                            <th style={{ padding: '10px' }}>Статус Раунду</th>
                            <th style={{ padding: '10px' }}>Учасників</th>
                            <th style={{ padding: '10px', color: 'green' }}>Passed</th>
                            <th style={{ padding: '10px', color: 'red' }}>Eliminated</th>
                            <th style={{ padding: '10px', color: 'orange' }}>Timeout</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roundsStats.map(round => (
                            <tr key={round.id}>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{round.roundNumber}</td>
                                <td style={{ padding: '10px' }}>{round.title || round.gameTitle || 'Game'}</td>
                                <td style={{ padding: '10px', textAlign: 'center' }}>{round.status}</td>
                                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                                    {round.stats ? round.stats.total : '-'}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'center', color: 'green' }}>
                                    {round.stats ? round.stats.PASSED : '-'}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'center', color: 'red' }}>
                                    {round.stats ? round.stats.ELIMINATED : '-'}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'center', color: 'orange' }}>
                                    {round.stats ? round.stats.TIMEOUT : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Раундів не знайдено.</p>
            )}
        </div>
    );
};

const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: '#fff'
};

const numberStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '10px 0'
};

export default CompetitionStatisticsPage;
