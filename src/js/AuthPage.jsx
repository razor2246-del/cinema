import React, { useState } from 'react';
import { login } from '../api/api.js';
import '../css/AuthPage.css';

function AuthPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      onLogin();
    } catch (err) {
      setError('Неверные учетные данные');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>ИДЁМВКИНО</h1>
          <h2>АВТОРИЗАЦИЯ</h2>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group-auth">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.xyz"
              required
            />
          </div>
          <div className="form-group-auth">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">АВТОРИЗОВАТЬСЯ</button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;