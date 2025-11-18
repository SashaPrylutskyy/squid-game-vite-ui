// src/pages/Vip/VipDashboard.jsx
import React, {useState, useEffect, useCallback} from 'react';
import {Link} from 'react-router-dom';
import api from '../../services/api';

const VipDashboard = () => {
    const [allCompetitions, setAllCompetitions] = useState([]);
    const [fundedCompetitions, setFundedCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedCompetition, setSelectedCompetition] = useState('');
    const [amount, setAmount] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const allCompetitionsResponse = await api.get('/competition/list-all');
            const competitionsData = allCompetitionsResponse.data;

            // --- ЗМІНА ТУТ: ВИДАЛЕНО ФІЛЬТРАЦІЮ ---
            // Тепер ми використовуємо весь список, який прийшов з бекенду.
            setAllCompetitions(competitionsData);

            // Встановлюємо перше змагання як обране за замовчуванням, якщо список не порожній
            if (competitionsData.length > 0) {
                setSelectedCompetition(competitionsData[0].id);
            }

            // Запит на отримання історії внесків (без змін)
            const fundedResponse = await api.get('/transaction/my-deposits');
            setFundedCompetitions(fundedResponse.data);

        } catch (err) {
            console.error("Помилка завантаження даних:", err);
            setError(err.response?.data?.error || "Не вдалося завантажити дані.");
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
            fetchData();
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

            {!error && allCompetitions.length > 0 ? (
                <div style={{border: '1px solid #ccc', padding: '20px', marginBottom: '30px'}}>
                    <h2>Зробити Внесок</h2>
                    <form onSubmit={handleDepositSubmit}>
                        <div style={{marginBottom: '15px'}}>
                            <label>Оберіть змагання</label>
                            <select
                                value={selectedCompetition}
                                onChange={e => setSelectedCompetition(e.target.value)}
                                style={{width: '100%', padding: '10px', marginTop: '5px'}}
                            >
                                {allCompetitions.map(c => (
                                    // --- ЗМІНА ТУТ: НОВИЙ ФОРМАТ ВІДОБРАЖЕННЯ ---
                                    <option key={c.id} value={c.id}>
                                        {`${c.createdBy.email} | ${c.title} (Статус: ${c.status})`}
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
            ) : (
                !error && !loading && <p>Наразі немає активних змагань для інвестування.</p>
            )}

            <div>
                <h2>Ваші Інвестиції</h2>
                {!error && fundedCompetitions.length > 0 ? (
                    <table border="1" style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                        <tr style={{backgroundColor: '#f2f2f2'}}>
                            <th style={{padding: '10px'}}>Змагання</th>
                            <th style={{padding: '10px'}}>Сума</th>
                            <th style={{padding: '10px'}}>Дата</th>
                        </tr>
                        </thead>
                        <tbody>
                        {fundedCompetitions.map(tx => (
                            <tr key={tx.id}>
                                <td style={{padding: '10px'}}>{tx.competition.title}</td>
                                <td style={{padding: '10px'}}>{tx.amount.toLocaleString()}</td>
                                <td style={{padding: '10px'}}>{new Date(tx.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    !error && !loading &&
                    <p>Ви ще не зробили жодних внесків. Секція з'явиться тут, щойно ви створите ендпоінт
                        /api/transaction/my-deposits.</p>
                )}
            </div>
        </div>
    );
};

export default VipDashboard;