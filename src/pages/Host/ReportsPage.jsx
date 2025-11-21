// src/pages/Host/ReportsPage.jsx
import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import api from '../../services/api';
import retroTheme from '../../styles/retroTheme';

const ReportsPage = () => {
    const [mode, setMode] = useState('SELECTION'); // 'SELECTION' or 'VIEW'
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- REPORT CATEGORIES & DEFINITIONS ---
    const reportCategories = [
        {
            id: 'PLAYERS',
            title: '2.1 PLAYER REPORTS',
            reports: [
                {
                    id: 'PLAYER_DEMOGRAPHICS',
                    title: '1) DEMOGRAPHIC PORTRAIT',
                    description: 'Sex, Age Groups, Roles, Registration Dynamics.',
                    type: 'COMPLEX'
                },
                {
                    id: 'PLAYER_SURVIVAL',
                    title: '2) SURVIVAL RATING',
                    description: 'Rounds passed, Avg lifespan, Fastest elimination.',
                    type: 'COMPLEX'
                },
                {
                    id: 'PLAYER_ACTIVITY',
                    title: '3) ACTIVITY & PARTICIPATION',
                    description: 'Competition count, Confirmation rates.',
                    type: 'COMPLEX'
                }
            ]
        },
        {
            id: 'COMPETITIONS',
            title: '2.2 COMPETITION REPORTS',
            reports: [
                {
                    id: 'COMPETITION_PASSPORT',
                    title: '5) COMPETITION PASSPORT',
                    description: 'Rounds/Players count, Chronology, Prize Fund.',
                    type: 'COMPLEX'
                },
                {
                    id: 'ROUND_EFFICIENCY',
                    title: '6) ROUND EFFICIENCY',
                    description: 'Duration, Difficulty, Success Rates.',
                    type: 'COMPLEX'
                }
            ]
        },
        {
            id: 'ROUNDS',
            title: '2.3 ROUND REPORTS',
            reports: [
                {
                    id: 'TOP_HARDEST_ROUNDS',
                    title: '10) TOP 10 HARDEST ROUNDS',
                    description: 'Max elimination, Max time, Min survival.',
                    type: 'COMPLEX'
                }
            ]
        },
        {
            id: 'VOTING',
            title: '2.4 VOTING REPORTS',
            reports: [
                {
                    id: 'VOTING_EXIT',
                    title: '11) EXIT VOTE ANALYSIS',
                    description: 'Quit vs Continue, Decision dynamics.',
                    type: 'COMPLEX'
                },
                {
                    id: 'VOTING_GROUPS',
                    title: '12) GROUP VOTING',
                    description: 'Voting by Age, Sex, Balance.',
                    type: 'COMPLEX'
                }
            ]
        },
        {
            id: 'FINANCIAL',
            title: '2.5 FINANCIAL REPORTS',
            reports: [
                {
                    id: 'FINANCIAL_DYNAMICS',
                    title: '13) FINANCIAL DYNAMICS',
                    description: 'Transactions, Deposits, VIP Activity.',
                    type: 'COMPLEX'
                },
                {
                    id: 'VIP_RATING',
                    title: '14) VIP RATING',
                    description: 'Top contributors, Frequency.',
                    type: 'COMPLEX'
                }
            ]
        },
        {
            id: 'STAFF',
            title: '2.6 STAFF REPORTS',
            reports: [
                {
                    id: 'WORKER_EFFICIENCY',
                    title: '16) WORKER EFFICIENCY',
                    description: 'Reports sent, Time to confirm, Errors.',
                    type: 'COMPLEX'
                },
                {
                    id: 'RECRUITING_STATS',
                    title: '17) RECRUITING STATISTICS',
                    description: 'Referrals, Sales effectiveness.',
                    type: 'COMPLEX'
                },
                {
                    id: 'JOB_OFFERS',
                    title: '18) JOB OFFER STATISTICS',
                    description: 'Offers by role, Acceptance rates.',
                    type: 'COMPLEX'
                }
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
                try {
                    const response = await api.get('/users', {params: {role: 'PLAYER'}});
                    // --- ФІКС ТУТ: Перевіряємо, чи це масив, чи Page об'єкт ---
                    let players = [];
                    if (Array.isArray(response.data)) {
                        players = response.data;
                    } else if (response.data && Array.isArray(response.data.content)) {
                        // Якщо Spring повернув Page object { content: [...], pageable: ... }
                        players = response.data.content;
                    } else {
                        console.error("Unexpected format from /users:", response.data);
                        throw new Error("Invalid data format received from server");
                    }

                    const total = players.length;
                    const sexDist = players.reduce((acc, p) => {
                        const s = p.sex || 'UNKNOWN';
                        acc[s] = (acc[s] || 0) + 1;
                        return acc;
                    }, {});

                    // Age Groups (assuming birthday is YYYY-MM-DD)
                    const ageDist = {'18-25': 0, '26-40': 0, '41-60': 0, '60+': 0, 'UNKNOWN': 0};
                    const currentYear = new Date().getFullYear();
                    players.forEach(p => {
                        if (p.birthday) {
                            const birthYear = new Date(p.birthday).getFullYear();
                            const age = currentYear - birthYear;
                            if (age >= 18 && age <= 25) ageDist['18-25']++;
                            else if (age >= 26 && age <= 40) ageDist['26-40']++;
                            else if (age >= 41 && age <= 60) ageDist['41-60']++;
                            else if (age > 60) ageDist['60+']++;
                            else ageDist['UNKNOWN']++;
                        } else {
                            ageDist['UNKNOWN']++;
                        }
                    });

                    setReportData({total, sexDist, ageDist});
                } catch (e) {
                    console.error("FAILED: PLAYER_DEMOGRAPHICS", e);
                    throw e;
                }

            } else if (reportId === 'PLAYER_SURVIVAL' || reportId === 'PLAYER_ACTIVITY') {
                try {
                    const response = await api.get('/reports/players/statistics');
                    setReportData(response.data);
                } catch (e) {
                    console.error("FAILED: PLAYER_SURVIVAL/ACTIVITY", e);
                    throw e;
                }

            } else if (reportId === 'COMPETITION_PASSPORT' || reportId === 'ROUND_EFFICIENCY' || reportId === 'FINANCIAL_DYNAMICS') {
                try {
                    const listResp = await api.get('/competition');
                    const competitions = listResp.data.slice(0, 5);

                    const detailedComps = await Promise.all(competitions.map(async (c) => {
                        try {
                            const detailResp = await api.get(`/reports/competitions/${c.id}`);
                            return detailResp.data;
                        } catch (e) {
                            console.error(`Failed to fetch details for comp ${c.id}`, e);
                            return null;
                        }
                    }));
                    setReportData(detailedComps.filter(c => c !== null));
                } catch (e) {
                    console.error("FAILED: COMPETITION REPORTS", e);
                    throw e;
                }

            } else if (reportId === 'TOP_HARDEST_ROUNDS') {
                try {
                    const response = await api.get('/reports/rounds/top-hardest');
                    setReportData(response.data);
                } catch (e) {
                    console.error("FAILED: TOP_HARDEST_ROUNDS", e);
                    throw e;
                }

            } else if (reportId === 'VOTING_EXIT' || reportId === 'VOTING_GROUPS') {
                try {
                    const response = await api.get('/reports/voting-analytics');
                    setReportData(response.data);
                } catch (e) {
                    console.error("FAILED: VOTING REPORTS", e);
                    throw e;
                }

            } else if (reportId === 'VIP_RATING') {
                try {
                    const response = await api.get('/reports/financial/vip-rating');
                    setReportData(response.data);
                } catch (e) {
                    console.error("FAILED: VIP_RATING", e);
                    throw e;
                }

            } else if (reportId === 'WORKER_EFFICIENCY') {
                try {
                    const response = await api.get('/reports/staff/performance');
                    setReportData(response.data);
                } catch (e) {
                    console.error("FAILED: WORKER_EFFICIENCY", e);
                    throw e;
                }

            } else if (reportId === 'RECRUITING_STATS') {
                try {
                    const response = await api.get('/reports/recruitment/stats');
                    setReportData(response.data);
                } catch (e) {
                    console.error("FAILED: RECRUITING_STATS", e);
                    throw e;
                }

            } else if (reportId === 'JOB_OFFERS') {
                try {
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
                    setReportData({total, byRole, byStatus});
                } catch (e) {
                    console.error("FAILED: JOB_OFFERS", e);
                    throw e;
                }
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
        fetchReportData(report.id);
    };

    const handlePrint = () => {
        window.print();
    };

    // --- RENDERERS ---

    const renderStatsTable = (title, dataObj) => (
        <div style={{marginBottom: '20px'}}>
            <h3 style={{borderBottom: '1px solid #ccc', paddingBottom: '5px', fontSize: '14px'}}>{title}</h3>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
                <tbody>
                {Object.entries(dataObj).map(([key, val]) => (
                    <tr key={key} style={{borderBottom: '1px solid #eee'}}>
                        <td style={{padding: '5px', fontWeight: 'bold'}}>{key}</td>
                        <td style={{padding: '5px', textAlign: 'right'}}>{val}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );

    const renderDataTable = (columns, data) => (
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px'}}>
            <thead>
            <tr style={{borderBottom: '2px solid #000', backgroundColor: '#f9f9f9'}}>
                {columns.map((col, idx) => (
                    <th key={idx} style={{textAlign: col.align || 'left', padding: '8px'}}>{col.header}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((row, idx) => (
                <tr key={idx} style={{borderBottom: '1px solid #ddd'}}>
                    {columns.map((col, cIdx) => (
                        <td key={cIdx} style={{textAlign: col.align || 'left', padding: '8px'}}>
                            {col.render ? col.render(row) : row[col.field]}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    );

    const renderContent = () => {
        if (!selectedReport) return null;
        if (loading) return <div style={{textAlign: 'center', padding: '20px'}}>Loading data...</div>;
        if (error) return <div style={{color: 'red', textAlign: 'center'}}>{error}</div>;
        if (!reportData) return <div>No data available.</div>;

        // --- RENDER LOGIC BASED ON REPORT ID ---

        if (selectedReport.id === 'PLAYER_DEMOGRAPHICS') {
            return (
                <div>
                    <div style={{marginBottom: '20px', fontSize: '14px'}}>Total
                        Players: <strong>{reportData.total}</strong></div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                        {renderStatsTable('BY SEX', reportData.sexDist)}
                        {renderStatsTable('BY AGE GROUP', reportData.ageDist)}
                    </div>
                </div>
            );
        }

        if (selectedReport.id === 'PLAYER_SURVIVAL' || selectedReport.id === 'PLAYER_ACTIVITY') {
            // reportData is array of PlayerStatsDTO
            const columns = [
                {header: 'Email', field: 'email'},
                {header: 'Rounds Passed', field: 'roundsPassed', align: 'center'},
                {header: 'Comps Entered', field: 'competitionsEntered', align: 'center'},
                {header: 'Avg Lifespan (s)', field: 'avgLifespanSeconds', align: 'right'},
                {header: 'Fastest Elim Round', field: 'fastestEliminationRound', align: 'center'},
                {
                    header: 'Confirm Rate',
                    field: 'confirmationRate',
                    align: 'right',
                    render: r => (r.confirmationRate * 100).toFixed(1) + '%'
                }
            ];
            return renderDataTable(columns, reportData);
        }

        if (selectedReport.id === 'COMPETITION_PASSPORT' || selectedReport.id === 'ROUND_EFFICIENCY' || selectedReport.id === 'FINANCIAL_DYNAMICS') {
            // reportData is array of CompetitionStatsDTO (detailed)
            return (
                <div>
                    {reportData.map(comp => (
                        <div key={comp.competitionId}
                             style={{marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '20px'}}>
                            <h2 style={{fontSize: '18px', marginBottom: '10px'}}>Competition #{comp.competitionId}</h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '20px',
                                marginBottom: '20px'
                            }}>
                                <div>
                                    <strong>Prize Pool:</strong> {comp.totalPrizePool?.toLocaleString()} <br/>
                                    <strong>VIP Contrib:</strong> {comp.vipContributions?.toLocaleString()}
                                </div>
                            </div>

                            <h4 style={{marginBottom: '5px'}}>Round Statistics</h4>
                            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '11px'}}>
                                <thead>
                                <tr style={{borderBottom: '1px solid #000'}}>
                                    <th style={{textAlign: 'left'}}>Round</th>
                                    <th style={{textAlign: 'left'}}>Game</th>
                                    <th style={{textAlign: 'right'}}>Duration (s)</th>
                                    <th style={{textAlign: 'right'}}>Started</th>
                                    <th style={{textAlign: 'right'}}>Eliminated</th>
                                    <th style={{textAlign: 'right'}}>Rate</th>
                                </tr>
                                </thead>
                                <tbody>
                                {comp.rounds?.map((r, idx) => (
                                    <tr key={idx} style={{borderBottom: '1px solid #eee'}}>
                                        <td>{r.roundNumber}</td>
                                        <td>{r.gameTitle}</td>
                                        <td style={{textAlign: 'right'}}>{r.durationSeconds}</td>
                                        <td style={{textAlign: 'right'}}>{r.playersStarted}</td>
                                        <td style={{textAlign: 'right'}}>{r.playersEliminated}</td>
                                        <td style={{textAlign: 'right'}}>{(r.eliminationRate * 100).toFixed(1)}%</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            );
        }

        if (selectedReport.id === 'TOP_HARDEST_ROUNDS') {
            const columns = [
                {header: 'Round ID', field: 'roundId'},
                {header: 'Comp ID', field: 'competitionId'},
                {header: 'Game', field: 'gameTitle'},
                {
                    header: 'Elim Rate',
                    field: 'eliminationRate',
                    align: 'right',
                    render: r => (r.eliminationRate * 100).toFixed(1) + '%'
                },
                {header: 'Avg Survival (s)', field: 'avgSurvivalTimeSeconds', align: 'right'}
            ];
            return renderDataTable(columns, reportData);
        }

        if (selectedReport.id === 'VOTING_EXIT' || selectedReport.id === 'VOTING_GROUPS') {
            // reportData: { totalVotes, quitPercentage, continuePercentage, byDemographics }
            return (
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        marginBottom: '30px',
                        padding: '20px',
                        backgroundColor: '#f0f0f0'
                    }}>
                        <div style={{textAlign: 'center'}}>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: 'bold'
                            }}>{(reportData.quitPercentage * 100).toFixed(1)}%
                            </div>
                            <div>VOTED QUIT</div>
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: 'bold'
                            }}>{(reportData.continuePercentage * 100).toFixed(1)}%
                            </div>
                            <div>VOTED CONTINUE</div>
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <div style={{fontSize: '24px', fontWeight: 'bold'}}>{reportData.totalVotes}</div>
                            <div>TOTAL VOTES</div>
                        </div>
                    </div>

                    <h3>Demographic Breakdown</h3>
                    {Object.entries(reportData.byDemographics || {}).map(([group, stats]) => (
                        <div key={group}
                             style={{marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>
                            <strong>{group.replace('_', ' ')}:</strong> Quit {stats.quit} vs Continue {stats.continue}
                        </div>
                    ))}
                </div>
            );
        }

        if (selectedReport.id === 'VIP_RATING') {
            const columns = [
                {header: 'Email', field: 'email'},
                {
                    header: 'Total Contributed',
                    field: 'totalContributed',
                    align: 'right',
                    render: r => r.totalContributed?.toLocaleString()
                },
                {header: 'Deposits', field: 'depositCount', align: 'center'},
                {
                    header: 'Last Deposit',
                    field: 'lastDepositAt',
                    align: 'right',
                    render: r => new Date(r.lastDepositAt).toLocaleDateString()
                }
            ];
            return renderDataTable(columns, reportData);
        }

        if (selectedReport.id === 'WORKER_EFFICIENCY') {
            const columns = [
                {header: 'Worker ID', field: 'workerId'},
                {header: 'Email', field: 'email'},
                {header: 'Reports', field: 'reportsSubmitted', align: 'center'},
                {header: 'Avg Confirm Time (s)', field: 'avgConfirmationTimeSeconds', align: 'right'},
                {header: 'Rejected', field: 'rejectedReports', align: 'center'}
            ];
            return renderDataTable(columns, reportData);
        }

        if (selectedReport.id === 'RECRUITING_STATS') {
            const columns = [
                {header: 'Salesman ID', field: 'salesmanId'},
                {header: 'Email', field: 'email'},
                {header: 'Ref Code', field: 'refCode'},
                {header: 'Recruited', field: 'playersRecruited', align: 'center'},
                {header: 'Active', field: 'activePlayers', align: 'center'}
            ];
            return renderDataTable(columns, reportData);
        }

        if (selectedReport.id === 'JOB_OFFERS') {
            return (
                <div>
                    <div style={{marginBottom: '20px', fontSize: '14px'}}>Total
                        Offers: <strong>{reportData.total}</strong></div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                        {renderStatsTable('BY ROLE', reportData.byRole)}
                        {renderStatsTable('BY STATUS', reportData.byStatus)}
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

            <div style={{maxWidth: '1000px', margin: 'auto', padding: '20px'}}>
                {/* HEADER - Hidden on Print */}
                <div className="no-print" style={{marginBottom: '20px'}}>
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
                            <h1 style={{margin: 0, fontSize: retroTheme.fonts.size.title}}>GAME REPORTS CENTER</h1>
                            <p style={{margin: '5px 0 0', fontSize: retroTheme.fonts.size.small}}>SELECT A REPORT TO
                                GENERATE</p>
                        </div>

                        {reportCategories.map(cat => (
                            <div key={cat.id} style={{marginBottom: '30px'}}>
                                <h2 style={{
                                    fontSize: '18px',
                                    borderBottom: `2px solid ${retroTheme.colors.primary}`,
                                    paddingBottom: '5px',
                                    marginBottom: '15px',
                                    color: retroTheme.colors.primary
                                }}>
                                    {cat.title}
                                </h2>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: '20px'
                                }}>
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
                                                <div style={{
                                                    fontWeight: 'bold',
                                                    marginBottom: '5px',
                                                    color: '#000'
                                                }}>{report.title}</div>
                                                <div
                                                    style={{fontSize: '12px', color: '#555'}}>{report.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {mode === 'VIEW' && selectedReport && (
                    <div style={{backgroundColor: '#fff', padding: '20px', minHeight: '500px'}}>
                        {/* CONTROLS - Hidden on Print */}
                        <div className="no-print" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '30px',
                            borderBottom: '1px solid #ccc',
                            paddingBottom: '10px'
                        }}>
                            <button onClick={() => setMode('SELECTION')} style={retroTheme.common.button}>&lt; BACK TO
                                LIST
                            </button>
                            <button onClick={handlePrint}
                                    style={{...retroTheme.common.button, backgroundColor: '#000', color: '#fff'}}>PRINT
                                REPORT
                            </button>
                        </div>

                        {/* REPORT CONTENT - Printer Friendly */}
                        <div className="report-content">
                            <div style={{textAlign: 'center', marginBottom: '30px'}}>
                                <h1 style={{
                                    margin: 0,
                                    textTransform: 'uppercase',
                                    fontSize: '24px'
                                }}>{selectedReport.title}</h1>
                                <div style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                                    GENERATED ON: {new Date().toLocaleString()}
                                </div>
                            </div>

                            {renderContent()}

                            <div style={{
                                marginTop: '50px',
                                borderTop: '1px solid #000',
                                paddingTop: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '10px'
                            }}>
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
