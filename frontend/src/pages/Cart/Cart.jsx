import React, { useContext, useState } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cartItems, food_list, removeFromCart, addToCart, deleteFromCart, getTotalCartAmount, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal === 0 ? 0 : (subtotal > 500 ? 0 : 40);
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const applyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === "FODOOS20") {
      const disc = Math.round(subtotal * 0.2);
      setDiscount(disc);
      setAppliedCode(code);
      toast.success("Promo code applied! 20% discount (₹" + disc + ")");
    } else if (code === "WELCOME50") {
      const disc = Math.min(subtotal, 50);
      setDiscount(disc);
      setAppliedCode(code);
      toast.success("Promo code applied! ₹50 discount");
    } else {
      toast.error("Invalid promo code. Try 'FODOOS20' or 'WELCOME50'");
    }
  };

  const removePromo = () => {
    setDiscount(0);
    setAppliedCode("");
    setPromoCode("");
    toast.info("Promo code removed");
  };

  const getImageUrl = (img) => {
    if (!img) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `${url}${img}`;
    return `${url}/uploads/${img}`;
  };

  if (subtotal === 0) {
    return (
      <div className="cart-empty-state">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any delectable dishes to your cart yet.</p>
        <button onClick={() => navigate('/')} className="explore-food-btn">
          Browse Menu & Order
        </button>
      </div>
    );
  }

  return (
    <div className='cart'>
      <h1 className="cart-page-title">Shopping Cart</h1>

      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />

        {food_list.map((item) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={item._id}>
                <div className='cart-items-title cart-items-item'>
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="cart-item-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80";
                    }}
                  />
                  <p className="cart-item-name">{item.name}</p>
                  <p>₹{item.price}</p>
                  <div className="cart-item-qty-control">
                    <button onClick={() => removeFromCart(item._id)} className="qty-btn minus">−</button>
                    <span className="qty-number">{cartItems[item._id]}</span>
                    <button onClick={() => addToCart(item._id)} className="qty-btn plus">+</button>
                  </div>
                  <p className="cart-item-total">₹{item.price * cartItems[item._id]}</p>
                  <p onClick={() => deleteFromCart(item._id)} className='cart-remove-cross' title="Remove from cart">✕</p>
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{subtotal}</p>
            </div>
            <hr />
            {discount > 0 && (
              <>
                <div className="cart-total-details discount-row">
                  <p>Promo Discount ({appliedCode})</p>
                  <p className="discount-amount">− ₹{discount}</p>
                </div>
                <hr />
              </>
            )}
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>{deliveryFee === 0 ? <span className="free-delivery">FREE</span> : `₹${deliveryFee}`}</p>
            </div>
            {subtotal <= 500 && (
              <p className="free-delivery-note">
                💡 Add ₹{501 - subtotal} more food for <b>FREE Delivery</b>!
              </p>
            )}
            <hr />
            <div className="cart-total-details total-row">
              <b>Total Amount</b>
              <b>₹{total}</b>
            </div>
          </div>
          <button
            onClick={() => navigate('/order', { state: { discount, appliedCode, deliveryFee } })}
            className="checkout-btn"
          >
            PROCEED TO CHECKOUT
          </button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, enter it here</p>
            <form onSubmit={applyPromo} className="cart-promocode-input">
              <input
                type="text"
                placeholder='Try FODOOS20 or WELCOME50'
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={Boolean(appliedCode)}
              />
              {appliedCode ? (
                <button type="button" onClick={removePromo} className="remove-promo-btn">
                  Remove
                </button>
              ) : (
                <button type="submit">Apply</button>
              )}
            </form>
            {appliedCode && (
              <p className="code-active-badge">✓ Coupon <b>{appliedCode}</b> is active!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
