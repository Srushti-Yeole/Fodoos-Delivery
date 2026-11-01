import React, { useContext, useState } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFoods = food_list.filter((item) => {
    const matchesCategory = category === "All" || category === item.category;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className='food-display' id='food-display'>
      <div className="food-display-header">
        <h2>Top dishes near you</h2>
        <div className="food-search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search dishes or cuisines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="food-search-input"
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm("")}>×</button>
          )}
        </div>
      </div>

      {filteredFoods.length === 0 ? (
        <div className="no-food-items">
          <p>No dishes found matching your criteria.</p>
        </div>
      ) : (
        <div className="food-display-list">
          {filteredFoods.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              category={item.category}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;
