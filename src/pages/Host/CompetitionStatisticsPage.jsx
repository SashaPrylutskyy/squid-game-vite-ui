import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const CompetitionStatisticsPage = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        statusCounts: {
            ALIVE: 0,
            PASSED: 0,
            ELIMINATED: 0,
            TIMEOUT: 0
        },
        sexCounts: {
            MALE: 0,
            FEMALE: 0
        },
        detailedMatrix: {}
    });

    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            try {
                // 1. Fetch total users and status breakdown (base source of truth for totals)
                const mainResponse = await api.get(`/competition/${id}`);
                const allUsers = mainResponse.data;

                const statusCounts = {
                    ALIVE: 0,
                    PASSED: 0,
                    ELIMINATED: 0,
                    TIMEOUT: 0
                };

                allUsers.forEach(u => {
                    if (statusCounts.hasOwnProperty(u.status)) {
                        statusCounts[u.status]++;
                    }
                });

                // 2. Fetch detailed breakdown by Sex for each Status
                // We have to make separate calls because the main endpoint might not return 'sex'
                const statuses = ['ALIVE', 'PASSED', 'ELIMINATED', 'TIMEOUT'];
                const sexes = ['MALE', 'FEMALE'];

                const matrix = {};
                const sexTotals = { MALE: 0, FEMALE: 0 };

                // Create an array of promises to fetch all combinations in parallel
                const promises = [];

                statuses.forEach(status => {
                    matrix[status] = { MALE: 0, FEMALE: 0 };
                    sexes.forEach(sex => {
                        const p = api.get(`/competition/${id}/${status}/${sex}`)
                            .then(res => {
                                const count = res.data.length;
                                matrix[status][sex] = count;
                                sexTotals[sex] += count;
                            })
                            .catch(err => {
                                // If 404 or empty, just assume 0
                                console.warn(`Failed to fetch ${status}/${sex}`, err);
                                matrix[status][sex] = 0;
                            });
                        promises.push(p);
                    });
                });

                await Promise.all(promises);

                setStats({
                    total: allUsers.length,
                    statusCounts,
                    sexCounts: sexTotals,
                    detailedMatrix: matrix
                });

            } catch (err) {
                console.error("Error fetching competition statistics:", err);
                setError("Не вдалося завантажити статистику змагання.");
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [id]);

    if (loading) return <div style={{ padding: '20px' }}>Завантаження статистики...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

    const getPercent = (val, total) => total > 0 ? ((val / total) * 100).toFixed(1) + '%' : '0%';

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
            <Link to={`/competitions/${id}`}>{"<-- Назад до панелі керування"}</Link>
            <h1 style={{ marginTop: '20px', marginBottom: '30px' }}>Статистика Змагання #{id}</h1>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={cardStyle}>
                    <h3>Всього Учасників</h3>
                    <p style={numberStyle}>{stats.total}</p>
                </div>

                <div style={cardStyle}>
                    <h3>Чоловіки / Жінки</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '2rem', color: '#3498db', fontWeight: 'bold' }}>{stats.sexCounts.MALE}</span>
                            <span>Male</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '2rem', color: '#e91e63', fontWeight: 'bold' }}>{stats.sexCounts.FEMALE}</span>
                            <span>Female</span>
                        </div>
                    </div>
                    {/* Visual Bar */}
                    {(stats.sexCounts.MALE > 0 || stats.sexCounts.FEMALE > 0) && (
                        <div style={{ marginTop: '15px', height: '10px', width: '100%', display: 'flex', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ width: `${(stats.sexCounts.MALE / (stats.sexCounts.MALE + stats.sexCounts.FEMALE)) * 100}%`, backgroundColor: '#3498db' }} />
                            <div style={{ width: `${(stats.sexCounts.FEMALE / (stats.sexCounts.MALE + stats.sexCounts.FEMALE)) * 100}%`, backgroundColor: '#e91e63' }} />
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Table */}
            <h3>Детальна Статистика</h3>
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', backgroundColor: 'white' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Статус</th>
                        <th style={{ padding: '10px', textAlign: 'center', color: '#3498db' }}>Чоловіки</th>
                        <th style={{ padding: '10px', textAlign: 'center', color: '#e91e63' }}>Жінки</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Всього</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(stats.statusCounts).map(status => (
                        <tr key={status}>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{status}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                {stats.detailedMatrix[status]?.MALE || 0}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                                {stats.detailedMatrix[status]?.FEMALE || 0}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                                {stats.statusCounts[status]}
                            </td>
                        </tr>
                    ))}
                    <tr style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                        <td style={{ padding: '10px' }}>ВСЬОГО</td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#3498db' }}>{stats.sexCounts.MALE}</td>
                        <td style={{ padding: '10px', textAlign: 'center', color: '#e91e63' }}>{stats.sexCounts.FEMALE}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>{stats.total}</td>
                    </tr>
                </tbody>
            </table>
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
