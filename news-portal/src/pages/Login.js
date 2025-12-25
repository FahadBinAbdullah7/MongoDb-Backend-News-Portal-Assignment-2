import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../services/api';

const Login = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/news');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load users. Please make sure JSON-Server is running on port 3001.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    const user = users.find(u => u.id === parseInt(selectedUserId));
    if (user) {
      login(user);
      navigate('/news');
    } else {
      setError('Invalid user selected');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="login-container">
          <div className="loading">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="login-container">
        <div className="card">
          <h1>News Portal Login</h1>
          <p className="subtitle">Select your account to continue</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="user-select">Select User:</label>
              <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setError('');
                }}
                required
              >
                <option value="">-- Choose a user --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary btn-block">
              Login
            </button>
          </form>

          <div className="info-box">
            <strong>Note:</strong> This is a pre built login.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
