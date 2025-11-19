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
                // --- 1. General Stats ---
                const mainResponse = await api.get(`/competition/${id}`);
                const allUsers = mainResponse.data;

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

                // --- 2. Round Stats ---
                const roundsResponse = await api.get(`/round/${id}/rounds`);
                const rounds = roundsResponse.data;

                const roundsDataPromises = rounds.map(async (round) => {
                    try {
                        const usersResponse = await api.get(`/round/${round.id}`);
                        const roundUsers = usersResponse.data;

                        const stats = {
                            total: roundUsers.length,
                            PASSED: 0,
                            ELIMINATED: 0,
                            TIMEOUT: 0,
                            ALIVE: 0,
                            OTHER: 0
                        };

                        roundUsers.forEach(u => {
                            if (stats.hasOwnProperty(u.status)) {
                                stats[u.status]++;
                            } else {
                                stats.OTHER++;
                            }
                        });

                        return { ...round, stats };
                    } catch (err) {
                        console.error(`Error fetching users for round ${round.id}`, err);
                        return { ...round, stats: null };
                    }
                });

                const roundsWithStats = await Promise.all(roundsDataPromises);
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

    if (loading) return <div style={{ padding: '20px', fontFamily: 'verdana' }}>loading...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red', fontFamily: 'verdana' }}>{error}</div>;

    return (
        <div style={styles.pageContainer}>
            {/* Header Bar */}
            <div style={styles.headerBar}>
                <div style={styles.headerContent}>
                    <Link to={`/competitions/${id}`} style={styles.headerLink}>&lt; BACK TO CONTROL PANEL</Link>
                    <span style={styles.headerSeparator}>|</span>
                    <span style={styles.headerTitle}>COMPETITION #{id} STATISTICS</span>
                </div>
            </div>

            <div style={styles.mainLayout}>
                {/* Left Content: Round Table */}
                <div style={styles.contentArea}>
                    <div style={styles.sectionHeader}>
                        ROUND PERFORMANCE LOG
                    </div>

                    {roundsStats.length > 0 ? (
                        <table style={styles.retroTable}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>#</th>
                                    <th style={styles.th}>GAME</th>
                                    <th style={styles.th}>STATUS</th>
                                    <th style={styles.th}>PLAYERS</th>
                                    <th style={styles.th}>PASSED</th>
                                    <th style={styles.th}>ELIMINATED</th>
                                    <th style={styles.th}>TIMEOUT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roundsStats.map((round, index) => (
                                    <tr key={round.id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                                        <td style={styles.tdCenter}>{round.roundNumber}</td>
                                        <td style={styles.td}><a href="#" style={styles.tableLink}>{round.title || round.gameTitle || 'Unknown Game'}</a></td>
                                        <td style={styles.tdCenter}>
                                            <span style={getStatusStyle(round.status)}>{round.status}</span>
                                        </td>
                                        <td style={styles.tdCenter}><b>{round.stats ? round.stats.total : '-'}</b></td>
                                        <td style={{ ...styles.tdCenter, color: 'green' }}>{round.stats ? round.stats.PASSED : '-'}</td>
                                        <td style={{ ...styles.tdCenter, color: 'red' }}>{round.stats ? round.stats.ELIMINATED : '-'}</td>
                                        <td style={{ ...styles.tdCenter, color: '#b35900' }}>{round.stats ? round.stats.TIMEOUT : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={styles.emptyState}>there doesn't seem to be anything here</div>
                    )}
                </div>

                {/* Right Sidebar: General Stats */}
                <div style={styles.sidebar}>
                    {/* Search Box Style Placeholder */}
                    <div style={styles.sidebarBox}>
                        <div style={styles.sidebarHeader}>SEARCH</div>
                        <input type="text" placeholder="search stats..." style={styles.searchInput} disabled />
                    </div>

                    {/* Competition Info */}
                    <div style={styles.sidebarBox}>
                        <div style={styles.sidebarHeader}>COMPETITION INFO</div>
                        <div style={styles.sidebarContent}>
                            <div style={styles.statRow}>
                                <span style={styles.statLabel}>ID:</span>
                                <span style={styles.statValue}>#{id}</span>
                            </div>
                            <div style={styles.statRow}>
                                <span style={styles.statLabel}>TOTAL PLAYERS:</span>
                                <span style={styles.statValue}>{generalStats.total}</span>
                            </div>
                            <div style={styles.statRow}>
                                <span style={styles.statLabel}>STATUS:</span>
                                <span style={styles.statValue}>ACTIVE</span>
                            </div>
                        </div>
                    </div>

                    {/* Demographics */}
                    <div style={styles.sidebarBox}>
                        <div style={styles.sidebarHeader}>DEMOGRAPHICS</div>
                        <div style={styles.sidebarContent}>
                            <div style={styles.demographicRow}>
                                <div style={styles.demoLabel}>MALE</div>
                                <div style={styles.demoBarContainer}>
                                    <div style={{ ...styles.demoBar, width: `${getPercent(generalStats.sexCounts.MALE, generalStats.total)}`, backgroundColor: '#8fb6d6' }}></div>
                                </div>
                                <div style={styles.demoValue}>{generalStats.sexCounts.MALE}</div>
                            </div>
                            <div style={styles.demographicRow}>
                                <div style={styles.demoLabel}>FEMALE</div>
                                <div style={styles.demoBarContainer}>
                                    <div style={{ ...styles.demoBar, width: `${getPercent(generalStats.sexCounts.FEMALE, generalStats.total)}`, backgroundColor: '#ffb3c6' }}></div>
                                </div>
                                <div style={styles.demoValue}>{generalStats.sexCounts.FEMALE}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={styles.sidebarBox}>
                        <div style={styles.sidebarContent}>
                            <button style={styles.retroButton}>EXPORT DATA (CSV)</button>
                            <button style={{ ...styles.retroButton, marginTop: '5px' }}>PRINT REPORT</button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.footer}>
                &copy; 2025 SQUID GAME SYSTEM &bull; <a href="#" style={styles.footerLink}>help</a> &bull; <a href="#" style={styles.footerLink}>api</a>
            </div>
        </div>
    );
};

const getPercent = (val, total) => total > 0 ? (val / total) * 100 + '%' : '0%';

const getStatusStyle = (status) => {
    switch (status) {
        case 'COMPLETED': return { color: 'green', fontWeight: 'bold' };
        case 'ACTIVE': return { color: 'blue', fontWeight: 'bold' };
        default: return { color: 'grey' };
    }
};

const styles = {
    pageContainer: {
        backgroundColor: '#cee3f8', // Classic Reddit blue-grey
        minHeight: '100vh',
        fontFamily: 'Verdana, Arial, Helvetica, sans-serif',
        fontSize: '12px',
        color: '#222',
    },
    headerBar: {
        backgroundColor: '#cee3f8',
        borderBottom: '1px solid #5f99cf',
        padding: '5px 10px',
        marginBottom: '10px'
    },
    headerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    headerLink: {
        textTransform: 'uppercase',
        fontWeight: 'bold',
        color: '#369',
        textDecoration: 'none',
        fontSize: '11px'
    },
    headerSeparator: {
        color: '#888'
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: '14px'
    },
    mainLayout: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        gap: '15px',
        padding: '0 10px'
    },
    contentArea: {
        flex: 3,
        backgroundColor: 'white',
        padding: '5px',
        border: '1px solid #5f99cf', // Slightly darker blue border
        borderRadius: '3px'
    },
    sidebar: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    sectionHeader: {
        backgroundColor: '#f0f0f0',
        padding: '5px',
        borderBottom: '1px solid #ccc',
        fontWeight: 'bold',
        fontSize: '14px',
        marginBottom: '10px'
    },
    retroTable: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '11px'
    },
    th: {
        textAlign: 'left',
        padding: '4px',
        borderBottom: '1px solid #ccc',
        backgroundColor: '#f0f0f0',
        color: '#555',
        fontWeight: 'bold'
    },
    td: {
        padding: '6px 4px',
        borderBottom: '1px solid #eee'
    },
    tdCenter: {
        padding: '6px 4px',
        borderBottom: '1px solid #eee',
        textAlign: 'center'
    },
    trEven: {
        backgroundColor: '#fff'
    },
    trOdd: {
        backgroundColor: '#f9f9f9'
    },
    tableLink: {
        color: '#369',
        textDecoration: 'none',
        fontWeight: 'bold'
    },
    emptyState: {
        padding: '20px',
        textAlign: 'center',
        color: '#888',
        fontStyle: 'italic'
    },
    sidebarBox: {
        backgroundColor: 'white',
        border: '1px solid #cce', // Softer border for sidebar
        borderRadius: '3px',
        overflow: 'hidden'
    },
    sidebarHeader: {
        backgroundColor: '#e0e0e0',
        padding: '3px 6px',
        fontSize: '10px',
        fontWeight: 'bold',
        color: '#555'
    },
    sidebarContent: {
        padding: '10px'
    },
    searchInput: {
        width: '100%',
        padding: '3px',
        border: '1px solid #ccc',
        fontSize: '11px'
    },
    statRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '5px',
        borderBottom: '1px dashed #eee',
        paddingBottom: '2px'
    },
    statLabel: {
        color: '#666'
    },
    statValue: {
        fontWeight: 'bold'
    },
    demographicRow: {
        marginBottom: '8px'
    },
    demoLabel: {
        fontSize: '10px',
        marginBottom: '2px',
        color: '#666'
    },
    demoBarContainer: {
        height: '12px',
        backgroundColor: '#eee',
        border: '1px solid #ccc',
        marginBottom: '2px'
    },
    demoBar: {
        height: '100%'
    },
    demoValue: {
        fontSize: '10px',
        textAlign: 'right',
        color: '#888'
    },
    retroButton: {
        width: '100%',
        padding: '5px',
        backgroundColor: '#f8f8f8',
        border: '1px solid #ccc',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#333'
    },
    footer: {
        textAlign: 'center',
        padding: '20px',
        color: '#888',
        fontSize: '10px'
    },
    footerLink: {
        color: '#888',
        textDecoration: 'underline'
    }
};

export default CompetitionStatisticsPage;
