import React from 'react';
import './ExploreMenu.css';
import { menu_list } from '../../assets/assets';

const ExploreMenu = ({ category, setCategory }) => {
  return (
    <div className='explore-menu' id='explore-menu'>
      <h1>Explore our menu</h1>
      <p className='explore-menu-text'>
        Choose from a diverse menu featuring a delectable array of dishes. Our mission is to satisfy your cravings and elevate your dining experience.
      </p>
      <div className="explore-menu-list">
        <div
          onClick={() => setCategory("All")}
          className={`explore-menu-list-item ${category === "All" ? "active" : ""}`}
        >
          <div className="all-category-circle">
            <span>🍽️</span>
          </div>
          <p>All Items</p>
        </div>

        {menu_list.map((item, index) => {
          const isActive = category === item.menu_name;
          return (
            <div
              key={index}
              onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)}
              className={`explore-menu-list-item ${isActive ? "active" : ""}`}
            >
              <img
                className={isActive ? "active" : ""}
                src={item.menu_image}
                alt={item.menu_name}
              />
              <p>{item.menu_name}</p>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
