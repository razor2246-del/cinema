import React, { useState, useEffect, useRef } from 'react';

const DateStrip = ({ onDateSelect }) => {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [offset, setOffset] = useState(0);
  const datesContainerRef = useRef(null);

  useEffect(() => {
    const today = new Date();
    const newDates = [];
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i + offset);
      newDates.push(date);
    }
    
    setDates(newDates);
    
    if (!selectedDate || !newDates.some(d => d.toDateString() === selectedDate.toDateString())) {
      const initialDate = newDates[0];
      setSelectedDate(initialDate);
      onDateSelect(initialDate);
    }
  }, [offset, onDateSelect, selectedDate]);

  const formatDate = (date) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    return {
      dayName: days[date.getDay()],
      dayNumber: date.getDate(),
      isToday,
      isWeekend
    };
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const getItemWidth = (isSelected) => {
    const container = datesContainerRef.current;
    if (!container) return isSelected ? 240 : 150;

    const containerWidth = container.getBoundingClientRect().width;
    const totalItems = 7;
    const gaps = totalItems - 1;
    const gapWidth = 1;
    const totalGapsWidth = gapWidth * gaps;
    const availableWidth = containerWidth - totalGapsWidth;
    
    if (isSelected) {
      const unselectedWidth = (availableWidth - 240) / 6;
      return Math.max(240, unselectedWidth * 1.5);
    }
    return (availableWidth - 240) / 6;
  };

  return (
    <div className="date-strip-container">
      <div className="dates-container" ref={datesContainerRef}>
        {dates.map((date, index) => {
          const { dayName, dayNumber, isToday, isWeekend } = formatDate(date);
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const textColor = isWeekend ? 'red' : 'inherit';
          
          return (
            <div
              key={index}
              className={`date-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDateClick(date)}
              style={{ 
                width: `${getItemWidth(isSelected)}px`,
                height: isSelected ? '54px' : '48px',
                marginRight: '1px',
                flexShrink: 0
              }}
            >
              <div className="date-line first-line" style={{ color: textColor }}>
                {isToday && offset === 0 ? 'Сегодня' : dayName}
              </div>
              <div className="date-line second-line" style={{ color: textColor }}>
                {dayNumber}
              </div>
            </div>
          );
        })}
        
        <div 
          className="date-item arrow"
          onClick={() => setOffset(prev => prev + 1)}
          style={{ 
            width: `${getItemWidth(false)}px`,
            height: '48px',
            flexShrink: 0
          }}
        >
          <div className="arrow-icon">&gt;</div>
        </div>
      </div>
    </div>
  );
};

export default DateStrip;