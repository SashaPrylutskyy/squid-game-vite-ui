// src/pages/Auth/AcceptOfferPage.jsx
import React, {useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import api from '../../services/api';

const AcceptOfferPage = () => {
    const {token} = useParams(); // Отримуємо токен з URL
    const navigate = useNavigate();

    // Стан для полів форми
    const [formData, setFormData] = useState({
        password: '',
        firstName: '',
        lastName: '',
        birthday: '',
        sex: 'MALE', // Значення за замовчуванням
        profilePhoto: '' // Це поле можна зробити складнішим (завантаження файлу) або поки що залишити текстовим
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post(`/job-offer/${token}/accept`, formData);
            setSuccess('Ваш акаунт успішно створено! Зараз ви будете перенаправлені на сторінку входу.');
            // Перенаправляємо на сторінку логіну через 3 секунди
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Не вдалося прийняти запрошення. Можливо, воно застаріло.";
            setError(errorMessage);
            console.error(err);
        }
    };

    if (success) {
        return <div style={{padding: '50px', color: 'green', textAlign: 'center'}}>{success}</div>;
    }

    return (
        <div style={{padding: '50px', maxWidth: '500px', margin: 'auto'}}>
            <h1>Завершення Реєстрації</h1>
            <p>Будь ласка, заповніть дані, щоб активувати ваш акаунт.</p>
            <form onSubmit={handleSubmit}>
                {/* Додаємо поля форми одне за одним */}
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

                <button type="submit" style={{width: '100%', padding: '12px'}}>Завершити реєстрацію</button>
            </form>
        </div>
    );
};

export default AcceptOfferPage;