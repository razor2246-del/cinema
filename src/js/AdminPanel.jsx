import React, { useState, useEffect } from 'react';
import { 
  fetchAllData, 
  createHall, 
  deleteHall, 
  updateHallConfig, 
  updatePrices, 
  toggleHallSales,
  createFilm,
  deleteFilm,
  createSeance,
  deleteSeance
} from '../api/api';
import '../css/AdminPanel.css';

const AdminPanel = ({ onLogout }) => {
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [halls, setHalls] = useState([]);
  const [films, setFilms] = useState([]);
  const [seances, setSeances] = useState([]);
  const [localSeances, setLocalSeances] = useState([]);
  const [isSeancesModified, setIsSeancesModified] = useState(false);
  const [newHallName, setNewHallName] = useState('');
  const [selectedHall, setSelectedHall] = useState(null);
  const [rows, setRows] = useState(10);
  const [seatsPerRow, setSeatsPerRow] = useState(10);
  const [rowsInput, setRowsInput] = useState('');
  const [seatsInput, setSeatsInput] = useState('');
  const [hallConfig, setHallConfig] = useState([]);
  const [originalHallConfig, setOriginalHallConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggedFilm, setDraggedFilm] = useState(null);
  const [draggedSeance, setDraggedSeance] = useState(null);
  const [showFilmPopup, setShowFilmPopup] = useState(false);
  const [showSeancePopup, setShowSeancePopup] = useState(false);
  const [showAddHallPopup, setShowAddHallPopup] = useState(false);
  const [showDeleteHallPopup, setShowDeleteHallPopup] = useState(false);
  const [hallToDelete, setHallToDelete] = useState(null);
  const [showDeleteSeancePopup, setShowDeleteSeancePopup] = useState(false);
  const [seanceToDelete, setSeanceToDelete] = useState(null);
  const [showDeleteFilmPopup, setShowDeleteFilmPopup] = useState(false);
  const [filmToDelete, setFilmToDelete] = useState(null);
  const [tempPrices, setTempPrices] = useState({
    standard: null,
    vip: null
  });

  const [newFilm, setNewFilm] = useState({
    name: '',
    duration: '',
    description: '',
    country: '',
  });
  const [collapsedSections, setCollapsedSections] = useState({
    halls: false,
    configuration: false,
    prices: false,
    schedule: false,
    sales: false
  });
  const [newSeance, setNewSeance] = useState({
    hallId: '',
    filmId: '',
    time: ''
  });

  const getColorFromId = (id) => {
    const colors = ['#85FF89', '#CAFF85', '#85FFD3', '#85E2FF', '#8599FF'];
    return colors[Number(id) % colors.length];
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAllData();
        setHalls(data.halls);
        setFilms(data.films);
        setSeances(data.seances);
        setLocalSeances([...data.seances]);
        
        if (data.halls.length > 0) {
          const firstHall = data.halls[0];
          handleSelectHall(firstHall);
        }
        
        setLoading(false);
      } catch (err) {
        alert('Не удалось загрузить данные');
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSelectHall = (hall) => {
    setSelectedHall(hall);
    setRowsInput(hall.hall_rows.toString());
    setSeatsInput(hall.hall_places.toString());
    setRows(hall.hall_rows);
    setSeatsPerRow(hall.hall_places);
    const config = hall.hall_config || 
      Array(hall.hall_rows).fill().map(() => Array(hall.hall_places).fill('standart'));
    setHallConfig(config);
    setOriginalHallConfig(JSON.parse(JSON.stringify(config)));
  };

  const handleRowsInputChange = (e) => {
    const value = e.target.value;
    setRowsInput(value);
    
    if (value !== '' && !isNaN(value)) {
      const num = parseInt(value) || 1;
      setRows(num);
      
      const newConfig = Array(num).fill().map((_, rowIndex) => {
        if (rowIndex < hallConfig.length) {
          return [...hallConfig[rowIndex]].slice(0, seatsPerRow).map(seat => seat || 'standart');
        }
        return Array(seatsPerRow).fill('standart');
      });
      
      setHallConfig(newConfig);
    }
  };

  const handleSeatsInputChange = (e) => {
    const value = e.target.value;
    setSeatsInput(value);
    
    if (value !== '' && !isNaN(value)) {
      const num = parseInt(value) || 1;
      setSeatsPerRow(num);
      
      const newConfig = hallConfig.map(row => 
        row.slice(0, num).map(seat => seat || 'standart')
      );
      
      while (newConfig.length < rows) {
        newConfig.push(Array(num).fill('standart'));
      }
      
      setHallConfig(newConfig);
    }
  };

  const handleSeatClick = (row, seat) => {
    if (!selectedHall) return;
    const newConfig = [...hallConfig];
    newConfig[row][seat] = 
      newConfig[row][seat] === 'standart' ? 'vip' :
      newConfig[row][seat] === 'vip' ? 'disabled' : 'standart';
    setHallConfig(newConfig);
  };

  const handlePriceInputChange = (type, value) => {
    setTempPrices(prev => ({
      ...prev,
      [type]: value === '' ? null : Number(value)
    }));
  };

  const handleCancelPriceChanges = () => {
    setTempPrices({
      standard: null,
      vip: null
    });
  };

  const handleSavePrices = async () => {
    if (!selectedHall) return;

    try {
      if (tempPrices.standard !== null && (isNaN(tempPrices.standard) || tempPrices.standard < 0)) {
        alert('Цена должна быть положительным числом');
        return;
      }
      if (tempPrices.vip !== null && (isNaN(tempPrices.vip) || tempPrices.vip < 0)) {
        alert('Цена должна быть положительным числом');
        return;
      }

      await updatePrices(
        selectedHall.id,
        tempPrices.standard !== null ? tempPrices.standard : selectedHall.hall_price_standart,
        tempPrices.vip !== null ? tempPrices.vip : selectedHall.hall_price_vip
      );

      const updatedHall = {
        ...selectedHall,
        hall_price_standart: tempPrices.standard !== null ? tempPrices.standard : selectedHall.hall_price_standart,
        hall_price_vip: tempPrices.vip !== null ? tempPrices.vip : selectedHall.hall_price_vip
      };

      setHalls(halls.map(hall => hall.id === selectedHall.id ? updatedHall : hall));
      setSelectedHall(updatedHall);
      setTempPrices({ standard: null, vip: null });
    } catch (err) {
      alert('Не удалось обновить цены: ' + err.message);
    }
  };

  const handleSaveHallConfig = async () => {
    if (!selectedHall) return;
    
    const finalRows = rowsInput === '' ? 1 : Math.max(1, parseInt(rowsInput) || 1);
    const finalSeats = seatsInput === '' ? 1 : Math.max(1, parseInt(seatsInput) || 1);
    
    try {
      const updatedHall = await updateHallConfig(
        selectedHall.id, 
        finalRows, 
        finalSeats, 
        hallConfig
      );
      
      setRowsInput(finalRows.toString());
      setSeatsInput(finalSeats.toString());
      setRows(finalRows);
      setSeatsPerRow(finalSeats);
      
      setHalls(halls.map(hall => 
        hall.id === updatedHall.id ? updatedHall : hall
      ));
      setSelectedHall(updatedHall);
      setOriginalHallConfig(JSON.parse(JSON.stringify(hallConfig)));
    } catch (err) {
      alert('Не удалось сохранить конфигурацию');
    }
  };

  const handleCancelChanges = () => {
    if (!selectedHall || !originalHallConfig) return;
    setRowsInput(selectedHall.hall_rows.toString());
    setSeatsInput(selectedHall.hall_places.toString());
    setRows(selectedHall.hall_rows);
    setSeatsPerRow(selectedHall.hall_places);
    setHallConfig(JSON.parse(JSON.stringify(originalHallConfig)));
  };

  const calculateTimeFromPosition = (xPos, width) => {
    const totalMinutes = 24 * 60;
    const minutes = Math.round((xPos / width) * totalMinutes);
    const clampedMinutes = Math.min(Math.max(minutes, 0), totalMinutes - 1);
    const hours = Math.floor(clampedMinutes / 60);
    const mins = clampedMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const calculatePositionFromTime = (timeStr) => {
    if (!timeStr || !timeStr.match(/^\d{2}:\d{2}$/)) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0;
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes / (24 * 60)) * 100;
  };

  const handleDragStart = (e, film) => {
    e.target.classList.add('dragging');
    setDraggedFilm(film);
    setDraggedSeance(null);
    e.dataTransfer.setData('text/plain', film.id);
    e.dataTransfer.effectAllowed = 'move';
    
    const dragImage = e.target.cloneNode(true);
    dragImage.style.position = 'absolute';
    dragImage.style.left = '-9999px';
    dragImage.style.width = `${e.target.offsetWidth}px`;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, e.target.offsetWidth/2, e.target.offsetHeight/2);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleSeanceDragStart = (e, seance) => {
    setDraggedSeance(seance);
    e.currentTarget.closest('.conf-step__seances-hall').classList.add('dragging-seance');
    
    const film = films.find(f => f.id === seance.seance_filmid);
    if (film && film.film_poster) {
      const dragImage = document.createElement('div');
      dragImage.style.position = 'absolute';
      dragImage.style.left = '-9999px';
      dragImage.style.width = '38px';
      dragImage.style.height = '50px';
      dragImage.style.backgroundImage = `url(${film.film_poster})`;
      dragImage.style.backgroundSize = 'cover';
      dragImage.style.backgroundPosition = 'center';
      document.body.appendChild(dragImage);
      
      e.dataTransfer.setDragImage(dragImage, 19, 25);
      
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (!draggedFilm) return;
    
    const timelineRect = e.currentTarget.getBoundingClientRect();
    const xPos = e.clientX - timelineRect.left;
    const time = calculateTimeFromPosition(xPos, timelineRect.width);
    
    const hallElement = e.currentTarget.closest('[data-hall-id]');
    
    if (!hallElement) {
      alert('Пожалуйста, перетащите фильм на конкретный зал');
      return;
    }

    const hallId = hallElement.dataset.hallId;
    
    setNewSeance({
      hallId,
      filmId: draggedFilm.id,
      time: time
    });
    setShowSeancePopup(true);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.conf-step__seances-hall').forEach(el => {
      el.classList.remove('dragging-seance');
    });
    setDraggedSeance(null);
  };

  const handleCreateHall = async () => {
    if (!newHallName) {
      alert('Название зала не может быть пустым');
      return;
    }
    try {
      const updatedHalls = await createHall(newHallName);
      setHalls(updatedHalls);
      setNewHallName('');
      setShowAddHallPopup(false);
      if (updatedHalls.length > 0 && !selectedHall) {
        handleSelectHall(updatedHalls[0]);
      }
    } catch (err) {
      alert('Не удалось создать зал');
    }
  };

  const handleDeleteHall = async (hallId) => {
    setHallToDelete(hallId);
    setShowDeleteHallPopup(true);
  };

  const handleConfirmDeleteHall = async () => {
    try {
      const result = await deleteHall(hallToDelete);
      setHalls(result.halls);
      setSeances(result.seances);
      setLocalSeances([...result.seances]);
      if (selectedHall?.id === hallToDelete) {
        setSelectedHall(result.halls[0] || null);
      }
      setShowDeleteHallPopup(false);
      setHallToDelete(null);
    } catch (err) {
      alert('Не удалось удалить зал');
      setShowDeleteHallPopup(false);
    }
  };

  const toggleSales = async (hallId) => {
    try {
      const previouslySelectedHallId = selectedHall?.id;
      setHalls(prevHalls => 
        prevHalls.map(hall => 
          hall.id === hallId 
            ? { ...hall, hall_open: hall.hall_open === 1 ? 0 : 1 } 
            : hall
        )
      );

      const updatedHall = await toggleHallSales(hallId, selectedHall?.hall_open === 1 ? 0 : 1);
      setHalls(prevHalls => 
        prevHalls.map(hall => 
          hall.id === updatedHall.id ? updatedHall : hall
        )
      );

      if (previouslySelectedHallId) {
        const freshData = await fetchAllData();
        setSelectedHall(freshData.halls.find(h => h.id === previouslySelectedHallId));
      }
    } catch (error) {
      console.error("Ошибка изменения статуса:", error);
      const freshData = await fetchAllData();
      setHalls(freshData.halls);
      if (selectedHall) {
        setSelectedHall(freshData.halls.find(h => h.id === selectedHall.id));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAddFilm = async () => {
    if (!newFilm.name || !newFilm.duration) {
      alert('Название и длительность обязательны');
      return;
    }

    try {
      const updatedFilms = await createFilm({
        name: newFilm.name,
        duration: newFilm.duration,
        description: newFilm.description,
        country: newFilm.country
      }, posterFile);

      setFilms(updatedFilms);
      setNewFilm({ name: '', duration: '', description: '', country: '' });
      setPosterFile(null);
      setPosterPreview(null);
      setShowFilmPopup(false);
    } catch (err) {
      alert('Не удалось добавить фильм: ' + err.message);
    }
  };

  const handleDeleteFilm = (filmId) => {
    setFilmToDelete(filmId);
    setShowDeleteFilmPopup(true);
  };

  const handleConfirmDeleteFilm = async () => {
    try {
      const result = await deleteFilm(filmToDelete);
      setFilms(result.films);
      setSeances(result.seances);
      setLocalSeances([...result.seances]);
      setShowDeleteFilmPopup(false);
      setFilmToDelete(null);
    } catch (err) {
      alert('Не удалось удалить фильм: ' + err.message);
      setShowDeleteFilmPopup(false);
    }
  };

  const handleAddSessionLocal = async () => {
    if (!newSeance.hallId || !newSeance.filmId || !newSeance.time) {
      alert('Все поля обязательны для заполнения');
      return;
    }

    try {
      const film = films.find(f => f.id === newSeance.filmId);
      if (!film) {
        alert('Фильм не найден');
        return;
      }

      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(newSeance.time)) {
        alert('Неверный формат времени. Используйте HH:MM');
        return;
      }

      const [hours, minutes] = newSeance.time.split(':').map(Number);
      const newSeanceStart = hours * 60 + minutes;
      const newSeanceEnd = newSeanceStart + Number(film.film_duration);

      if (newSeanceEnd > 1440) {
        alert('Сеанс должен заканчиваться до 00:00');
        return;
      }

      const allSeancesInHall = [...seances, ...localSeances].filter(
        s => String(s.seance_hallid) === String(newSeance.hallId)
      );

      const hasOverlap = allSeancesInHall.some(existingSeance => {
        const existingFilm = films.find(f => f.id === existingSeance.seance_filmid);
        if (!existingFilm) return false;

        const [existingHours, existingMins] = existingSeance.seance_time.split(':').map(Number);
        const existingStart = existingHours * 60 + existingMins;
        const existingEnd = existingStart + Number(existingFilm.film_duration);

        return (
          (newSeanceStart >= existingStart && newSeanceStart < existingEnd) ||
          (newSeanceEnd > existingStart && newSeanceEnd <= existingEnd) ||
          (newSeanceStart <= existingStart && newSeanceEnd >= existingEnd)
        );
      });

      if (hasOverlap) {
        alert('Сеансы не должны пересекаться по времени в одном зале');
        return;
      }

      const tempId = `temp-${Date.now()}`;
      const newSeanceObj = {
        id: tempId,
        seance_hallid: newSeance.hallId,
        seance_filmid: newSeance.filmId,
        seance_time: newSeance.time,
        isNew: true
      };

      setLocalSeances(prev => [...prev, newSeanceObj]);
      setIsSeancesModified(true);
      setNewSeance({ hallId: '', filmId: '', time: '' });
      setShowSeancePopup(false);
    } catch (err) {
      alert('Не удалось добавить сеанс: ' + (err.message || 'Ошибка сервера'));
    }
  };

  const handleDeleteSessionLocal = (seanceId) => {
    setSeanceToDelete(seanceId);
    setShowDeleteSeancePopup(true);
  };

  const handleConfirmDeleteSeance = async () => {
    const updatedSeances = localSeances.filter(s => s.id !== seanceToDelete);
    setLocalSeances(updatedSeances);
    setIsSeancesModified(true);
    setShowDeleteSeancePopup(false);
    setSeanceToDelete(null);
  };

  const handleSaveSeances = async () => {
    try {
      const seancesToDelete = seances.filter(serverSeance => 
        !localSeances.some(localSeance => localSeance.id === serverSeance.id)
      );

      for (const seance of seancesToDelete) {
        await deleteSeance(seance.id);
      }

      const seancesToAdd = localSeances.filter(seance => seance.isNew);
      
      for (const seance of seancesToAdd) {
        await createSeance(
          seance.seance_hallid,
          seance.seance_filmid,
          seance.seance_time
        );
      }

      const freshData = await fetchAllData();
      setSeances(freshData.seances);
      setLocalSeances([...freshData.seances]);
      setIsSeancesModified(false);
      
    } catch (err) {
      alert('Не удалось сохранить изменения: ' + err.message);
    }
  };

  const handleCancelSeancesChanges = () => {
    setLocalSeances([...seances]);
    setIsSeancesModified(false);
  };

  if (loading) return <div className="loading">Загрузка данных...</div>;

  return (
    <div className="admin-container">
      <main className="admin-content">
        <section className="admin-section">
          <div 
            className={`section-header ${collapsedSections.halls ? 'collapsed' : ''}`} 
            data-section-number="1"
            onClick={() => toggleSection('halls')}
          >
            <div className="section-icon"></div>
            <div className="section-name-holder"><h2>Управление залами</h2></div>
          </div>
          {!collapsedSections.halls && (
            <div className="section-content">
              <div className="conf-step__wrapper">
                <p className="conf-step__paragraph">Доступные залы:</p>
                <ul className="conf-step__list">
                  {halls.map(hall => (
                    <li key={hall.id} className="conf-step__list-item">
                      <span>–</span> {hall.hall_name}
                      <button 
                        className="conf-step__hall-delete" 
                        onClick={() => handleDeleteHall(hall.id)}
                      >
                      </button>
                    </li>
                  ))}
                </ul>
                <button 
                  className="conf-step__button conf-step__button-accent" 
                  onClick={() => setShowAddHallPopup(true)}
                >
                  Создать зал
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="admin-section">
          <div 
            className={`section-header ${collapsedSections.configuration ? 'collapsed' : ''}`} 
            data-section-number="2"
            onClick={() => toggleSection('configuration')}
          >
            <div className="section-icon"></div>
            <div className="section-name-holder"><h2>Конфигурация залов</h2></div>
          </div>
          {!collapsedSections.configuration && (
            <div className="section-content">
              <div className="conf-step__wrapper">
                <p className="conf-step__paragraph">Выберите зал для конфигурации:</p>
                <div className="conf-step__selectors-box">
                  {halls.map(hall => (
                    <span 
                      key={hall.id}
                      className={`conf-step__selector ${selectedHall?.id === hall.id ? 'active' : ''}`}
                      onClick={() => handleSelectHall(hall)}
                    >
                      {hall.hall_name}
                    </span>
                  ))}
                </div>
                
                {selectedHall && (
                  <div className="conf-step__hall-configuration">
                    <div className="conf-step__legend">
                      <p className="conf-step__paragraph">Укажите количество рядов и максимальное количество кресел в ряду:</p>
                      <div className="conf-step__legend-inputs">
                        <label className="conf-step__legend-label">
                          <span>Рядов, шт</span>
                          <input 
                            type="number" 
                            value={rowsInput}
                            onChange={handleRowsInputChange}
                            min="1"
                            className="conf-step__legend-input"
                          />
                        </label>
                        <span className="conf-step__legend-separator">×</span>
                        <label className="conf-step__legend-label">
                          <span>Мест, шт</span>
                          <input 
                            type="number" 
                            value={seatsInput}
                            onChange={handleSeatsInputChange}
                            min="1"
                            className="conf-step__legend-input"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="conf-step__hall-scheme">
                      <p className="conf-step__paragraph">Теперь вы можете указать типы кресел на схеме зала:</p>
                      <div className="conf-step__legend">
                        <div className="conf-step__legend-item">
                          <span className="conf-step__chair conf-step__chair_standart"></span>
                          <span>— обычные кресла</span>
                        </div>
                        <div className="conf-step__legend-item">
                          <span className="conf-step__chair conf-step__chair_vip"></span>
                          <span>— VIP кресла</span>
                        </div>
                        <div className="conf-step__legend-item">
                          <span className="conf-step__chair conf-step__chair_disabled"></span>
                          <span>— заблокированные (нет кресла)</span>
                        </div>
                      </div>
                      <p className="conf-step__hint">Чтобы изменить вид кресла, нажмите по нему левой кнопкой мыши</p>

                      <div className="conf-step__hall">
                        <div className="conf-step__hall-screen">экран</div>
                        <div className="conf-step__hall-wrapper">
                          {hallConfig.map((row, rowIndex) => (
                            <div key={rowIndex} className="conf-step__row">
                              {row.map((seat, seatIndex) => (
                                <span 
                                  key={seatIndex}
                                  className={`conf-step__chair conf-step__chair_${seat}`}
                                  onClick={() => handleSeatClick(rowIndex, seatIndex)}
                                ></span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="conf-step__buttons">
                      <button 
                        className="conf-step__button" 
                        onClick={handleCancelChanges}
                      >
                        Отмена
                      </button>
                      <button 
                        className="conf-step__button conf-step__button-accent" 
                        onClick={handleSaveHallConfig}
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>     

        <section className="admin-section">
          <div 
            className={`section-header ${collapsedSections.prices ? 'collapsed' : ''}`} 
            data-section-number="3"
            onClick={() => toggleSection('prices')}
          >
            <div className="section-icon"></div>
            <div className="section-name-holder"><h2>Конфигурация цен</h2></div>
          </div>
          {!collapsedSections.prices && (
            <div className="section-content">
              <div className="conf-step__wrapper">
                <p className="conf-step__paragraph">Выберите зал для конфигурации:</p>
                <div className="conf-step__selectors-box">
                  {halls.map(hall => (
                    <span 
                      key={hall.id}
                      className={`conf-step__selector ${selectedHall?.id === hall.id ? 'active' : ''}`}
                      onClick={() => handleSelectHall(hall)}
                    >
                      {hall.hall_name}
                    </span>
                  ))}
                </div>
                
                {selectedHall && (
                  <div className="conf-step__prices">
                    <p className="conf-step__paragraph">Теперь вы можете указать типы кресел на схеме зала:</p>
                    <div className="conf-step__legend">
                      <div className="conf-step__legend-item">
                        <label className="conf-step__legend-label">
                          <span>Цена, рублей</span>
                          <input 
                            type="number" 
                            value={tempPrices.standard ?? ''}
                            onChange={(e) => handlePriceInputChange('standard', e.target.value)}
                            onClick={(e) => {
                              if (tempPrices.standard === null) {
                                e.target.value = '';
                                setTempPrices(prev => ({...prev, standard: null}));
                              }
                            }}
                            placeholder={selectedHall?.hall_price_standart || ''}
                            min="0"
                            className="conf-step__legend-input"
                          />
                        </label>
                        <span>за</span>
                        <span className="conf-step__chair conf-step__chair_standart"></span>
                        <span>обычные кресла</span>
                      </div>
                      <div className="conf-step__legend-item">
                        <label className="conf-step__legend-label">
                          <span>Цена, рублей</span>
                          <input 
                            type="number" 
                            value={tempPrices.vip ?? ''}
                            onChange={(e) => handlePriceInputChange('vip', e.target.value)}
                            onClick={(e) => {
                              if (tempPrices.vip === null) {
                                e.target.value = '';
                                setTempPrices(prev => ({...prev, vip: null}));
                              }
                            }}
                            placeholder={selectedHall?.hall_price_vip || ''}
                            min="0"
                            className="conf-step__legend-input"
                          />
                        </label>
                        <span>за</span>
                        <span className="conf-step__chair conf-step__chair_vip"></span>
                        <span>VIP кресла</span>
                      </div>
                    </div>

                    <div className="conf-step__buttons">
                      <button 
                        className="conf-step__button"
                        onClick={handleCancelPriceChanges}
                        disabled={tempPrices.standard === null && tempPrices.vip === null}
                      >
                        Отмена
                      </button>
                      <button 
                        className="conf-step__button conf-step__button-accent"
                        onClick={handleSavePrices}
                        disabled={tempPrices.standard === null && tempPrices.vip === null}
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="admin-section">
          <div 
            className={`section-header ${collapsedSections.schedule ? 'collapsed' : ''}`} 
            data-section-number="4"
            onClick={() => toggleSection('schedule')}
          >
            <div className="section-icon"></div>
            <div className="section-name-holder"><h2>Сетка сеансов</h2></div>
          </div>
          {!collapsedSections.schedule && (
            <div className="section-content">
              <div className="conf-step__wrapper">
                <button 
                  className="conf-step__button conf-step__button-accent" 
                  onClick={() => setShowFilmPopup(true)}
                >
                  Добавить фильм
                </button>

                <div className="conf-step__movies">
                  {films.map(film => (
                    <div 
                      key={film.id}
                      className="conf-step__movie"
                      style={{ backgroundColor: getColorFromId(film.id) }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, film)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <img 
                        src={film.film_poster || '/img/default-poster.jpg'} 
                        alt={film.film_name} 
                        className="conf-step__movie-poster"
                      />
                      <div className="conf-step__movie-info">
                        <h4>{film.film_name}</h4>
                        <p>{film.film_duration} минут</p>
                      </div>
                      <button 
                        className="conf-step__button-trash"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFilm(film.id);
                        }}
                      >
                      </button>
                    </div>
                  ))}
                </div>

                <div className="conf-step__seances">
                  {halls.map(hall => (
                    <div 
                      key={hall.id}
                      className={`conf-step__seances-hall`}
                      data-hall-id={hall.id}
                      onDragEnd={handleDragEnd}
                    >
                      <h3 className="conf-step__seances-title">{hall.hall_name}</h3>
                      <div className="conf-step__seances-timeline-wrapper">
                        <div 
                          className="conf-step__trash-bin"
                          onDragOver={handleDragOver}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedSeance) {
                              handleDeleteSessionLocal(draggedSeance.id);
                            }
                          }}
                        >
                          🗑️
                        </div>
                        <div 
                          className="conf-step__seances-timeline"
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                        >
                         {localSeances
                          .filter(s => String(s.seance_hallid) === String(hall.id))
                          .map(seance => {
                            const film = films.find(f => f.id === seance.seance_filmid);
                            if (!film) {
                              console.warn('Film not found for seance:', seance);
                              return null;
                            }

                            const position = calculatePositionFromTime(seance.seance_time);
                            const widthPercent = (film.film_duration / (24 * 60)) * 100;
                            
                            return (
                              <div 
                                key={seance.id}
                                className="conf-step__seances-movie"
                                style={{
                                  width: `${widthPercent}%`,
                                  left: `${position}%`,
                                  backgroundColor: getColorFromId(film.id)
                                }}
                                draggable
                                onDragStart={(e) => handleSeanceDragStart(e, seance)}
                                onDragEnd={handleDragEnd}
                              >
                                <span className="conf-step__seances-movie-title">{film.film_name}</span>
                                <div className="conf-step__seances-movie-start">
                                  <div className="conf-step__seances-movie-line"></div>
                                  <span className="conf-step__seances-movie-time">{seance.seance_time}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="conf-step__buttons">
                  <button 
                    className="conf-step__button"
                    onClick={handleCancelSeancesChanges}
                    disabled={!isSeancesModified}
                  >
                    Отмена
                  </button>
                  <button 
                    className="conf-step__button conf-step__button-accent"
                    onClick={handleSaveSeances}
                    disabled={!isSeancesModified}
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="admin-section">
          <div 
            className={`section-header ${collapsedSections.sales ? 'collapsed' : ''}`} 
            data-section-number="5"
            onClick={() => toggleSection('sales')}
          >
            <div className="section-icon"></div>
            <div className="section-name-holder"><h2>Открыть продажи</h2></div>
          </div>
          {!collapsedSections.sales && (
            <div className="section-content">
              <div className="conf-step__wrapper">
                <p className="conf-step__paragraph">Выберите зал для конфигурации:</p>
                <div className="conf-step__selectors-box">
                  {halls.map(hall => (
                    <span 
                      key={hall.id}
                      className={`conf-step__selector ${selectedHall?.id === hall.id ? 'active' : ''}`}
                      onClick={() => handleSelectHall(hall)}
                    >
                      {hall.hall_name}
                    </span>
                  ))}
                </div>
                
                {selectedHall && (
                  <div className="conf-step__sales">
                    <p className="conf-step__paragraph">
                      Всё готово к открытию
                    </p>
                    <button 
                      className={`conf-step__button conf-step__button-accent ${selectedHall.hall_open === 1 ? 'active' : ''}`}
                      onClick={() => toggleSales(selectedHall.id)}
                    >
                      {selectedHall.hall_open === 1 ? 'Закрыть продажи' : 'Приостановить продажу билетов'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {showFilmPopup && (
        <div className="popup-overlay film-popup">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Добавление фильма</h3>
            </div>

            <div className="popup-form">
              <div className="form-group">
                <label>Название фильма</label>
                <input
                  type="text"
                  value={newFilm.name}
                  onChange={(e) => setNewFilm({...newFilm, name: e.target.value})}
                  placeholder="Например, «Гражданин Кейн»"
                />
              </div>

              <div className="form-group">
                <label>Продолжительность фильма (мин.)</label>
                <input
                  type="number"
                  value={newFilm.duration}
                  onChange={(e) => setNewFilm({...newFilm, duration: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Описание фильма</label>
                <textarea
                  value={newFilm.description}
                  onChange={(e) => setNewFilm({...newFilm, description: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Страна</label>
                <input
                  type="text"
                  value={newFilm.country}
                  onChange={(e) => setNewFilm({...newFilm, country: e.target.value})}
                />
              </div>

              <div className="popup-actions">
                <button className="action-btn add-film-btn" onClick={handleAddFilm}>
                  Добавить фильм
                </button>
                
                <label htmlFor="poster-upload" className="action-btn upload-poster-btn">
                  Загрузить постер
                  <input
                    type="file"
                    id="poster-upload"
                    className="poster-upload-input"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 3 * 1024 * 1024) {
                          setError('Файл слишком большой (макс. 3MB)');
                          return;
                        }
                        setPosterFile(file);
                        setPosterPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
                
                <button 
                  className="action-btn cancel-btn"
                  onClick={() => {
                    setShowFilmPopup(false);
                    setPosterFile(null);
                    setPosterPreview(null);
                  }}
                >
                  Отменить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteFilmPopup && (
        <div className="popup-overlay delete-confirm-popup">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Удаление фильма</h3>
            </div>
            <div className="popup-form">
              <p>Вы уверены, что хотите удалить этот фильм? Все связанные сеансы также будут удалены.</p>
              <div className="popup-actions">
                <button 
                  className="confirm-btn"
                  onClick={handleConfirmDeleteFilm}
                >
                  Удалить
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowDeleteFilmPopup(false)}
                >
                  Отменить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddHallPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Добавление зала</h3>
            </div>
            <div className="popup-form">
              <div className="form-group">
                <label>Название зала</label>
                <input
                  type="text"
                  value={newHallName}
                  onChange={(e) => setNewHallName(e.target.value)}
                  placeholder="Например, «Зал 1»"
                />
              </div>
              <div className="popup-actions">
                <button 
                  className="confirm-btn"
                  onClick={handleCreateHall}
                >
                  Добавить зал
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowAddHallPopup(false)}
                >
                  Отменить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteHallPopup && (
        <div className="popup-overlay delete-confirm-popup">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Удаление зала</h3>
            </div>
            <div className="popup-form">
              <p>Вы уверены, что хотите удалить этот зал? Все связанные сеансы также будут удалены.</p>
              <div className="popup-actions">
                <button 
                  className="confirm-btn"
                  onClick={handleConfirmDeleteHall}
                >
                  Удалить
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowDeleteHallPopup(false)}
                >
                  Отменить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSeancePopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Добавление сеанса</h3>
            </div>
            <div className="popup-form">
              <div className="form-group">
                <label>Фильм</label>
                <select
                  value={newSeance.filmId}
                  onChange={(e) => setNewSeance({...newSeance, filmId: e.target.value})}
                >
                  <option value="">Выберите фильм</option>
                  {films.map(film => (
                    <option key={film.id} value={film.id}>
                      {film.film_name} ({film.film_duration} мин)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Зал</label>
                <select
                  value={newSeance.hallId}
                  onChange={(e) => setNewSeance({...newSeance, hallId: e.target.value})}
                >
                  <option value="">Выберите зал</option>
                  {halls.map(hall => (
                    <option key={hall.id} value={hall.id}>
                      {hall.hall_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Время начала</label>
                <input
                  type="text"
                  value={newSeance.time}
                  onChange={(e) => setNewSeance({...newSeance, time: e.target.value})}
                  placeholder="HH:MM"
                />
              </div>
              <div className="popup-actions">
                <button 
                  className="confirm-btn"
                  onClick={handleAddSessionLocal}
                >
                  Добавить сеанс
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowSeancePopup(false)}
                >
                  Отменить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteSeancePopup && (
        <div className="popup-overlay delete-confirm-popup">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Удаление сеанса</h3>
            </div>
            <div className="popup-form">
              <p>Вы уверены, что хотите удалить этот сеанс?</p>
              <div className="popup-actions">
                <button 
                  className="confirm-btn"
                  onClick={handleConfirmDeleteSeance}
                >
                  Удалить
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setShowDeleteSeancePopup(false)}
                >
                  Отменить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;