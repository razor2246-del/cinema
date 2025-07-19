import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCreator from 'qr-creator';
import '../css/ticket.css';

const TicketConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const qrRef = useRef(null);
  const { movie, hall, session, selectedSeats } = state || {};

  useEffect(() => {
    if (selectedSeats?.length > 0 && qrRef.current) {
      const ticketData = {
        film: movie?.film_name,
        hall: hall?.hall_name,
        date: session?.date,
        time: session?.time,
        seats: selectedSeats.map(seat => `Место ${seat.col + 1}`).join(', '),
        price: selectedSeats.reduce((sum, seat) => sum + seat.price, 0) + ' руб',
        bookingId: `BK-${Date.now().toString().slice(-8)}`,
        notice: 'Билет действителен строго на свой сеанс'
      };

      qrRef.current.innerHTML = '';
      
      QRCreator.render(
        {
          text: JSON.stringify(ticketData),
          radius: 0.5,
          ecLevel: 'H',
          fill: '#000000',
          background: '#ffffff',
          size: 200
        },
        qrRef.current
      );
    }
  }, [movie, hall, session, selectedSeats]);

  return (
    <div className="ticket-container">
      <div className="ticket-header">
        <h2>ЭЛЕКТРОННЫЙ БИЛЕТ</h2>
      </div>

      <div className="ticket-content">
        <div className="ticket-info">
          <p><strong>Фильм:</strong> {movie?.film_name}</p>
          <p><strong>Места:</strong> {selectedSeats?.map(seat => `${seat.col + 1}`).join(', ')}</p>
          <p><strong>Зал:</strong> {hall?.hall_name}</p>
          <p><strong>Дата:</strong> {session?.date}</p>
          <p><strong>Время:</strong> {session?.time}</p>
          <p><strong>Стоимость:</strong> {selectedSeats?.reduce((sum, seat) => sum + seat.price, 0)} руб</p>
        </div>

        <div className="ticket-qr" ref={qrRef}></div>

        <div className="ticket-instructions">
          <p>Покажите QR-код нашему контроллеру для подтверждения бронирования.</p>
          <p>Приятного просмотра!</p>
        </div>
      </div>
    </div>
  );
};

export default TicketConfirmation;