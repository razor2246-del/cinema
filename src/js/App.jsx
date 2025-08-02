import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import CinemaSchedule from '../js/CinemaSchedule';
import BookingPage from '../js/BookingPage';
import BookingConfirmation from '../js/BookingConfirmation';
import TicketConfirmation from '../js/TicketConfirmation';
import AuthPage from "../js/AuthPage.jsx";
import AdminPanel from '../js/AdminPanel.jsx';
import '../css/style.css';
import '../css/schedule.css';
import '../css/DateStrip.css';
import '../css/AdminPanel.css';


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  useEffect(() => {
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/auth')) {
      document.body.className = 'admin';
    } else {
      document.body.className = 'guest';
    }
  }, [location]);

  const handleLoginClick = () => {
    navigate('/auth');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    navigate('/admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    navigate('/auth');
  };

  const renderLogo = () => {
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/auth')) {
      return (
        <div className="admin-logo-wrapper">
          <h1 className="logo-text" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            ИДЁМ<span className="logo-part">В</span>КИНО
          </h1>
          <h2 className="admin-subtitle">АДМИНИСТРАТОРРСКАЯ</h2>
        </div>
      );
    } else {
      return (
        <div className="logo-wrapper">
          <h1 className="logo-text" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            ИДЁМ<span className="logo-part">В</span>КИНО
          </h1>
          {location.pathname === '/' && (
            <button className="login-button" onClick={handleLoginClick}>ВОЙТИ</button>
          )}
        </div>
      );
    }
  };

  return (
    <div className="App">
      <div className="logo">
        {renderLogo()}
      </div>
      <Routes>
        <Route path="/" element={<CinemaSchedule />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/ticket" element={<TicketConfirmation />} />
        <Route 
          path="/auth" 
          element={
            isAuthenticated ? 
              <Navigate to="/admin" replace /> : 
              <AuthPage onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/admin" 
          element={
            isAuthenticated ? 
              <AdminPanel onLogout={handleLogout} /> : 
              <Navigate to="/auth" replace />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;