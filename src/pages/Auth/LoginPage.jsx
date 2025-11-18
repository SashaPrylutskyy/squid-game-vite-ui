// src/pages/Auth/LoginPage.jsx
import React, {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext.jsx';
import api from '../../services/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', {email, password});
            login(response.data);
            navigate('/dashboard');
        } catch (err) {
            setError('Неправильний email або пароль.');
            console.error(err);
        }
    };

    return (
        <div style={{
            padding: '50px',
            maxWidth: '400px',
            margin: 'auto',
            border: '1px solid #ccc',
            borderRadius: '8px',
            marginTop: '100px'
        }}>
            <h1>Вхід в систему</h1>
            <form onSubmit={handleSubmit}>
                {/* --- ПОВЕРТАЄМО ПОЛЯ НАЗАД --- */}
                <div style={{marginBottom: '10px'}}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{width: '100%', padding: '8px', marginTop: '5px'}}
                    />
                </div>
                <div style={{marginBottom: '15px'}}>
                    <label>Пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{width: '100%', padding: '8px', marginTop: '5px'}}
                    />
                </div>
                {error && <p style={{color: 'red'}}>{error}</p>}
                <button type="submit" style={{width: '100%', padding: '10px 20px', cursor: 'pointer'}}>
                    Увійти
                </button>
            </form>

            {/* --- ОНОВЛЕНИЙ БЛОК З ПОСИЛАННЯМИ --- */}
            <div style={{textAlign: 'center', marginTop: '20px', fontSize: '14px'}}>
                <p style={{marginBottom: '10px'}}>
                    Ще не маєте акаунту? <Link to="/register">Зареєструватися (HOST/VIP)</Link>
                </p>
                <p>
                    Маєте реферальний код гравця? <br/>
                    Перейдіть за посиланням, яке вам надали.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;