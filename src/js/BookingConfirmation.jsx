import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookTickets } from '../api/api.js';
import '../css/booking.css';

const BookingConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { movie, hall, session, selectedSeats } = state || {};

  const totalPrice = selectedSeats?.reduce((sum, seat) => sum + seat.price, 0) || 0;

  const handleGetCode = async () => {
    try {
      if (!selectedSeats || selectedSeats.length === 0) {
        alert('Нет выбранных мест для бронирования');
        return;
      }

      const tickets = selectedSeats.map(seat => ({
        row: seat.row + 1,
        place: seat.col + 1,
        coast: seat.price
      }));

      await bookTickets(session.seanceId, session.date, tickets);
      
      navigate('/ticket', { 
        state: {
          movie,
          hall,
          session,
          selectedSeats
        }
      });
    } catch (err) {
      console.error('Ошибка бронирования:', err);
      alert('Не удалось получить код бронирования: ' + err.message);
    }
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-header">
        <h1>Вы выбрали <span>билеты:</span></h1>
      </div>
      
      <div className="confirmation-content">
        <div className="ticket-info">
          <p>На фильм: <strong>{movie?.film_name}</strong></p>
          <p>Места: {selectedSeats?.map(seat => `${seat.col + 1}`).join(', ')}</p>
          <p>В зале: <strong>{hall?.hall_name}</strong></p>
          <p>Начало сеанса: <strong>{session?.time}</strong></p>
          <p>Стоимость: <strong>{totalPrice} рублей</strong></p>
        </div>
        
        <button className="get-code-button" onClick={handleGetCode}>
          ПОЛУЧИТЬ КОД БРОНИРОВАНИЯ
        </button>
        
        <div className="confirmation-footer">
          <p>После оплаты билет будет доступен в этом окне, а также придёт вам на почту. Покажите QR-код нашему контроллёру у входа в зал.</p>
          <p>Приятного просмотра!</p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;