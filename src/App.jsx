import React, { useState } from 'react';
import './App.css';

function App() {
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate inputs
      if (!ipAddress || !port || !username || !password) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      // Send SSH connection request to backend
      const response = await fetch('/api/ssh-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipAddress,
          port: parseInt(port),
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Connected successfully!');
        // Clear fields on success
        setIpAddress('');
        setPort('22');
        setUsername('');
        setPassword('');
      } else {
        setError(data.message || 'Connection failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Error connecting to server. Please try again.');
      console.error('Connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Login Client</h1>
        
        <form onSubmit={handleConnect}>
          <div className="form-group">
            <label htmlFor="ip-address">IP Address</label>
            <input
              id="ip-address"
              type="text"
              placeholder="192.168.1.100"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="port">Port</label>
            <input
              id="port"
              type="number"
              placeholder="22"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button 
            type="submit" 
            className="connect-button"
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
