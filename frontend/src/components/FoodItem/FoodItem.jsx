import React, { useContext } from 'react';
import './FoodItem.css';
import { StoreContext } from '../../context/StoreContext';

const FoodItem = ({ id, name, price, description, image, category }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);

  const getImageUrl = (img) => {
    if (!img) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `${url}${img}`;
    return `${url}/uploads/${img}`;
  };

  const quantity = cartItems[id] || 0;

  return (
    <div className='food-item'>
      <div className="food-item-img-container">
        <img
          className='food-item-image'
          src={getImageUrl(image)}
          alt={name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
          }}
        />

        {!quantity ? (
          <button className='food-item-add-btn' onClick={() => addToCart(id)}>
            <span className="add-icon-plus">+</span> Add
          </button>
        ) : (
          <div className='food-item-counter'>
            <button
              className="counter-btn minus"
              onClick={() => removeFromCart(id)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="counter-value">{quantity}</span>
            <button
              className="counter-btn plus"
              onClick={() => addToCart(id)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p className="food-name">{name}</p>
          <div className="food-rating">
            <span className="star-icon">★</span>
            <span className="rating-score">4.8</span>
          </div>
        </div>
        <p className="food-item-desc">{description}</p>
        <div className="food-item-bottom">
          <p className="food-item-price">₹{price}</p>
          <span className="food-category-tag">{category}</span>
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
