import React, { useState, useEffect } from 'react';
import DateStrip from './DateStrip.jsx';
import Schedule from './Schedule.jsx';
import { fetchAllData } from '../api/api.js';

const CinemaSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState(new Date().toISOString().split('T')[0]);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDateSelect = (date, formatted) => {
    setSelectedDate(date);
    setFormattedDate(formatted || date.toISOString().split('T')[0]);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAllData();
        setMovies(data.films);
        setHalls(data.halls.map(hall => ({
          ...hall,
          hall_price_standart: hall.hall_price_standart || 0,
          hall_price_vip: hall.hall_price_vip || 0
        })));
        setSeances(data.seances);
        setLoading(false);
      } catch (err) {
          console.error('Ошибка загрузки данных:', err);
          alert('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
          setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="loading">Загрузка данных...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="cinema-schedule">
      <DateStrip onDateSelect={handleDateSelect} />
      <Schedule 
        selectedDate={selectedDate}
        formattedDate={formattedDate}
        movies={movies}
        halls={halls}
        seances={seances}
      />
    </div>
  );
};

export default CinemaSchedule;