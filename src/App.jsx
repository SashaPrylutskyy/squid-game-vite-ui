// src/App.jsx
import React from 'react';
import {Routes, Route, Navigate, Link} from 'react-router-dom'; // Додано Link
import {useAuth} from './contexts/AuthContext.jsx';

// Компоненти для захисту маршрутів
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';

// --- Імпорт всіх сторінок ---

// Публічні сторінки та сторінки авторизації
import LoginPage from './pages/Auth/LoginPage.jsx';
import RegisterPage from './pages/Auth/RegisterPage.jsx';
import JoinPage from './pages/Auth/JoinPage.jsx';
import AcceptOfferPage from './pages/Auth/AcceptOfferPage.jsx';

// Загальні сторінки для авторизованих користувачів
import Dashboard from './pages/Shared/Dashboard.jsx';

// Сторінки для адміністративних ролей (HOST, FRONTMAN, etc.)
import CompetitionListPage from './pages/Host/CompetitionListPage.jsx';
import CompetitionDetailPage from './pages/Host/CompetitionDetailPage.jsx';
import StaffPage from './pages/Host/StaffPage.jsx';

// Сторінки для специфічних ролей
import PlayerDashboard from './pages/Player/PlayerDashboard.jsx';
import WorkerDashboard from './pages/Worker/WorkerDashboard.jsx';


function App() {
    const {user} = useAuth();

    return (
        <Routes>
            {/* ====================================================== */}
            {/* ================ ПУБЛІЧНІ МАРШРУТИ =================== */}
            {/* ====================================================== */}

            <Route path="/login" element={user ? <Navigate to="/dashboard"/> : <LoginPage/>}/>
            <Route path="/register" element={user ? <Navigate to="/dashboard"/> : <RegisterPage/>}/>
            <Route path="/join/:refCode" element={user ? <Navigate to="/dashboard"/> : <JoinPage/>}/>
            <Route path="/accept-offer/:token" element={user ? <Navigate to="/dashboard"/> : <AcceptOfferPage/>}/>


            {/* ====================================================== */}
            {/* ================ ЗАХИЩЕНІ МАРШРУТИ ================== */}
            {/* ====================================================== */}
            <Route path="/" element={<ProtectedRoute/>}>

                {/* Загальний дашборд, доступний усім авторизованим */}
                <Route path="/dashboard" element={<Dashboard/>}/>

                {/* --- Маршрути для Керівництва (HOST, FRONTMAN, MANAGER, THE_OFFICER) --- */}
                <Route element={<RoleGuard roles={['HOST', 'FRONTMAN', 'MANAGER', 'THE_OFFICER']}/>}>
                    <Route path="/staff" element={<StaffPage/>}/>
                </Route>

                {/* --- Маршрути тільки для вищих ролей (HOST, FRONTMAN) --- */}
                <Route element={<RoleGuard roles={['HOST', 'FRONTMAN']}/>}>
                    <Route path="/competitions" element={<CompetitionListPage/>}/>
                    <Route path="/competitions/:id" element={<CompetitionDetailPage/>}/>
                </Route>

                {/* --- Маршрути для Гравця (PLAYER) --- */}
                <Route element={<RoleGuard roles={['PLAYER']}/>}>
                    <Route path="/my-game" element={<PlayerDashboard/>}/>
                </Route>

                {/* --- Маршрути для Працівника (WORKER) --- */}
                <Route element={<RoleGuard roles={['WORKER']}/>}>
                    <Route path="/my-tasks" element={<WorkerDashboard/>}/>
                </Route>

                {/* Перенаправлення з кореневого шляху на дашборд */}
                <Route path="/" element={<Navigate to="/dashboard" exact/>}/>

                {/* Сторінка "Не знайдено" для всіх інших шляхів */}
                <Route path="*" element={
                    <div style={{textAlign: 'center', marginTop: '50px'}}>
                        <h1>404 - Сторінку не знайдено</h1>
                        <Link to="/dashboard">Повернутися на головну</Link>
                    </div>
                }/>
            </Route>
        </Routes>
    );
}

export default App;