const API_BASE_URL = 'https://shfe-diplom.neto-server.ru/';

export const fetchAllData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}alldata`);
    const data = await response.json();
    if (data.success) {
      return data.result;
    }
    throw new Error(data.error || 'Failed to fetch data');
  } catch (error) {
    console.error('Error fetching all data:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const formData = new FormData();
    formData.append('login', email);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}login`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.success) {
      return data.result;
    }
    throw new Error(data.error || 'Login failed');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const fetchSeances = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}seances`);
    const data = await response.json();
    if (data.success) {
      return data.result.seances;
    }
    throw new Error(data.error || 'Failed to fetch seances');
  } catch (error) {
    console.error('Error fetching seances:', error);
    throw error;
  }
};

export const createHall = async (hallName) => {
  try {
    const formData = new FormData();
    formData.append('hallName', hallName);

    const response = await fetch(`${API_BASE_URL}hall`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.success) {
      return data.result.halls;
    }
    throw new Error(data.error || 'Failed to create hall');
  } catch (error) {
    console.error('Create hall error:', error);
    throw error;
  }
};

export const deleteHall = async (hallId) => {
  try {
    const response = await fetch(`${API_BASE_URL}hall/${hallId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (data.success) {
      return data.result;
    }
    throw new Error(data.error || 'Failed to delete hall');
  } catch (error) {
    console.error('Delete hall error:', error);
    throw error;
  }
};

