// src/pages/Host/StaffPage.jsx
import React, {useState, useEffect, useCallback} from 'react';
import {Link} from 'react-router-dom';
import api from '../../services/api';
import retroTheme from '../../styles/retroTheme';

// List of roles available for invitation
const availableRoles = [
    'FRONTMAN', 'WORKER', 'SOLDIER', 'MANAGER', 'THE_OFFICER', 'SALESMAN', 'VIP'
];

const StaffPage = () => {
    // --- STATE ---
    const [invites, setInvites] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [email, setEmail] = useState('');
    const [role, setRole] = useState(availableRoles[0]);

    // State for success message and token display (Функціонал з першого коду)
    const [successInfo, setSuccessInfo] = useState({message: '', token: ''});

    // --- API CALLS ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Load all invites
            const invitesResponse = await api.get('/job-offer');
            setInvites(invitesResponse.data);

            // Load accepted staff
            const staffResponse = await api.get('/job-offer/staff');
            setStaff(staffResponse.data);
        } catch (err) {
            console.error("Error loading staff data:", err);
            alert("Failed to load data. Check console.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- HANDLERS ---
    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        // Скидаємо попереднє повідомлення про успіх
        setSuccessInfo({message: '', token: ''});

        if (!email) {
            alert("Email cannot be empty.");
            return;
        }
        try {
            // Відправляємо запит і отримуємо токен у відповіді
            const response = await api.post('/job-offer', {email, role});

            // Встановлюємо успішне повідомлення та токен для відображення
            setSuccessInfo({
                message: `Invitation sent to ${response.data.email}! Please provide the candidate with their unique token.`,
                token: response.data.token
            });

            setEmail(''); // Очищуємо поле
            fetchData(); // Оновлюємо таблиці (Функціонал з другого коду)
        } catch (err) {
            console.error("Error sending invite:", err);
            const errorMessage = err.response?.data?.error || "Unknown error";
            alert(`Error: ${errorMessage}`);
        }
    };

    // Функція копіювання токена (Функціонал з першого коду)
    const handleCopyToken = () => {
        if (successInfo.token) {
            navigator.clipboard.writeText(successInfo.token)
                .then(() => alert("Token copied to clipboard!"))
                .catch(err => console.error('Failed to copy token:', err));
        }
    };

    if (loading) return <div style={{padding: '20px', fontFamily: retroTheme.fonts.main}}>Loading personnel
        data...</div>;

    return (
        <div style={retroTheme.common.pageContainer}>
            <div style={{maxWidth: '1000px', margin: 'auto', padding: '20px'}}>
                <div style={{marginBottom: '20px'}}>
                    <Link to="/dashboard" style={retroTheme.common.link}>&lt;&lt; BACK TO DASHBOARD</Link>
                </div>

                <div style={{
                    backgroundColor: retroTheme.colors.headerBg,
                    border: `1px solid ${retroTheme.colors.border}`,
                    padding: '15px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <h1 style={{margin: 0, fontSize: retroTheme.fonts.size.title}}>PERSONNEL MANAGEMENT</h1>
                </div>

                {/* Invite Form */}
                <div style={retroTheme.common.card}>
                    <div style={{
                        backgroundColor: retroTheme.colors.sectionHeaderBg,
                        padding: '10px',
                        borderBottom: `1px solid ${retroTheme.colors.borderLight}`,
                        fontWeight: 'bold'
                    }}>
                        ISSUE NEW ASSIGNMENT
                    </div>
                    <div style={{padding: '20px'}}>
                        <form onSubmit={handleInviteSubmit}
                              style={{display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap'}}>
                            <div style={{flex: 2, minWidth: '200px'}}>
                                <input
                                    type="email"
                                    placeholder="Candidate Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    style={{...retroTheme.common.input, width: '100%'}}
                                />
                            </div>
                            <div style={{flex: 1, minWidth: '150px'}}>
                                <select
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    style={{...retroTheme.common.input, width: '100%'}}
                                >
                                    {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <button type="submit" style={retroTheme.common.button}>SEND OFFER</button>
                        </form>

                        {/* --- БЛОК УСПІХУ (З першого коду) --- */}
                        {successInfo.token && (
                            <div style={{
                                marginTop: '20px',
                                padding: '15px',
                                border: '1px solid #155724',
                                backgroundColor: '#d4edda',
                                color: '#155724',
                                borderRadius: '4px'
                            }}>
                                <p style={{margin: 0, fontWeight: 'bold'}}>{successInfo.message}</p>
                                <div style={{
                                    marginTop: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    flexWrap: 'wrap'
                                }}>
                                    <span style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #ccc',
                                        fontFamily: 'monospace',
                                        wordBreak: 'break-all'
                                    }}>
                                        {successInfo.token}
                                    </span>
                                    <button onClick={handleCopyToken} style={{
                                        ...retroTheme.common.button,
                                        backgroundColor: '#fff',
                                        color: '#333'
                                    }}>
                                        COPY
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ТАБЛИЦІ (З другого коду) --- */}

                {/* Active Invites Table */}
                <div style={{marginTop: '30px'}}>
                    <h2 style={{
                        fontSize: retroTheme.fonts.size.large,
                        borderBottom: `2px solid ${retroTheme.colors.border}`,
                        paddingBottom: '5px',
                        marginBottom: '15px'
                    }}>
                        PENDING OFFERS
                    </h2>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            backgroundColor: '#fff',
                            border: `1px solid ${retroTheme.colors.border}`
                        }}>
                            <thead>
                            <tr style={{backgroundColor: retroTheme.colors.headerBg}}>
                                <th style={{
                                    padding: '10px',
                                    border: `1px solid ${retroTheme.colors.border}`,
                                    textAlign: 'left'
                                }}>EMAIL
                                </th>
                                <th style={{
                                    padding: '10px',
                                    border: `1px solid ${retroTheme.colors.border}`,
                                    textAlign: 'left'
                                }}>ROLE
                                </th>
                                <th style={{
                                    padding: '10px',
                                    border: `1px solid ${retroTheme.colors.border}`,
                                    textAlign: 'left'
                                }}>STATUS
                                </th>
                                <th style={{
                                    padding: '10px',
                                    border: `1px solid ${retroTheme.colors.border}`,
                                    textAlign: 'left'
                                }}>ISSUED BY
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {invites.filter(i => i.offerStatus === 'AWAITING').map(invite => (
                                <tr key={`${invite.email}-${invite.role}`}>
                                    <td style={{
                                        padding: '8px',
                                        border: `1px solid ${retroTheme.colors.borderLight}`
                                    }}>{invite.email}</td>
                                    <td style={{
                                        padding: '8px',
                                        border: `1px solid ${retroTheme.colors.borderLight}`
                                    }}>{invite.role}</td>
                                    <td style={{
                                        padding: '8px',
                                        border: `1px solid ${retroTheme.colors.borderLight}`,
                                        color: '#b35900'
                                    }}>{invite.offerStatus}</td>
                                    <td style={{
                                        padding: '8px',
                                        border: `1px solid ${retroTheme.colors.borderLight}`
                                    }}>{invite.offeredBy.email}</td>
                                </tr>
                            ))}
                            {invites.filter(i => i.offerStatus === 'AWAITING').length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{
                                        padding: '15px',
                                        textAlign: 'center',
                                        color: retroTheme.colors.textLight
                                    }}>No pending offers.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Staff Table */}
                <div style={{marginTop: '30px'}}>
                    <h2 style={{
                        fontSize: retroTheme.fonts.size.large,
                        borderBottom: `2px solid ${retroTheme.colors.border}`,
                        paddingBottom: '5px',
                        marginBottom: '15px'
                    }}>
                        ACTIVE PERSONNEL
                    </h2>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            backgroundColor: '#fff',
                            border: `1px solid ${retroTheme.colors.border}`
                        }}>
                            <thead>
                            <tr style={{backgroundColor: retroTheme.colors.headerBg}}>
                                <th style={{
                                    padding: '10px',
                                    border: `1px solid ${retroTheme.colors.border}`,
                                    textAlign: 'left'
                                }}>EMAIL
                                </th>
                                <th style={{
                                    padding: '10px',
                                    border: `1px solid ${retroTheme.colors.border}`,
                                    textAlign: 'left'
                                }}>ROLE
                                </th>
                                <th style={{
                                    padding: '10px',
                                    border: `1px solid ${retroTheme.colors.border}`,
                                    textAlign: 'left'
                                }}>STATUS
                                </th>
                                <th style={{
                                    padding: '10px',
                                    border: `1px solid ${retroTheme.colors.border}`,
                                    textAlign: 'left'
                                }}>RECRUITED BY
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {staff.map(member => (
                                <tr key={`${member.email}-${member.role}`}>
                                    <td style={{
                                        padding: '8px',
                                        border: `1px solid ${retroTheme.colors.borderLight}`
                                    }}>{member.email}</td>
                                    <td style={{
                                        padding: '8px',
                                        border: `1px solid ${retroTheme.colors.borderLight}`
                                    }}>{member.role}</td>
                                    <td style={{
                                        padding: '8px',
                                        border: `1px solid ${retroTheme.colors.borderLight}`,
                                        color: 'green'
                                    }}>{member.offerStatus}</td>
                                    <td style={{
                                        padding: '8px',
                                        border: `1px solid ${retroTheme.colors.borderLight}`
                                    }}>{member.offeredBy.email}</td>
                                </tr>
                            ))}
                            {staff.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{
                                        padding: '15px',
                                        textAlign: 'center',
                                        color: retroTheme.colors.textLight
                                    }}>No active personnel found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffPage;