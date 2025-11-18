// src/App.jsx
import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import {useAuth} from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';

// Імпортуємо сторінки
import LoginPage from './pages/Auth/LoginPage.jsx';
import CompetitionListPage from './pages/Host/CompetitionListPage.jsx';
import PlayerDashboard from './pages/Player/PlayerDashboard.jsx';
import Dashboard from './pages/Shared/Dashboard.jsx';
import CompetitionDetailPage from './pages/Host/CompetitionDetailPage.jsx';
import StaffPage from './pages/Host/StaffPage.jsx';
import AcceptOfferPage from './pages/Auth/AcceptOfferPage.jsx';
// --- НОВІ ІМПОРТИ ---
import RegisterPage from './pages/Auth/RegisterPage.jsx';
import JoinPage from './pages/Auth/JoinPage.jsx';

function App() {
    const {user} = useAuth();

    return (
        <Routes>
            {/* --- НОВІ ПУБЛІЧНІ МАРШРУТИ --- */}
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/join/:refCode" element={<JoinPage/>}/>
            <Route path="/accept-offer/:token" element={<AcceptOfferPage/>}/>
            <Route path="/login" element={user ? <Navigate to="/dashboard"/> : <LoginPage/>}/>

            {/* Захищені маршрути залишаються без змін */}
            <Route path="/" element={<ProtectedRoute/>}>
                <Route path="/dashboard" element={<Dashboard/>}/>

                <Route element={<RoleGuard roles={['HOST', 'FRONTMAN', 'MANAGER', 'THE_OFFICER']}/>}>
                    <Route path="/competitions" element={<CompetitionListPage/>}/>
                    <Route path="/competitions/:id" element={<CompetitionDetailPage/>}/>
                    <Route path="/staff" element={<StaffPage/>}/>
                </Route>

                <Route element={<RoleGuard roles={['PLAYER']}/>}>
                    <Route path="/my-game" element={<PlayerDashboard/>}/>
                </Route>

                <Route path="/" element={<Navigate to="/dashboard"/>}/>
                <Route path="*" element={<div>Сторінку не знайдено</div>}/>
            </Route>
        </Routes>
    );
}

export default App;