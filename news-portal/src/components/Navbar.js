import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/users');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/news" className="navbar-brand">
          📰 News Portal
        </Link>
        
        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/news" className="navbar-link">
                Home
              </Link>
              <Link to="/create" className="navbar-link">
                Create News
              </Link>
              <div className="navbar-user">
                <span className="user-info">
                  👤 {user.name}
                </span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/users" className="btn btn-primary btn-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
