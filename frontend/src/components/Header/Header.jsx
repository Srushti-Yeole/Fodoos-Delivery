import React from 'react';
import './Header.css';

const Header = () => {
  const scrollToMenu = () => {
    const el = document.getElementById('explore-menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='header'>
      <div className="header-contents">
        <h2>Order your favourite food here</h2>
        <p>
          Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise. Satisfy your cravings and elevate your dining experience, one delicious meal at a time.
        </p>
        <button onClick={scrollToMenu} className="header-btn">
          View Menu
        </button>
      </div>
    </div>
  );
};

export default Header;
