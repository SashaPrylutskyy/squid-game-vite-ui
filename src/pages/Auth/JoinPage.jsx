// src/pages/Auth/JoinPage.jsx
import React, {useState, useEffect} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import api from '../../services/api';

const JoinPage = () => {
    const {refCode} = useParams(); // Отримуємо код з URL
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

    // Встановлюємо refCode в стан, коли компонент завантажується
    useEffect(() => {
        if (refCode) {
            setFormData(prev => ({...prev, refCode}));
        }
    }, [refCode]);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/auth/join', formData);
            setSuccess('Ви успішно приєдналися до гри! Тепер ви можете увійти в систему.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Помилка реєстрації. Можливо, реферальний код недійсний.";
            setError(errorMessage);
            console.error(err);
        }
    };

    if (success) {
        return <div style={{padding: '50px', color: 'green', textAlign: 'center'}}>{success}</div>;
    }

    return (
        <div style={{padding: '50px', maxWidth: '500px', margin: 'auto'}}>
            <h1>Приєднатися до гри</h1>
            <form onSubmit={handleSubmit}>
                <div style={{marginBottom: '15px'}}>
                    <label>Реферальний код</label>
                    <input type="text" name="refCode" value={formData.refCode} readOnly
                           style={{width: '100%', padding: '8px', backgroundColor: '#eee'}}/>
                </div>
                {/* Решта полів форми аналогічні до попередньої */}
                <div style={{marginBottom: '15px'}}>
                    <label>Email</label>
                    <input type="email" name="email" onChange={handleChange} required
                           style={{width: '100%', padding: '8px'}}/>
                </div>
                <div style={{marginBottom: '15px'}}>
                    <label>Пароль</label>
                    <input type="password" name="password" onChange={handleChange} required
                           style={{width: '100%', padding: '8px'}}/>
                </div>
                <div style={{marginBottom: '15px'}}>
                    <label>Ім'я</label>
                    <input type="text" name="firstName" onChange={handleChange} required
                           style={{width: '100%', padding: '8px'}}/>
                </div>
                <div style={{marginBottom: '15px'}}>
                    <label>Прізвище</label>
                    <input type="text" name="lastName" onChange={handleChange} required
                           style={{width: '100%', padding: '8px'}}/>
                </div>
                <div style={{marginBottom: '15px'}}>
                    <label>Дата народження</label>
                    <input type="date" name="birthday" onChange={handleChange} required
                           style={{width: '100%', padding: '8px'}}/>
                </div>
                <div style={{marginBottom: '15px'}}>
                    <label>Стать</label>
                    <select name="sex" value={formData.sex} onChange={handleChange}
                            style={{width: '100%', padding: '8px'}}>
                        <option value="MALE">Чоловік</option>
                        <option value="FEMALE">Жінка</option>
                    </select>
                </div>
                <div style={{marginBottom: '15px'}}>
                    <label>Фото профілю (URL)</label>
                    <input type="text" name="profilePhoto" onChange={handleChange}
                           style={{width: '100%', padding: '8px'}}/>
                </div>

                {error && <p style={{color: 'red'}}>{error}</p>}

                <button type="submit" style={{width: '100%', padding: '12px'}}>Приєднатися</button>
            </form>
            <div style={{textAlign: 'center', marginTop: '20px'}}>
                <p>Вже є акаунт? <Link to="/login">Увійти</Link></p>
            </div>
        </div>
    );
};

export default JoinPage;