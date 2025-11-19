// src/pages/Auth/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import api from '../../services/api';
import retroTheme from '../../styles/retroTheme';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password.');
            console.error(err);
        }
    };

    return (
        <div style={retroTheme.common.pageContainer}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
                flexDirection: 'column'
            }}>
                <div style={{
                    ...retroTheme.common.card,
                    width: '350px',
                    padding: '0',
                    backgroundColor: retroTheme.colors.contentBackground
                }}>
                    <div style={{
                        backgroundColor: retroTheme.colors.sectionHeaderBg,
                        padding: '5px 10px',
                        borderBottom: `1px solid ${retroTheme.colors.borderLight}`,
                        fontWeight: 'bold',
                        fontSize: retroTheme.fonts.size.large,
                        color: retroTheme.colors.text
                    }}>
                        SYSTEM LOGIN
                    </div>

                    <div style={{ padding: '20px' }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '5px',
                                    fontWeight: 'bold',
                                    fontSize: retroTheme.fonts.size.small,
                                    color: retroTheme.colors.textLight
                                }}>USERNAME (EMAIL)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={retroTheme.common.input}
                                    placeholder="enter email..."
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '5px',
                                    fontWeight: 'bold',
                                    fontSize: retroTheme.fonts.size.small,
                                    color: retroTheme.colors.textLight
                                }}>PASSWORD</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={retroTheme.common.input}
                                    placeholder="enter password..."
                                />
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

                            <button type="submit" style={{ ...retroTheme.common.button, width: '100%' }}>
                                LOGIN &gt;&gt;
                            </button>
                        </form>
                    </div>

                    <div style={{
                        backgroundColor: '#f9f9f9',
                        borderTop: `1px solid ${retroTheme.colors.borderLight}`,
                        padding: '10px',
                        textAlign: 'center',
                        fontSize: retroTheme.fonts.size.small
                    }}>
                        <p style={{ margin: '5px 0' }}>
                            New user? <Link to="/register" style={retroTheme.common.link}>Register (HOST/VIP)</Link>
                        </p>
                        <p style={{ margin: '5px 0', color: retroTheme.colors.textLight }}>
                            Have a referral code? Check your invite link.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '20px', color: retroTheme.colors.textLight, fontSize: retroTheme.fonts.size.small }}>
                    &copy; 1999-2025 SQUID SYSTEM INC.
                </div>
            </div>
        </div>
    );
};

export default LoginPage;