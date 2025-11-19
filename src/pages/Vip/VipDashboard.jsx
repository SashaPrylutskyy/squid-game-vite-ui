// src/pages/Vip/VipDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import retroTheme from '../../styles/retroTheme';

const VipDashboard = () => {
    const [allCompetitions, setAllCompetitions] = useState([]);
    const [fundedCompetitions, setFundedCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedCompetition, setSelectedCompetition] = useState('');
    const [amount, setAmount] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const allCompetitionsResponse = await api.get('/competition/list-all');
            const competitionsData = allCompetitionsResponse.data;

            setAllCompetitions(competitionsData);

            if (competitionsData.length > 0) {
                setSelectedCompetition(competitionsData[0].id);
            }

            const fundedResponse = await api.get('/transaction/my-deposits');
            setFundedCompetitions(fundedResponse.data);

        } catch (err) {
            console.error("Error loading data:", err);
            setError(err.response?.data?.error || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDepositSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCompetition || !amount || amount <= 0) {
            alert("Please select a competition and enter a valid amount.");
            return;
        }

        try {
            await api.post('/transaction/deposit', {
                competitionId: Number(selectedCompetition),
                amount: Number(amount)
            });
            alert(`Investment of ${amount} confirmed!`);
            setAmount('');
            fetchData();
        } catch (err) {
            console.error("Deposit error:", err);
            alert(err.response?.data?.error || "An error occurred.");
        }
    };

    if (loading) return <div style={{ padding: '20px', fontFamily: retroTheme.fonts.main }}>Loading VIP interface...</div>;

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
                    <h1 style={{ margin: 0, fontSize: retroTheme.fonts.size.title }}>VIP LOUNGE</h1>
                </div>

                {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', backgroundColor: '#ffeeee' }}>{error}</p>}

                {!error && allCompetitions.length > 0 ? (
                    <div style={retroTheme.common.card}>
                        <div style={{
                            backgroundColor: retroTheme.colors.sectionHeaderBg,
                            padding: '10px',
                            borderBottom: `1px solid ${retroTheme.colors.borderLight}`,
                            fontWeight: 'bold'
                        }}>
                            MAKE AN INVESTMENT
                        </div>
                        <div style={{ padding: '20px' }}>
                            <form onSubmit={handleDepositSubmit}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Competition</label>
                                    <select
                                        value={selectedCompetition}
                                        onChange={e => setSelectedCompetition(e.target.value)}
                                        style={{ ...retroTheme.common.input, width: '100%' }}
                                    >
                                        {allCompetitions.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {`${c.createdBy.email} | ${c.title} (Status: ${c.status})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Investment Amount</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        min="1"
                                        required
                                        style={{ ...retroTheme.common.input, width: '100%' }}
                                    />
                                </div>
                                <button type="submit" style={{ ...retroTheme.common.button, width: '100%' }}>
                                    CONFIRM INVESTMENT
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    !error && !loading && <p style={{ fontFamily: retroTheme.fonts.main }}>No active competitions available for investment.</p>
                )}

                <div style={{ marginTop: '30px' }}>
                    <h2 style={{
                        fontSize: retroTheme.fonts.size.large,
                        borderBottom: `2px solid ${retroTheme.colors.border}`,
                        paddingBottom: '5px',
                        marginBottom: '15px'
                    }}>
                        PORTFOLIO
                    </h2>
                    {!error && fundedCompetitions.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', border: `1px solid ${retroTheme.colors.border}` }}>
                                <thead>
                                    <tr style={{ backgroundColor: retroTheme.colors.headerBg }}>
                                        <th style={{ padding: '10px', border: `1px solid ${retroTheme.colors.border}`, textAlign: 'left' }}>COMPETITION</th>
                                        <th style={{ padding: '10px', border: `1px solid ${retroTheme.colors.border}`, textAlign: 'left' }}>AMOUNT</th>
                                        <th style={{ padding: '10px', border: `1px solid ${retroTheme.colors.border}`, textAlign: 'left' }}>DATE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fundedCompetitions.map(tx => (
                                        <tr key={tx.id}>
                                            <td style={{ padding: '10px', border: `1px solid ${retroTheme.colors.borderLight}` }}>{tx.competition.title}</td>
                                            <td style={{ padding: '10px', border: `1px solid ${retroTheme.colors.borderLight}`, fontWeight: 'bold', color: 'green' }}>{tx.amount.toLocaleString()}</td>
                                            <td style={{ padding: '10px', border: `1px solid ${retroTheme.colors.borderLight}` }}>{new Date(tx.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        !error && !loading &&
                        <p style={{ color: retroTheme.colors.textLight, fontStyle: 'italic' }}>No investments recorded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VipDashboard;