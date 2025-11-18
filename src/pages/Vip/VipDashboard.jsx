// src/pages/Vip/VipDashboard.jsx
import React, {useState, useEffect, useCallback} from 'react';
import {Link} from 'react-router-dom';
import api from '../../services/api';

const VipDashboard = () => {
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedCompetition, setSelectedCompetition] = useState('');
    const [amount, setAmount] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/competition');
            const activeCompetitions = response.data.filter(c => c.status === 'PENDING' || c.status === 'ACTIVE');
            setCompetitions(activeCompetitions);
            if (activeCompetitions.length > 0) {
                setSelectedCompetition(activeCompetitions[0].id);
            }
        } catch (err) {
            console.error("Помилка завантаження змагань:", err);
            setError(err.response?.data?.error || "Не вдалося завантажити список змагань.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDepositSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCompetition || !amount || amount <= 0) {
            alert("Будь ласка, оберіть змагання та введіть коректну суму.");
            return;
        }

        try {
            await api.post('/transaction/deposit', {
                competitionId: Number(selectedCompetition),
                amount: Number(amount)
            });
            alert(`Внесок у розмірі ${amount} успішно зроблено!`);
            setAmount('');
        } catch (err) {
            console.error("Помилка при здійсненні внеску:", err);
            alert(err.response?.data?.error || "Сталася помилка.");
        }
    };

    if (loading) return <div>Завантаження...</div>;

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: 'auto'}}>
            <Link to="/dashboard">{"<-- Назад на дашборд"}</Link>
            <h1 style={{marginTop: '20px'}}>Панель Інвестора (VIP)</h1>

            {error && <p style={{color: 'red', border: '1px solid red', padding: '10px'}}>{error}</p>}

            {!error && competitions.length === 0 && !loading && (
                <p>Наразі немає активних змагань для інвестування.</p>
            )}

            {!error && competitions.length > 0 && (
                <div style={{border: '1px solid #ccc', padding: '20px'}}>
                    <h2>Зробити Внесок</h2>
                    <form onSubmit={handleDepositSubmit}>
                        <div style={{marginBottom: '15px'}}>
                            <label>Оберіть змагання</label>
                            <select
                                value={selectedCompetition}
                                onChange={e => setSelectedCompetition(e.target.value)}
                                style={{width: '100%', padding: '10px', marginTop: '5px'}}
                            >
                                {competitions.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.title} (Статус: {c.status})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{marginBottom: '15px'}}>
                            <label>Сума внеску</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="Введіть суму"
                                min="1"
                                required
                                style={{width: '100%', padding: '10px', marginTop: '5px'}}
                            />
                        </div>
                        <button type="submit" style={{width: '100%', padding: '12px', cursor: 'pointer'}}>
                            Інвестувати
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default VipDashboard;