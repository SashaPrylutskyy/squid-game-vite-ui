// src/pages/Host/CompetitionListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
// ... (код такий самий, як у попередній відповіді)
const CompetitionListPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchCompetitions();
  }, []);

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <Link to="/dashboard">{"<-- Назад на дашборд"}</Link>
      <h1 style={{ marginTop: '20px' }}>Список Змагань</h1>
      
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '10px' }}>ID</th>
            <th style={{ padding: '10px' }}>Назва</th>
            <th style={{ padding: '10px' }}>Статус</th>
            <th style={{ padding: '10px' }}>Створено</th>
            <th style={{ padding: '10px' }}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {competitions.length > 0 ? competitions.map((comp) => (
            <tr key={comp.id}>
              <td style={{ padding: '10px' }}>{comp.id}</td>
              <td style={{ padding: '10px' }}>{comp.title}</td>
              <td style={{ padding: '10px' }}>{comp.status}</td>
              <td style={{ padding: '10px' }}>{new Date(comp.createdAt).toLocaleString()}</td>
              <td style={{ padding: '10px' }}>
                <button
                  onClick={() => alert(`Тут буде логіка керування змаганням ${comp.id}`)}
                >
                  Керувати
                </button>
              </td>
            </tr>
          )) : (
            <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Змагань не знайдено.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CompetitionListPage;