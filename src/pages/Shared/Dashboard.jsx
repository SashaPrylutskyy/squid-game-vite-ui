// src/pages/Shared/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import retroTheme from '../../styles/retroTheme';

const Dashboard = () => {
    const { user, logout } = useAuth();

    const canManageStaff = ['HOST', 'FRONTMAN', 'MANAGER', 'THE_OFFICER'].includes(user?.role);
    const canManageCompetitions = ['HOST', 'FRONTMAN'].includes(user?.role);
    const isPlayer = user?.role === 'PLAYER';
    const isWorker = user?.role === 'WORKER';
    const isSalesman = user?.role === 'SALESMAN';
    const isVip = user?.role === 'VIP';

    const MenuLink = ({ to, label, description }) => (
        <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
                ...retroTheme.common.card,
                padding: '15px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'background-color 0.2s',
                cursor: 'pointer'
            }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e6f2ff'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
                <div style={{ fontWeight: 'bold', fontSize: retroTheme.fonts.size.large, marginBottom: '5px', color: retroTheme.colors.link }}>
                    {label}
                </div>
                {description && (
                    <div style={{ fontSize: retroTheme.fonts.size.small, color: retroTheme.colors.textLight }}>
                        {description}
                    </div>
                )}
            </div>
        </Link>
    );

    return (
        <div style={retroTheme.common.pageContainer}>
            <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
                {/* Header */}
                <div style={{
                    backgroundColor: retroTheme.colors.headerBg,
                    border: `1px solid ${retroTheme.colors.border}`,
                    padding: '15px',
                    marginBottom: '30px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: retroTheme.fonts.size.title }}>SYSTEM DASHBOARD</h1>
                        <div style={{ fontSize: retroTheme.fonts.size.small }}>USER: {user?.email} | ROLE: {user?.role}</div>
                    </div>
                    <button onClick={logout} style={{ ...retroTheme.common.button, borderColor: '#cc0000', color: '#cc0000' }}>
                        LOGOUT
                    </button>
                </div>

                {/* Menu Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px'
                }}>
                    {canManageCompetitions && (
                        <MenuLink
                            to="/competitions"
                            label="COMPETITION CONTROL"
                            description="Manage games, rounds, and status."
                        />
                    )}

                    {canManageStaff && (
                        <MenuLink
                            to="/staff"
                            label="STAFF MANAGEMENT"
                            description="Oversee personnel and assignments."
                        />
                    )}

                    {isPlayer && (
                        <MenuLink
                            to="/my-game"
                            label="PLAYER TERMINAL"
                            description="View status and voting interface."
                        />
                    )}

                    {isWorker && (
                        <MenuLink
                            to="/my-tasks"
                            label="WORKER TASKS"
                            description="View assigned duties."
                        />
                    )}

                    {isSalesman && (
                        <MenuLink
                            to="/referral"
                            label="RECRUITMENT"
                            description="Access referral codes."
                        />
                    )}

                    {isVip && (
                        <MenuLink
                            to="/invest"
                            label="VIP LOUNGE"
                            description="Make investments."
                        />
                    )}
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center', fontSize: retroTheme.fonts.size.small, color: '#999' }}>
                    SYSTEM VERSION 1.0.4 // SECURE CONNECTION ESTABLISHED
                </div>
            </div>
        </div>
    );
};

export default Dashboard;