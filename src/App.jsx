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
// --- НОВИЙ ІМПОРТ ---
import CompetitionDetailPage from './pages/Host/CompetitionDetailPage.jsx';

function App() {
    const {user} = useAuth();

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/dashboard"/> : <LoginPage/>}/>

            <Route path="/" element={<ProtectedRoute/>}>
                <Route path="/dashboard" element={<Dashboard/>}/>

                <Route element={<RoleGuard roles={['HOST', 'FRONTMAN']}/>}>
                    <Route path="/competitions" element={<CompetitionListPage/>}/>
                    {/* --- НОВИЙ МАРШРУТ --- */}
                    <Route path="/competitions/:id" element={<CompetitionDetailPage/>}/>
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