// src/pages/Host/CompetitionListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import retroTheme from '../../styles/retroTheme';

const CompetitionListPage = () => {
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newTitle, setNewTitle] = useState('');

    const fetchCompetitions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/competition');
            setCompetitions(response.data);
        } catch (err) {
            setError('Failed to load competitions.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompetitions();
    }, []);

    const handleCreateCompetition = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        try {
            await api.post(`/competition/${newTitle}`);
            setNewTitle('');
            fetchCompetitions();
        } catch (err) {
            alert('Error creating competition');
            console.error(err);
        }
    }

    if (loading) return <div style={{ padding: '20px', fontFamily: retroTheme.fonts.main }}>Loading system data...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red', fontFamily: retroTheme.fonts.main }}>{error}</div>;

    return (
        <div style={retroTheme.common.pageContainer}>
            <div style={{ maxWidth: '1000px', margin: 'auto', padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <Link to="/dashboard" style={retroTheme.common.link}>&lt;&lt; BACK TO DASHBOARD</Link>
                </div>

                <div style={{
                    backgroundColor: retroTheme.colors.headerBg,
                    border: `1px solid ${retroTheme.colors.border}`,
                    padding: '10px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h1 style={{ margin: 0, fontSize: retroTheme.fonts.size.title }}>COMPETITION MANAGEMENT SYSTEM</h1>
                    <div style={{ fontSize: retroTheme.fonts.size.small }}>USER: HOST</div>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    {/* Sidebar / Actions */}
                    <div style={{ width: '250px' }}>
                        <div style={retroTheme.common.card}>
                            <div style={{
                                backgroundColor: retroTheme.colors.sectionHeaderBg,
                                padding: '5px',
                                borderBottom: `1px solid ${retroTheme.colors.borderLight}`,
                                fontWeight: 'bold',
                                marginBottom: '10px'
                            }}>
                                CREATE NEW
                            </div>
                            <form onSubmit={handleCreateCompetition}>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: retroTheme.fonts.size.small }}>TITLE:</label>
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="Enter title..."
                                        style={retroTheme.common.input}
                                    />
                                </div>
                                <button type="submit" style={{ ...retroTheme.common.button, width: '100%' }}>
                                    INITIALIZE
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Main Content / List */}
                    <div style={{ flex: 1 }}>
                        <div style={retroTheme.common.card}>
                            <div style={{
                                backgroundColor: retroTheme.colors.sectionHeaderBg,
                                padding: '5px',
                                borderBottom: `1px solid ${retroTheme.colors.borderLight}`,
                                fontWeight: 'bold',
                                marginBottom: '10px'
                            }}>
                                ACTIVE COMPETITIONS DATABASE
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: retroTheme.fonts.size.normal }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#e0e0e0', textAlign: 'left' }}>
                                        <th style={thStyle}>ID</th>
                                        <th style={thStyle}>TITLE</th>
                                        <th style={thStyle}>STATUS</th>
                                        <th style={thStyle}>CREATED</th>
                                        <th style={thStyle}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {competitions.length > 0 ? competitions.map((comp) => (
                                        <tr key={comp.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={tdStyle}>#{comp.id}</td>
                                            <td style={tdStyle}><strong>{comp.title}</strong></td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    backgroundColor: comp.status === 'COMPLETED' ? '#e8f5e9' : '#e3f2fd',
                                                    color: comp.status === 'COMPLETED' ? 'green' : 'blue',
                                                    padding: '2px 5px',
                                                    borderRadius: '3px',
                                                    fontSize: '10px',
                                                    border: `1px solid ${comp.status === 'COMPLETED' ? 'green' : 'blue'}`
                                                }}>
                                                    {comp.status}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>{new Date(comp.createdAt).toLocaleDateString()}</td>
                                            <td style={tdStyle}>
                                                <Link to={`/competitions/${comp.id}`} style={{ textDecoration: 'none' }}>
                                                    <button style={retroTheme.common.button}>MANAGE</button>
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                                                No records found in database.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const thStyle = {
    padding: '8px',
    borderBottom: '2px solid #ccc',
    fontSize: '11px'
};

const tdStyle = {
    padding: '8px',
    borderBottom: '1px solid #eee'
};

export default CompetitionListPage;