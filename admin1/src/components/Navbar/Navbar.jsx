import React, { useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';

const Navbar = ({ adminToken, adminUser, onLogout, setShowLogin }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className='navbar'>
      <div className="navbar-left">
        <img className='logo' src={assets.logo4} alt="Foodos Admin" />
        <span className="admin-badge">Admin Panel</span>
      </div>

      <div className="navbar-right">
        {!adminToken ? (
          <button onClick={() => setShowLogin(true)} className="admin-signin-btn">
            Sign In
          </button>
        ) : (
          <div
            className="admin-profile"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="admin-profile-trigger">
              <img className='profile' src={assets.profile_image} alt="Admin" />
              <div className="admin-name-tag">
                <span className="admin-user-name">{adminUser?.name || "Administrator"}</span>
                <span className="admin-role">Super Admin</span>
              </div>
              <svg className="caret-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>

            {dropdownOpen && (
              <ul className="admin-dropdown-menu">
                <li className="dropdown-user-header">
                  <p className="user-email">{adminUser?.email || "admin@fodoos.com"}</p>
                </li>
                <hr />
                <li onClick={() => window.open('http://localhost:5173', '_blank')}>
                  <span className="menu-icon">🛍️</span>
                  <span>View Customer Store</span>
                </li>
                <hr />
                <li onClick={() => { setDropdownOpen(false); onLogout(); }} className="logout-item">
                  <span className="menu-icon">🚪</span>
                  <span>Logout</span>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
