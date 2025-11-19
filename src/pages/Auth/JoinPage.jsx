// src/pages/Auth/JoinPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import retroTheme from '../../styles/retroTheme';

const JoinPage = () => {
    const { refCode } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        refCode: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        birthday: '',
        sex: 'MALE',
        profilePhoto: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (refCode) {
            setFormData(prev => ({ ...prev, refCode }));
        }
    }, [refCode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/auth/join', formData);
            setSuccess('Successfully joined the game! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Registration failed. Invalid referral code.";
            setError(errorMessage);
            console.error(err);
        }
    };

    if (success) {
        return (
            <div style={retroTheme.common.pageContainer}>
                <div style={{ padding: '50px', textAlign: 'center' }}>
                    <div style={{
                        ...retroTheme.common.card,
                        maxWidth: '400px',
                        margin: 'auto',
                        backgroundColor: '#e8f5e9',
                        borderColor: 'green'
                    }}>
                        <h3 style={{ color: 'green' }}>WELCOME, PLAYER</h3>
                        <p>{success}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={retroTheme.common.pageContainer}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '50px',
                paddingBottom: '50px'
            }}>
                <div style={{
                    ...retroTheme.common.card,
                    width: '450px',
                    padding: '0',
                    backgroundColor: retroTheme.colors.contentBackground
                }}>
                    <div style={{
                        backgroundColor: '#ffcccc', // Slightly reddish for player join
                        padding: '5px 10px',
                        borderBottom: `1px solid ${retroTheme.colors.borderLight} `,
                        fontWeight: 'bold',
                        fontSize: retroTheme.fonts.size.large,
                        color: '#b30000',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <span>PLAYER ENLISTMENT FORM</span>
                        <Link to="/login" style={{ textDecoration: 'none', color: '#b30000' }}>x</Link>
                    </div>

                    <div style={{ padding: '20px' }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>REFERRAL CODE</label>
                                <input type="text" name="refCode" value={formData.refCode} readOnly
                                    style={{ ...retroTheme.common.input, backgroundColor: '#eee', color: '#555' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1, marginBottom: '15px' }}>
                                    <label style={labelStyle}>FIRST NAME</label>
                                    <input type="text" name="firstName" onChange={handleChange} required style={retroTheme.common.input} />
                                </div>
                                <div style={{ flex: 1, marginBottom: '15px' }}>
                                    <label style={labelStyle}>LAST NAME</label>
                                    <input type="text" name="lastName" onChange={handleChange} required style={retroTheme.common.input} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>EMAIL ADDRESS</label>
                                <input type="email" name="email" onChange={handleChange} required style={retroTheme.common.input} />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>PASSWORD</label>
                                <input type="password" name="password" onChange={handleChange} required style={retroTheme.common.input} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1, marginBottom: '15px' }}>
                                    <label style={labelStyle}>BIRTHDAY</label>
                                    <input type="date" name="birthday" onChange={handleChange} required style={retroTheme.common.input} />
                                </div>
                                <div style={{ flex: 1, marginBottom: '15px' }}>
                                    <label style={labelStyle}>SEX</label>
                                    <select name="sex" value={formData.sex} onChange={handleChange} style={retroTheme.common.input}>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={labelStyle}>PROFILE PHOTO URL</label>
                                <input type="text" name="profilePhoto" onChange={handleChange} style={retroTheme.common.input} placeholder="http://..." />
                            </div>

                            {error && (
                                <div style={{
                                    color: retroTheme.colors.error,
                                    marginBottom: '15px',
                                    fontSize: retroTheme.fonts.size.small,
                                    textAlign: 'center',
                                    border: '1px dashed red',
                                    padding: '5px'
                                }}>
                                    [!] {error}
                                </div>
                            )}

                            <button type="submit" style={{ ...retroTheme.common.button, width: '100%', backgroundColor: '#ffe6e6', borderColor: '#ffb3b3' }}>
                                JOIN THE GAME
                            </button>
                        </form>
                    </div>

                    <div style={{
                        backgroundColor: '#fff5f5',
                        borderTop: `1px solid ${retroTheme.colors.borderLight} `,
                        padding: '10px',
                        textAlign: 'center',
                        fontSize: retroTheme.fonts.size.small
                    }}>
                        Already have an account? <Link to="/login" style={retroTheme.common.link}>Login here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    marginBottom: '3px',
    fontWeight: 'bold',
    fontSize: retroTheme.fonts.size.small,
    color: retroTheme.colors.textLight
};

export default JoinPage;