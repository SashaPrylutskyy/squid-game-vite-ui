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
// --- НОВИЙ ІМПОРТ ---
import StaffPage from './pages/Host/StaffPage.jsx';
// --- НОВИЙ ІМПОРТ для публічної сторінки ---
import AcceptOfferPage from './pages/Auth/AcceptOfferPage.jsx';

function App() {
    const {user} = useAuth();

    return (
        <Routes>
            {/* --- НОВИЙ ПУБЛІЧНИЙ МАРШРУТ --- */}
            <Route path="/accept-offer/:token" element={<AcceptOfferPage/>}/>
            <Route path="/login" element={user ? <Navigate to="/dashboard"/> : <LoginPage/>}/>

            <Route path="/" element={<ProtectedRoute/>}>
                <Route path="/dashboard" element={<Dashboard/>}/>

                <Route element={<RoleGuard roles={['HOST', 'FRONTMAN', 'MANAGER', 'THE_OFFICER']}/>}>
                    <Route path="/competitions" element={<CompetitionListPage/>}/>
                    <Route path="/competitions/:id" element={<CompetitionDetailPage/>}/>
                    {/* --- НОВИЙ ЗАХИЩЕНИЙ МАРШРУТ --- */}
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