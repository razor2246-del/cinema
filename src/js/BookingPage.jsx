import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getHallConfig, getOrCreateSeance } from '../api/api.js';
import '../css/booking.css';

const BookingPage = () => {
  const { state } = useLocation();
  const { movie, hall, session } = state || {};
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHallConfig = async () => {
      if (!session?.seanceId || !session?.date) {
        setLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoading(true);
        
        const { seanceId, config } = await getOrCreateSeance(session.seanceId, session.date);

        if (seanceId !== session.seanceId) {
          navigate(location.pathname, {
            state: {
              ...state,
              session: {
                ...session,
                seanceId,
              },
            },
            replace: true,
          });
        }

        setSeats(config);
      } catch (err) {
          console.error("Ошибка загрузки зала:", err);
          alert("Не удалось загрузить схему зала");
          navigate('/');
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };

    loadHallConfig();
  }, [session]); 

  const getSeatClass = (row, col) => {
    if (!seats[row] || !seats[row][col]) return 'seat-none';
    
    const seatType = seats[row][col];
    if (seatType === 'taken') return 'seat-occupied';
    if (seatType === 'disabled') return 'seat-none';
    
    const isSelected = selectedSeats.some(s => s.row === row && s.col === col);
    if (isSelected) return 'seat-selected';
    
    return seatType === 'vip' ? 'seat-vip' : 'seat-available';
  };

  const handleSeatClick = (row, col) => {
    if (!seats[row] || !seats[row][col]) return;
    
    const seatType = seats[row][col];
    if (seatType === 'taken' || seatType === 'disabled') return;
    
    const newSelectedSeats = [...selectedSeats];
    const seatIndex = newSelectedSeats.findIndex(s => s.row === row && s.col === col);
    
    if (seatIndex === -1) {
      const price = seatType === 'vip' 
        ? (hall.hall_price_vip || 0)
        : (hall.hall_price_standart || 0);
      
      newSelectedSeats.push({ 
        row, 
        col, 
        type: seatType, 
        price: price
      });
    } else {
      newSelectedSeats.splice(seatIndex, 1);
    }
    
    setSelectedSeats(newSelectedSeats);
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert('Выберите хотя бы одно место');
      return;
    }

    try {
      const tickets = selectedSeats.map(seat => ({
        row: seat.row + 1,
        place: seat.col + 1,
        coast: seat.price
      }));

      if (!session?.date) {
        throw new Error('Дата сеанса не указана');
      }

      navigate('/booking-confirmation', {
        state: {
          movie,
          hall,
          session,
          selectedSeats
        }
      });
    } catch (err) {
      console.error('Ошибка бронирования:', err);
      alert('Не удалось забронировать места: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка схемы зала...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!movie || !hall || !session) {
    return <div className="error">Не удалось загрузить информацию о сеансе</div>;
  }

  return (
    <div className="booking-container">
      <div className="booking-movie-info">
        <h2>{movie.film_name}</h2>
        <p>Начало сеанса: <strong>{session.time}</strong></p>
        <p>Зал: <strong>{hall.hall_name}</strong></p>
      </div>
      
      <div className="cinema-hall">
        <div className="screen"></div>
        
        <div className="seats-grid">
          {seats.map((row, rowIndex) => (
            <div key={rowIndex} className="seats-row">
              {row.map((seat, colIndex) => (
                <div
                  key={colIndex}
                  className={`seat ${getSeatClass(rowIndex, colIndex)}`}
                  onClick={() => handleSeatClick(rowIndex, colIndex)}
                ></div>
              ))}
            </div>
          ))}
        </div>
        
        <div className="hall-info">
          <div className="legend-grid">
            <div className="legend-col">
              <div className="legend-item">
                <div className="seat seat-available"></div>
                <span>Свободно ({hall.hall_price_standart} руб)</span>
              </div>
              <div className="legend-item">
                <div className="seat seat-vip"></div>
                <span>Свободно VIP ({hall.hall_price_vip} руб)</span>
              </div>
            </div>
            <div className="legend-col">
              <div className="legend-item">
                <div className="seat seat-occupied"></div>
                <span>Занято</span>
              </div>
              <div className="legend-item">
                <div className="seat seat-selected"></div>
                <span>Выбрано</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="booking-actions">
        <button 
          className="book-button" 
          onClick={handleBooking}
          disabled={selectedSeats.length === 0}
        >
          Забронировать
          {selectedSeats.length > 0 && ` (${selectedSeats.reduce((sum, seat) => sum + seat.price, 0)} руб)`}
        </button>
      </div>
    </div>
  );
};

export default BookingPage;