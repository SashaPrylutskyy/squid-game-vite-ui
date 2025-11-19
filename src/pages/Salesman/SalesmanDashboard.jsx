// src/pages/Salesman/SalesmanDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import retroTheme from '../../styles/retroTheme';

const SalesmanDashboard = () => {
    const [refCodeData, setRefCodeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRefCode = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/ref-code');
            setRefCodeData(response.data);
        } catch (err) {
            console.error("Error loading referral code:", err);
            setError(err.response?.data?.error || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRefCode();
    }, [fetchRefCode]);

    const handleCopyToClipboard = () => {
        if (refCodeData?.refCode) {
            const joinUrl = `${window.location.origin}/join/${refCodeData.refCode}`;
            navigator.clipboard.writeText(joinUrl)
                .then(() => alert("Recruitment link copied to clipboard!"))
                .catch(err => console.error('Copy error:', err));
        }
    };

    if (loading) return <div style={{ padding: '20px', fontFamily: retroTheme.fonts.main }}>Loading recruitment data...</div>;

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
                    <h1 style={{ margin: 0, fontSize: retroTheme.fonts.size.title }}>RECRUITMENT CENTER</h1>
                </div>

                {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', backgroundColor: '#ffeeee' }}>{error}</p>}

                {refCodeData && (
                    <div style={retroTheme.common.card}>
                        <div style={{
                            backgroundColor: retroTheme.colors.sectionHeaderBg,
                            padding: '10px',
                            borderBottom: `1px solid ${retroTheme.colors.borderLight}`,
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            YOUR ASSIGNED REFERRAL CODE
                        </div>
                        <div style={{ padding: '30px', textAlign: 'center' }}>
                            <p style={{ marginBottom: '20px' }}>Distribute this link to potential candidates:</p>
                            <div style={{
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                border: '2px dashed #ccc',
                                fontSize: retroTheme.fonts.size.large,
                                margin: '20px 0',
                                wordBreak: 'break-all',
                                fontFamily: 'monospace'
                            }}>
                                {`${window.location.origin}/join/${refCodeData.refCode}`}
                            </div>
                            <button onClick={handleCopyToClipboard} style={retroTheme.common.button}>
                                COPY LINK TO CLIPBOARD
                            </button>
                            <p style={{ marginTop: '30px', fontSize: retroTheme.fonts.size.small, color: retroTheme.colors.textLight }}>
                                CODE ID: <strong style={{ color: '#000' }}>{refCodeData.refCode}</strong>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesmanDashboard;