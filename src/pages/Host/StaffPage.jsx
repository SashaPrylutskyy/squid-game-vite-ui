// src/pages/Host/StaffPage.jsx
import React, {useState, useEffect, useCallback} from 'react';
import {Link} from 'react-router-dom';
import api from '../../services/api';

// Список ролей, доступних для запрошення, згідно з документацією
const availableRoles = [
    'FRONTMAN', 'WORKER', 'SOLDIER', 'MANAGER', 'THE_OFFICER', 'SALESMAN', 'VIP'
];

const StaffPage = () => {
    const [invites, setInvites] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    // Стан для форми
    const [email, setEmail] = useState('');
    const [role, setRole] = useState(availableRoles[0]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Завантажуємо всі запрошення (включно з прийнятими)
            const invitesResponse = await api.get('/job-offer');
            setInvites(invitesResponse.data);

            // Завантажуємо тільки прийняті (штат)
            const staffResponse = await api.get('/job-offer/staff');
            setStaff(staffResponse.data);
        } catch (err) {
            console.error("Помилка завантаження даних персоналу:", err);
            alert("Не вдалося завантажити дані. Перевірте консоль.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            alert("Email не може бути порожнім.");
            return;
        }
        try {
            await api.post('/job-offer', {email, role});
            alert(`Запрошення для ${email} на роль ${role} успішно надіслано!`);
            setEmail(''); // Очищуємо форму
            fetchData(); // Оновлюємо списки
        } catch (err) {
            console.error("Помилка відправки запрошення:", err);
            // Бекенд може повертати більш детальну помилку в err.response.data.error
            const errorMessage = err.response?.data?.error || "Невідома помилка";
            alert(`Помилка: ${errorMessage}`);
        }
    };

    if (loading) return <div>Завантаження...</div>;

    return (
        <div style={{padding: '20px', maxWidth: '1200px', margin: 'auto'}}>
            <Link to="/dashboard">{"<-- Назад на дашборд"}</Link>
            <h1 style={{marginTop: '20px'}}>Керування Персоналом</h1>

            {/* Форма для відправки запрошень */}
            <div style={{border: '1px solid #ccc', padding: '20px', backgroundColor: '#f9f9f9'}}>
                <h2>Надіслати запрошення</h2>
                <form onSubmit={handleInviteSubmit} style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                    <input
                        type="email"
                        placeholder="Email кандидата"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{padding: '10px', flex: 2}}
                    />
                    <select value={role} onChange={e => setRole(e.target.value)} style={{padding: '10px', flex: 1}}>
                        {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button type="submit" style={{padding: '10px 20px'}}>Надіслати</button>
                </form>
            </div>

            {/* Таблиця активних запрошень */}
            <div style={{marginTop: '30px'}}>
                <h2>Активні Запрошення</h2>
                <table border="1" style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                    <tr>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Статус</th>
                        <th>Запросив(ла)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {invites.filter(i => i.offerStatus === 'AWAITING').map(invite => (
                        <tr key={`${invite.email}-${invite.role}`}>
                            <td>{invite.email}</td>
                            <td>{invite.role}</td>
                            <td>{invite.offerStatus}</td>
                            <td>{invite.offeredBy.email}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Таблиця поточного штату */}
            <div style={{marginTop: '30px'}}>
                <h2>Поточний Штат</h2>
                <table border="1" style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                    <tr>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Статус</th>
                        <th>Запросив(ла)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {staff.map(member => (
                        <tr key={`${member.email}-${member.role}`}>
                            <td>{member.email}</td>
                            <td>{member.role}</td>
                            <td>{member.offerStatus}</td>
                            <td>{member.offeredBy.email}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffPage;