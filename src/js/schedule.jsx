import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/DateStrip.css';

const Schedule = ({ selectedDate, formattedDate, movies, halls, seances }) => {
  const navigate = useNavigate();

  const isSeancePassed = (date, time) => {
    if (!date || !time) return false;
    
    try {
      const now = new Date();
      const seanceDate = new Date(date);
      
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return false;
      
      seanceDate.setHours(hours, minutes, 0, 0);
      
      return seanceDate < now;
    } catch (error) {
      console.error('Error checking if seance passed:', error);
      return false;
    }
  };

  const getOccupiedSeats = async (seanceId) => {
    try {
      const response = await fetch(
        `https://shfe-diplom.neto-server.ru/hallconfig?seanceId=${seanceId}&date=${formattedDate}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const occupiedSeats = [];
        data.result.forEach((row, rowIndex) => {
          row.forEach((seat, seatIndex) => {
            if (seat === 'taken') {
              occupiedSeats.push({
                row: rowIndex + 1,
                place: seatIndex + 1
              });
            }
          });
        });
        return occupiedSeats;
      }
      throw new Error(data.error || 'Failed to get occupied seats');
    } catch (error) {
      console.error('Error fetching occupied seats:', error);
      throw error;
    }
  };

  const getMovieSessions = (movieId) => {
    if (!selectedDate) return [];

    return seances
      .filter(s => s.seance_filmid === movieId)
      .reduce((acc, seance) => {
        const hall = halls.find(h => h.id === seance.seance_hallid);
        
        if (!hall || hall.hall_open !== 1) return acc;
        
        const existingHall = acc.find(h => h.hallId === hall.id);
        
        if (existingHall) {
          existingHall.times.push({
            time: seance.seance_time,
            seanceId: seance.id,
            isPassed: isSeancePassed(selectedDate, seance.seance_time)
          });
        } else {
          acc.push({
            hallId: hall.id,
            hallName: hall.hall_name,
            hallConfig: hall.hall_config,
            hallPriceStandart: hall.hall_price_standart || 0,
            hallPriceVip: hall.hall_price_vip || 0,
            times: [{
              time: seance.seance_time,
              seanceId: seance.id,
              isPassed: isSeancePassed(selectedDate, seance.seance_time)
            }]
          });
        }
        
        return acc;
      }, []);
  };

  const handleSessionSelect = async (movie, hall, session) => {
    if (!formattedDate) {
      console.error('Дата не определена, используем текущую дату');
      const fallbackDate = new Date().toISOString().split('T')[0];
      return;
    }
      
    try {
      const occupiedSeats = await getOccupiedSeats(session.seanceId);
      
      navigate('/booking', {
        state: {
          movie,
          hall: {
            ...hall,
            hall_price_standart: hall.hallPriceStandart,
            hall_price_vip: hall.hallPriceVip
          },
          session: {
            seanceId: session.seanceId,
            time: session.time,
            date: formattedDate,
            occupiedSeats
          }
        }
      });
    } catch (error) {
      console.error('Session selection error:', error);
      alert(`Не удалось загрузить сеанс: ${error.message}`);
    }
  };

  if (!selectedDate) {
    return <div className="no-date">Выберите дату для просмотра расписания</div>;
  }

  if (movies.length === 0) {
    return <div className="no-movies">На выбранную дату сеансов нет</div>;
  }

  return (
    <div className="container">
      {movies.map(movie => {
        const sessions = getMovieSessions(movie.id);
        if (sessions.length === 0) return null;

        return (
          <div key={movie.id} className="movie-section">
            <div className="movie__info">
              <div className="movie__poster">
                <img
                  src={movie.film_poster}
                  alt={movie.film_name}
                  className="movie__poster-image"
                  onError={(e) => {
                    e.target.src = '/img/default-poster.jpg';
                  }}
                />
              </div>
              <div className="movie__description">
                <div className="movie__heading">
                  <h2 className="movie__title">{movie.film_name}</h2>
                </div>
                <div className="movie__synopsis">
                  <p className="movie__synopsis-text">
                    {movie.film_description || 'Описание отсутствует'}
                  </p>
                </div>
                <div className="movie__data">
                  <span className="movie__duration">{movie.film_duration} мин.</span>
                  <span className="movie__country">{movie.film_origin}</span>
                </div>
              </div>
            </div>

            {sessions.map((sessionGroup, index) => (
              <div 
                key={index} 
                className={`movie-seances__hall ${index === 1 ? 'movie-seances__hall--second' : ''}`}
              >
                <div className="hall__heading">
                  <h3 className="hall__name">{sessionGroup.hallName}</h3>
                </div>
                <div className="hall__sessions">
                  {sessionGroup.times.map((session, i) => (
                    <div key={i} className="session-item">
                      <div
                        className={`session-link ${session.isPassed ? 'passed' : ''}`}
                        onClick={() => !session.isPassed && handleSessionSelect(movie, {
                          id: sessionGroup.hallId,
                          hall_name: sessionGroup.hallName,
                          hall_config: sessionGroup.hallConfig,
                          hallPriceStandart: sessionGroup.hallPriceStandart,
                          hallPriceVip: sessionGroup.hallPriceVip
                        }, session)}
                      >
                        <span className="session-time-text">
                          {session.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default Schedule;