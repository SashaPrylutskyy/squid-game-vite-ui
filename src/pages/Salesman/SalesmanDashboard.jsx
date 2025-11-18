// src/pages/Salesman/SalesmanDashboard.jsx
import React, {useState, useEffect, useCallback} from 'react';
import {Link} from 'react-router-dom';
import api from '../../services/api';

const SalesmanDashboard = () => {
    const [refCodeData, setRefCodeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRefCode = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/ref-code');
            setRefCodeData(response.data);
        } catch (err) {
            console.error("Помилка завантаження реферального коду:", err);
            setError(err.response?.data?.error || "Не вдалося завантажити дані.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRefCode();
    }, [fetchRefCode]);

    const handleCopyToClipboard = () => {
        // --- ЗМІНА ТУТ: referralCode -> refCode ---
        if (refCodeData?.refCode) {
            // --- ЗМІНА ТУТ: referralCode -> refCode ---
            const joinUrl = `${window.location.origin}/join/${refCodeData.refCode}`;
            navigator.clipboard.writeText(joinUrl)
                .then(() => alert("Посилання для реєстрації скопійовано в буфер обміну!"))
                .catch(err => console.error('Помилка копіювання:', err));
        }
    };

    if (loading) return <div>Завантаження...</div>;

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: 'auto'}}>
            <Link to="/dashboard">{"<-- Назад на дашборд"}</Link>
            <h1 style={{marginTop: '20px'}}>Ваше Реферальне Посилання</h1>

            {error && <p style={{color: 'red', border: '1px solid red', padding: '10px'}}>{error}</p>}

            {refCodeData && (
                <div style={{border: '1px solid #ccc', padding: '20px', textAlign: 'center'}}>
                    <p>Надішліть це посилання гравцям, щоб вони могли приєднатися до гри:</p>
                    <div style={{
                        padding: '15px',
                        backgroundColor: '#f2f2f2',
                        border: '1px dashed #aaa',
                        fontSize: '18px',
                        margin: '20px 0',
                        wordBreak: 'break-all'
                    }}>
                        {/* --- ЗМІНА ТУТ: referralCode -> refCode --- */}
                        {`${window.location.origin}/join/${refCodeData.refCode}`}
                    </div>
                    <button onClick={handleCopyToClipboard} style={{padding: '10px 20px', cursor: 'pointer'}}>
                        Скопіювати посилання
                    </button>
                    <p style={{marginTop: '20px', fontSize: '14px', color: '#555'}}>
                        {/* --- ЗМІНА ТУТ: referralCode -> refCode --- */}
                        Ваш код: <strong>{refCodeData.refCode}</strong>
                    </p>
                </div>
            )}
        </div>
    );
};

export default SalesmanDashboard;