export const updateHallConfig = async (hallId, rowCount, placeCount, config) => {
  try {
    const formData = new FormData();
    formData.append('rowCount', rowCount);
    formData.append('placeCount', placeCount);
    formData.append('config', JSON.stringify(config));

    const response = await fetch(`${API_BASE_URL}hall/${hallId}`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (data.success) {
      return data.result;
    }
    throw new Error(data.error || 'Failed to update hall config');
  } catch (error) {
    console.error('Update hall config error:', error);
    throw error;
  }
};

export const updatePrices = async (hallId, priceStandart, priceVip) => {
  try {
    const params = new FormData();
    
    if (priceStandart !== undefined && priceStandart !== null) {
      params.append('priceStandart', priceStandart.toString());
    }
    
    if (priceVip !== undefined && priceVip !== null) {
      params.append('priceVip', priceVip.toString());
    }

    const response = await fetch(`${API_BASE_URL}price/${hallId}`, {
      method: 'POST',
      body: params
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.success) {
      throw new Error(data?.error || 'Ошибка сервера при обновлении цен');
    }

    return data.result;
  } catch (error) {
    console.error('Update prices error:', {
      hallId,
      priceStandart,
      priceVip,
      error: error.message
    });
    throw error;
  }
};

export const toggleHallSales = async (hallId, hallOpen) => {
  try {
    const params = new FormData();
    params.append('hallOpen', hallOpen.toString());

    const response = await fetch(`${API_BASE_URL}open/${hallId}`, {
      method: 'POST',
      body: params
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.success) {
      throw new Error(data?.error || 'Ошибка сервера');
    }

    const result = {
      ...data.result,
      hall_open: Number(data.result.hall_open)
    };

    return result;

  } catch (error) {
    console.error('Toggle hall sales failed:', {
      hallId,
      hallOpen,
      error: error.message
    });
    throw error;
  }
};

export const createFilm = async (filmData, posterFile) => {
  try {
    const formData = new FormData();
    formData.append('filmName', filmData.film_name || filmData.name);
    formData.append('filmDuration', filmData.film_duration || filmData.duration);
    formData.append('filmDescription', filmData.film_description || filmData.description || '');
    formData.append('filmOrigin', filmData.film_origin || filmData.country || '');
    
    if (posterFile) {
      if (posterFile.type !== 'image/png') {
        throw new Error('Файл должен быть в формате PNG');
      }
      if (posterFile.size > 3 * 1024 * 1024) {
        throw new Error('Размер файла не должен превышать 3MB');
      }
      formData.append('filePoster', posterFile);
    } else {
      const emptyPng = new Blob([], { type: 'image/png' });
      formData.append('filePoster', emptyPng, 'default.png');
    }

    const response = await fetch(`${API_BASE_URL}film`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      return data.result.films;
    }
    throw new Error(data.error || 'Failed to create film');
  } catch (error) {
    console.error('Create film error:', error);
    throw error;
  }
};

export const deleteFilm = async (filmId) => {
  try {
    const response = await fetch(`${API_BASE_URL}film/${filmId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (data.success) {
      return data.result;
    }
    throw new Error(data.error || 'Failed to delete film');
  } catch (error) {
    console.error('Delete film error:', error);
    throw error;
  }
};

export const createSeance = async (hallId, filmId, time) => {
  try {
    const formData = new FormData();
    formData.append('seanceHallid', hallId);
    formData.append('seanceFilmid', filmId);
    formData.append('seanceTime', time);

    const response = await fetch(`${API_BASE_URL}seance`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.result.seances;
    }
    throw new Error(data.error || 'Failed to create seance');
  } catch (error) {
    console.error('Create seance error:', error);
    throw error;
  }
};

export const deleteSeance = async (seanceId) => {
  try {
    const response = await fetch(`${API_BASE_URL}seance/${seanceId}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (data.success) {
      return data.result.seances;
    }
    throw new Error(data.error || 'Failed to delete seance');
  } catch (error) {
    console.error('Delete seance error:', error);
    throw error;
  }
};

export const getHallConfig = async (seanceId, date) => {
  try {
    const response = await fetch(`${API_BASE_URL}hallconfig?seanceId=${seanceId}&date=${date}`);
    const data = await response.json();
    if (data.success) {
      return data.result;
    }
    throw new Error(data.error || 'Failed to get hall config');
  } catch (error) {
    console.error('Get hall config error:', error);
    throw error;
  }
};

export const bookTickets = async (seanceId, date, tickets) => {
  try {
    if (!seanceId || !date || !tickets || !Array.isArray(tickets)) {
      throw new Error('Неверные параметры бронирования');
    }

    const validatedTickets = tickets.map(ticket => {
      if (isNaN(ticket.row) || isNaN(ticket.place) || isNaN(ticket.coast)) {
        throw new Error(`Некорректные данные билета: ${JSON.stringify(ticket)}`);
      }
      return {
        row: parseInt(ticket.row),
        place: parseInt(ticket.place),
        coast: parseInt(ticket.coast)
      };
    });

    const formData = new URLSearchParams();
    formData.append('seanceId', seanceId.toString());
    formData.append('ticketDate', date);
    formData.append('tickets', JSON.stringify(validatedTickets));

    const response = await fetch(`${API_BASE_URL}ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.success) {
      throw new Error(data?.error || 'Ошибка сервера при бронировании');
    }

    return data.result.tickets;
  } catch (error) {
    console.error('Booking error details:', {
      seanceId,
      date,
      tickets,
      error: error.message
    });
    throw error;
  }
};

async function transferSeanceWithBookings(originalSeanceId, newDate) {
  try {
    const response = await fetch(`${API_BASE_URL}seance/${originalSeanceId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Ошибка получения данных сеанса');
    }

    const originalSeance = data.result;

    const newSeanceResponse = await fetch(`${API_BASE_URL}seance`, {
      method: 'POST',
      body: new URLSearchParams({
        seanceHallid: originalSeance.seance_hallid,
        seanceFilmid: originalSeance.seance_filmid,
        seanceTime: originalSeance.seance_time
      })
    });

    const newSeanceData = await newSeanceResponse.json();
    
    if (!newSeanceData.success) {
      throw new Error(newSeanceData.error || 'Ошибка создания нового сеанса');
    }

    return newSeanceData.result.seances;

  } catch (error) {
    console.error('Transfer error:', error);
    throw error;
  }
}

export const getOrCreateSeance = async (originalSeanceId, date) => {
  try {
    try {
      const config = await getHallConfig(originalSeanceId, date);
      return { seanceId: originalSeanceId, config };
    } catch (error) {
      console.log('Сеанс не найден, создаем новый...');
    }

    const response = await fetch(`${API_BASE_URL}seance/${originalSeanceId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Ошибка получения данных сеанса');
    }

    const originalSeance = data.result;

    const newSeanceResponse = await fetch(`${API_BASE_URL}seance`, {
      method: 'POST',
      body: new URLSearchParams({
        seanceHallid: originalSeance.seance_hallid,
        seanceFilmid: originalSeance.seance_filmid,
        seanceTime: originalSeance.seance_time
      })
    });

    const newSeanceData = await newSeanceResponse.json();
    
    if (!newSeanceData.success) {
      throw new Error(newSeanceData.error || 'Ошибка создания нового сеанса');
    }

    const newSeanceId = newSeanceData.result.seances[0].id;
    const config = await getHallConfig(newSeanceId, date);
    
    return { seanceId: newSeanceId, config };
  } catch (error) {
    console.error('Error in getOrCreateSeance:', error);
    throw error;
  }
};