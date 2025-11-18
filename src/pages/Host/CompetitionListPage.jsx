// src/pages/Host/CompetitionListPage.jsx
import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom'; // --- ЗМІНА: ІМПОРТУЄМО LINK ---
import api from '../../services/api';

const CompetitionListPage = () => {
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newTitle, setNewTitle] = useState('');

    const fetchCompetitions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/competition');
            setCompetitions(response.data);
        } catch (err) {
            setError('Не вдалося завантажити змагання.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompetitions();
    }, []);

    const handleCreateCompetition = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        try {
            await api.post(`/competition/${newTitle}`);
            setNewTitle('');
            fetchCompetitions(); // Оновлюємо список
        } catch (err) {
            alert('Помилка створення змагання');
            console.error(err);
        }
    }

    if (loading) return <div>Завантаження...</div>;
    if (error) return <div style={{color: 'red'}}>{error}</div>;

    return (
        <div style={{padding: '20px', maxWidth: '1000px', margin: 'auto'}}>
            <Link to="/dashboard">{"<-- Назад на дашборд"}</Link>
            <h1 style={{marginTop: '20px'}}>Список Змагань</h1>

            <form onSubmit={handleCreateCompetition} style={{margin: '20px 0', display: 'flex', gap: '10px'}}>
                <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Назва нового змагання"
                    style={{padding: '10px', flexGrow: 1}}
                />
                <button type="submit" style={{padding: '10px 20px'}}>Створити</button>
            </form>

            <table border="1" style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
                <thead>
                <tr style={{backgroundColor: '#f2f2f2'}}>
                    <th style={{padding: '10px'}}>ID</th>
                    <th style={{padding: '10px'}}>Назва</th>
                    <th style={{padding: '10px'}}>Статус</th>
                    <th style={{padding: '10px'}}>Створено</th>
                    <th style={{padding: '10px'}}>Дії</th>
                </tr>
                </thead>
                <tbody>
                {competitions.length > 0 ? competitions.map((comp) => (
                    <tr key={comp.id}>
                        <td style={{padding: '10px'}}>{comp.id}</td>
                        <td style={{padding: '10px'}}>{comp.title}</td>
                        <td style={{padding: '10px'}}>{comp.status}</td>
                        <td style={{padding: '10px'}}>{new Date(comp.createdAt).toLocaleString()}</td>
                        <td style={{padding: '10px', textAlign: 'center'}}>
                            {/* --- ЗМІНА: КНОПКА СТАЛА ПОСИЛАННЯМ --- */}
                            <Link to={`/competitions/${comp.id}`}>
                                <button>Керувати</button>
                            </Link>
                        </td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Змагань не знайдено.</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default CompetitionListPage;