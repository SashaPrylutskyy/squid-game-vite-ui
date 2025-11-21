// src/pages/Host/ReportsPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import retroTheme from '../../styles/retroTheme';

const ReportsPage = () => {
    const [mode, setMode] = useState('SELECTION'); // 'SELECTION' or 'VIEW'
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportData, setReportData] = useState(null); // Can be array or object depending on report
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- REPORT CATEGORIES & DEFINITIONS ---
    const reportCategories = [
        {
            id: 'PLAYERS',
            title: '2.1 PLAYER REPORTS',
            reports: [
                { id: 'PLAYER_DEMOGRAPHICS', title: '1) DEMOGRAPHIC PORTRAIT', description: 'Sex, Age Groups, Roles, Registration Dynamics.', type: 'COMPLEX' },
                { id: 'PLAYER_SURVIVAL', title: '2) SURVIVAL RATING', description: 'Rounds passed, Avg lifespan, Fastest elimination.', type: 'PLACEHOLDER', note: 'Requires historical round result data.' },
                { id: 'PLAYER_ACTIVITY', title: '3) ACTIVITY & PARTICIPATION', description: 'Competition count, Confirmation rates.', type: 'PLACEHOLDER', note: 'Requires participation history.' }
            ]
        },
        {
            id: 'COMPETITIONS',
            title: '2.2 COMPETITION REPORTS',
            reports: [
                { id: 'COMPETITION_PASSPORT', title: '5) COMPETITION PASSPORT', description: 'Rounds/Players count, Chronology, Prize Fund.', type: 'COMPLEX' },
                { id: 'ROUND_EFFICIENCY', title: '6) ROUND EFFICIENCY', description: 'Duration, Difficulty, Success Rates.', type: 'PLACEHOLDER', note: 'Requires detailed round analytics.' }
            ]
        },
        {
            id: 'ROUNDS',
            title: '2.3 ROUND REPORTS',
            reports: [
                { id: 'TOP_HARDEST_ROUNDS', title: '10) TOP 10 HARDEST ROUNDS', description: 'Max elimination, Max time, Min survival.', type: 'PLACEHOLDER', note: 'Requires global round statistics.' }
            ]
        },
        {
            id: 'VOTING',
            title: '2.4 VOTING REPORTS',
            reports: [
                { id: 'VOTING_EXIT', title: '11) EXIT VOTE ANALYSIS', description: 'Quit vs Continue, Decision dynamics.', type: 'PLACEHOLDER', note: 'Requires voting history.' },
                { id: 'VOTING_GROUPS', title: '12) GROUP VOTING', description: 'Voting by Age, Sex, Balance.', type: 'PLACEHOLDER', note: 'Requires voting history and user demographics.' }
            ]
        },
        {
            id: 'FINANCIAL',
            title: '2.5 FINANCIAL REPORTS',
            reports: [
                { id: 'FINANCIAL_DYNAMICS', title: '13) FINANCIAL DYNAMICS', description: 'Transactions, Deposits, VIP Activity.', type: 'PLACEHOLDER', note: 'Requires transaction history.' },
                { id: 'VIP_RATING', title: '14) VIP RATING', description: 'Top contributors, Frequency.', type: 'PLACEHOLDER', note: 'Requires transaction history.' }
            ]
        },
        {
            id: 'STAFF',
            title: '2.6 STAFF REPORTS',
            reports: [
                { id: 'WORKER_EFFICIENCY', title: '16) WORKER EFFICIENCY', description: 'Reports sent, Time to confirm, Errors.', type: 'PLACEHOLDER', note: 'Requires task logs.' },
                { id: 'RECRUITING_STATS', title: '17) RECRUITING STATISTICS', description: 'Referrals, Sales effectiveness.', type: 'PLACEHOLDER', note: 'Requires referral logs.' },
                { id: 'JOB_OFFERS', title: '18) JOB OFFER STATISTICS', description: 'Offers by role, Acceptance rates.', type: 'COMPLEX' }
            ]
        }
    ];

    // --- DATA FETCHING ---
    const fetchReportData = async (reportId) => {
        setLoading(true);
        setError(null);
        setReportData(null);

        try {
            if (reportId === 'PLAYER_DEMOGRAPHICS') {
                // Fetch all users to calculate demographics
                // Note: Age/Birthday and CreatedAt are missing in standard DTOs usually, but we'll use what we have.
                const response = await api.get('/users', { params: { role: 'PLAYER' } });
                const players = response.data;

                // Calculate stats
                const total = players.length;
                const sexDist = players.reduce((acc, p) => {
                    const s = p.sex || 'UNKNOWN';
                    acc[s] = (acc[s] || 0) + 1;
                    return acc;
                }, {});

                const roleDist = players.reduce((acc, p) => {
                    const r = p.role || 'UNKNOWN';
                    acc[r] = (acc[r] || 0) + 1;
                    return acc;
                }, {});

                const statusDist = players.reduce((acc, p) => {
                    const s = p.status || 'UNKNOWN';
                    acc[s] = (acc[s] || 0) + 1;
                    return acc;
                }, {});

                setReportData({
                    total,
                    sexDist,
                    roleDist,
                    statusDist,
                    note: "Age groups and Registration dynamics require backend updates."
                });

            } else if (reportId === 'COMPETITION_PASSPORT') {
                // Fetch all competitions
                // We need to fetch list, then maybe details for each to get rounds/players count if not in list DTO
                const listResp = await api.get('/competition'); // "My Competitions" - might need "All" if VIP/Admin
                // For HOST, /competition returns list.
                const competitions = listResp.data;

                // We'll try to fetch details for the first few or just show summary if list has enough info.
                // List DTO: id, title, status.
                // We need to fetch details for each to get rounds/players.
                // This might be slow for many competitions, but for a report it's okay.

                const detailedComps = await Promise.all(competitions.map(async (c) => {
                    try {
                        const detailResp = await api.get(`/competition/${c.id}`);
                        // Detail DTO usually has more info. If not, we use what we have.
                        // Based on docs, /competition/{id} returns users list.
                        // We might not get rounds count directly unless we call /round endpoints.
                        // Let's assume we just count players for now.
                        return {
                            ...c,
                            playerCount: detailResp.data.length // Assuming it returns list of users
                        };
                    } catch (e) {
                        return { ...c, playerCount: 'N/A' };
                    }
                }));

                setReportData({
                    competitions: detailedComps,
                    note: "Full chronology and financial data require backend updates."
                });

            } else if (reportId === 'JOB_OFFERS') {
                const offersResp = await api.get('/job-offer');
                const offers = offersResp.data;

                const total = offers.length;
                const byRole = offers.reduce((acc, o) => {
                    acc[o.role] = (acc[o.role] || 0) + 1;
                    return acc;
                }, {});

                const byStatus = offers.reduce((acc, o) => {
                    acc[o.offerStatus] = (acc[o.offerStatus] || 0) + 1;
                    return acc;
                }, {});

                setReportData({
                    total,
                    byRole,
                    byStatus
                });
            }

            setMode('VIEW');
            // Find report definition
            let foundReport = null;
            for (const cat of reportCategories) {
                const r = cat.reports.find(rep => rep.id === reportId);
                if (r) {
                    foundReport = r;
                    break;
                }
            }
            setSelectedReport(foundReport);

        } catch (err) {
            console.error("Error generating report:", err);
            setError("Failed to generate report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReportClick = (report) => {
        if (report.type === 'PLACEHOLDER') {
            setSelectedReport(report);
            setMode('VIEW');
            setReportData(null);
        } else {
            fetchReportData(report.id);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // --- RENDERERS ---

    const renderStatsTable = (title, dataObj) => (
        <div style={{ marginBottom: '20px' }}>
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>{title}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                    {Object.entries(dataObj).map(([key, val]) => (
                        <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '5px', fontWeight: 'bold' }}>{key}</td>
                            <td style={{ padding: '5px', textAlign: 'right' }}>{val}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderContent = () => {
        if (!selectedReport) return null;

        if (selectedReport.type === 'PLACEHOLDER') {
            return (
                <div style={{ padding: '40px', textAlign: 'center', border: '2px dashed #ccc', color: '#666' }}>
                    <h3>REPORT UNAVAILABLE</h3>
                    <p>{selectedReport.note}</p>
                    <p>Please contact system administrator to enable backend support for this report.</p>
                </div>
            );
        }

        if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}>Loading data...</div>;
        if (error) return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
        if (!reportData) return <div>No data available.</div>;

        // Custom rendering based on report ID
        if (selectedReport.id === 'PLAYER_DEMOGRAPHICS') {
            return (
                <div>
                    <div style={{ marginBottom: '20px', fontSize: '14px' }}>Total Players Analyzed: <strong>{reportData.total}</strong></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {renderStatsTable('DISTRIBUTION BY SEX', reportData.sexDist)}
                        {renderStatsTable('DISTRIBUTION BY STATUS', reportData.statusDist)}
                    </div>
                    {renderStatsTable('DISTRIBUTION BY ROLE', reportData.roleDist)}
                    {reportData.note && <div style={{ fontSize: '10px', color: 'red', marginTop: '20px' }}>* {reportData.note}</div>}
                </div>
            );
        }

        if (selectedReport.id === 'COMPETITION_PASSPORT') {
            return (
                <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #000' }}>
                                <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                                <th style={{ textAlign: 'left', padding: '8px' }}>TITLE</th>
                                <th style={{ textAlign: 'left', padding: '8px' }}>STATUS</th>
                                <th style={{ textAlign: 'right', padding: '8px' }}>PLAYERS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.competitions.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '8px' }}>{c.id}</td>
                                    <td style={{ padding: '8px' }}>{c.title}</td>
                                    <td style={{ padding: '8px' }}>{c.status}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>{c.playerCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {reportData.note && <div style={{ fontSize: '10px', color: 'red', marginTop: '20px' }}>* {reportData.note}</div>}
                </div>
            );
        }

        if (selectedReport.id === 'JOB_OFFERS') {
            return (
                <div>
                    <div style={{ marginBottom: '20px', fontSize: '14px' }}>Total Offers Issued: <strong>{reportData.total}</strong></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {renderStatsTable('OFFERS BY ROLE', reportData.byRole)}
                        {renderStatsTable('OFFERS BY STATUS', reportData.byStatus)}
                    </div>
                </div>
            );
        }

        return <div>Report data loaded but no renderer defined.</div>;
    };

    return (
        <div style={retroTheme.common.pageContainer}>
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { background-color: white !important; color: black !important; }
                    #root { padding: 0 !important; margin: 0 !important; }
                    div[style*="min-height"] { min-height: auto !important; }
                    div[style*="background-color"] { background-color: white !important; }
                }
            `}</style>

            <div style={{ maxWidth: '1000px', margin: 'auto', padding: '20px' }}>
                {/* HEADER - Hidden on Print */}
                <div className="no-print" style={{ marginBottom: '20px' }}>
                    <Link to="/dashboard" style={retroTheme.common.link}>&lt;&lt; BACK TO DASHBOARD</Link>
                </div>

                {mode === 'SELECTION' && (
                    <div className="no-print">
                        <div style={{
                            backgroundColor: retroTheme.colors.headerBg,
                            border: `1px solid ${retroTheme.colors.border}`,
                            padding: '15px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            <h1 style={{ margin: 0, fontSize: retroTheme.fonts.size.title }}>GAME REPORTS CENTER</h1>
                            <p style={{ margin: '5px 0 0', fontSize: retroTheme.fonts.size.small }}>SELECT A REPORT TO GENERATE</p>
                        </div>

                        {reportCategories.map(cat => (
                            <div key={cat.id} style={{ marginBottom: '30px' }}>
                                <h2 style={{
                                    fontSize: '18px',
                                    borderBottom: `2px solid ${retroTheme.colors.primary}`,
                                    paddingBottom: '5px',
                                    marginBottom: '15px',
                                    color: retroTheme.colors.primary
                                }}>
                                    {cat.title}
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                    {cat.reports.map(report => (
                                        <button
                                            key={report.id}
                                            onClick={() => handleReportClick(report)}
                                            style={{
                                                ...retroTheme.common.card,
                                                padding: '20px',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                backgroundColor: '#fff',
                                                border: `1px solid ${retroTheme.colors.border}`,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                minHeight: '100px'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#000' }}>{report.title}</div>
                                                <div style={{ fontSize: '12px', color: '#555' }}>{report.description}</div>
                                            </div>
                                            {report.note && (
                                                <div style={{ marginTop: '10px', fontSize: '10px', color: '#cc0000', fontStyle: 'italic' }}>
                                                    * {report.note}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {mode === 'VIEW' && selectedReport && (
                    <div style={{ backgroundColor: '#fff', padding: '20px', minHeight: '500px' }}>
                        {/* CONTROLS - Hidden on Print */}
                        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                            <button onClick={() => setMode('SELECTION')} style={retroTheme.common.button}>&lt; BACK TO LIST</button>
                            <button onClick={handlePrint} style={{ ...retroTheme.common.button, backgroundColor: '#000', color: '#fff' }}>PRINT REPORT</button>
                        </div>

                        {/* REPORT CONTENT - Printer Friendly */}
                        <div className="report-content">
                            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                <h1 style={{ margin: 0, textTransform: 'uppercase', fontSize: '24px' }}>{selectedReport.title}</h1>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                    GENERATED ON: {new Date().toLocaleString()}
                                </div>
                            </div>

                            {renderContent()}

                            <div style={{ marginTop: '50px', borderTop: '1px solid #000', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                <span>SQUID GAME MANAGEMENT SYSTEM</span>
                                <span>CONFIDENTIAL</span>
                                <span>PAGE 1 OF 1</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
