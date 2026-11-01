import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { getTotalCartItems, token, user, logout } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (sectionId, menuName) => {
    setMenu(menuName);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='navbar'>
      <Link to='/' className='navbar-logo-link' onClick={() => { setMenu("home"); }}>
        <div className="navbar-logo-container">
          <span className="logo-fodoos">FODOOS</span>
          <span className="logo-tagline">FOOD & MORE</span>
        </div>
      </Link>

      <ul className="navbar-menu">
        <li
          onClick={() => { setMenu("home"); navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={menu === "home" && location.pathname === '/' ? "active" : ""}
        >
          Home
        </li>
        <li
          onClick={() => handleNavClick("explore-menu", "menu")}
          className={menu === "menu" ? "active" : ""}
        >
          Menu
        </li>
        <li
          onClick={() => handleNavClick("footer", "contact-us")}
          className={menu === "contact-us" ? "active" : ""}
        >
          Contact Us
        </li>
      </ul>

      <div className="navbar-right">
        <Link to='/cart' className="navbar-cart-icon" title="View Cart">
          <svg className="cart-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {getTotalCartItems() > 0 && (
            <div className="cart-badge">{getTotalCartItems()}</div>
          )}
        </Link>

        {!token ? (
          <button onClick={() => setShowLogin(true)} className="navbar-signin-btn">
            Sign In
          </button>
        ) : (
          <div className="navbar-profile" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
            <div className="profile-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="avatar-circle">
                {(user?.name || "U")[0].toUpperCase()}
              </div>
              <span className="user-greeting">{user?.name ? user.name.split(" ")[0] : "Account"}</span>
              <svg className="dropdown-caret" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>

            {dropdownOpen && (
              <ul className="navbar-profile-dropdown">
                <li onClick={() => { setDropdownOpen(false); navigate('/myorders'); }}>
                  <img src={assets.parcel_icon} alt="Orders" className="dropdown-icon" />
                  <span>My Orders</span>
                </li>
                <li onClick={() => window.open('http://localhost:5174', '_blank')}>
                  <span className="dropdown-emoji">⚙️</span>
                  <span>Admin Panel</span>
                </li>
                <hr />
                <li onClick={() => { setDropdownOpen(false); logout(); }}>
                  <span className="dropdown-emoji">🚪</span>
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
