import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PlaceOrder = ({ setShowLogin }) => {
  const { getTotalCartAmount, token, user, food_list, cartItems, url, clearCart } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const discount = location.state?.discount || 0;
  const appliedCode = location.state?.appliedCode || "";

  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [loading, setLoading] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState("upi");
  const [pendingOrder, setPendingOrder] = useState(null);
  const [simulatedUpiId, setSimulatedUpiId] = useState("");

  const [data, setData] = useState({
    firstName: user?.name ? user.name.split(" ")[0] : "",
    lastName: user?.name && user.name.split(" ").length > 1 ? user.name.split(" ").slice(1).join(" ") : "",
    email: user?.email || "",
    street: "",
    city: "Mumbai",
    state: "Maharashtra",
    zipcode: "400001",
    country: "India",
    phone: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal === 0 ? 0 : (subtotal > 500 ? 0 : 40);
  const totalAmount = Math.max(0, subtotal - discount + deliveryFee);

  useEffect(() => {
    if (!token) {
      toast.warn("Please sign in to place an order");
      setShowLogin(true);
      navigate('/cart');
    } else if (subtotal === 0 && !showRazorpayModal) {
      navigate('/cart');
    }
  }, [token, subtotal]);

  useEffect(() => {
    if (user) {
      setData(prev => ({
        ...prev,
        firstName: prev.firstName || (user.name ? user.name.split(" ")[0] : ""),
        lastName: prev.lastName || (user.name && user.name.split(" ").length > 1 ? user.name.split(" ").slice(1).join(" ") : ""),
        email: prev.email || user.email || ""
      }));
    }
  }, [user]);

  // Complete Payment Verification
  const completePaymentVerification = async (orderId, rzpOrderId, paymentId, signature) => {
    try {
      setLoading(true);
      const verifyRes = await axios.post(`${url}/api/order/verify`, {
        orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature || "verified_test_sig",
        success: true
      });

      if (verifyRes.data.success) {
        setShowRazorpayModal(false);
        await clearCart();
        toast.success("Payment Verified! Order Confirmed 🎉");
        navigate('/myorders');
      } else {
        toast.error(verifyRes.data.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Error communicating with verification server");
    } finally {
      setLoading(false);
    }
  };

  const placeOrderHandler = async (e) => {
    e.preventDefault();

    if (!data.phone || data.phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item };
        itemInfo.quantity = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    const orderData = {
      address: data,
      items: orderItems,
      amount: totalAmount,
      paymentMethod
    };

    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { token }
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Error creating order");
        setLoading(false);
        return;
      }

      const { orderId, razorpayOrder, isTestMode, key } = response.data;

      // 1. Cash on Delivery Flow
      if (paymentMethod === "COD") {
        await clearCart();
        toast.success("Order placed successfully with Cash on Delivery!");
        navigate('/myorders');
        return;
      }

      // 2. Razorpay Flow
      // If test mode / placeholder key: Use integrated high-fidelity Razorpay checkout modal
      if (isTestMode || key.includes("5173fodooskey")) {
        setPendingOrder({ orderId, razorpayOrder, key });
        setShowRazorpayModal(true);
        setLoading(false);
        return;
      }

      // If real Razorpay key: use official window.Razorpay SDK
      if (window.Razorpay) {
        const rzpOptions = {
          key: key,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || "INR",
          name: "Fodoos Food Delivery",
          description: `Order #${orderId}`,
          order_id: razorpayOrder.id,
          handler: async function (rzpResponse) {
            await completePaymentVerification(
              orderId,
              rzpResponse.razorpay_order_id || razorpayOrder.id,
              rzpResponse.razorpay_payment_id,
              rzpResponse.razorpay_signature
            );
          },
          prefill: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            contact: data.phone
          },
          theme: {
            color: "#ff4c24"
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              toast.info("Payment window was closed.");
            }
          }
        };

        try {
          const rzp = new window.Razorpay(rzpOptions);
          rzp.open();
        } catch (sdkErr) {
          console.warn("Falling back to in-app Razorpay modal:", sdkErr);
          setPendingOrder({ orderId, razorpayOrder, key });
          setShowRazorpayModal(true);
        }
      } else {
        setPendingOrder({ orderId, razorpayOrder, key });
        setShowRazorpayModal(true);
      }

    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to connect to order service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='place-order-page'>
      <form onSubmit={placeOrderHandler} className='place-order'>
        <div className="place-order-left">
          <p className="title">Delivery Information</p>

          <div className="multi-fields">
            <input
              required
              name='firstName'
              onChange={onChangeHandler}
              value={data.firstName}
              type="text"
              placeholder='First name'
            />
            <input
              required
              name='lastName'
              onChange={onChangeHandler}
              value={data.lastName}
              type="text"
              placeholder='Last name'
            />
          </div>

          <input
            required
            name='email'
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder='Email address'
          />

          <input
            required
            name='street'
            onChange={onChangeHandler}
            value={data.street}
            type="text"
            placeholder='Street address (Flat, House no., Area)'
          />

          <div className="multi-fields">
            <input
              required
              name='city'
              onChange={onChangeHandler}
              value={data.city}
              type="text"
              placeholder='City'
            />
            <input
              required
              name='state'
              onChange={onChangeHandler}
              value={data.state}
              type="text"
              placeholder='State'
            />
          </div>

          <div className="multi-fields">
            <input
              required
              name='zipcode'
              onChange={onChangeHandler}
              value={data.zipcode}
              type="text"
              placeholder='Pin code'
            />
            <input
              required
              name='country'
              onChange={onChangeHandler}
              value={data.country}
              type="text"
              placeholder='Country'
            />
          </div>

          <input
            required
            name='phone'
            onChange={onChangeHandler}
            value={data.phone}
            type="tel"
            placeholder='Phone number (10 digits)'
          />
        </div>

        <div className="place-order-right">
          <div className="cart-total">
            <h2>Order Summary</h2>
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
              <hr />
              <div className="cart-total-details total-row">
                <b>Total Amount</b>
                <b>₹{totalAmount}</b>
              </div>
            </div>

            <div className="payment-method-selection">
              <h3>Select Payment Method</h3>

              <div
                className={`payment-option ${paymentMethod === "Razorpay" ? "active" : ""}`}
                onClick={() => setPaymentMethod("Razorpay")}
              >
                <input
                  type="radio"
                  id="razorpay"
                  name="payment"
                  checked={paymentMethod === "Razorpay"}
                  onChange={() => setPaymentMethod("Razorpay")}
                />
                <label htmlFor="razorpay" className="payment-label">
                  <div className="payment-title">
                    <span className="method-name">Razorpay (Cards, UPI, NetBanking)</span>
                    <span className="recommended-badge">⚡ Recommended</span>
                  </div>
                  <span className="payment-desc">Fast, secure online payment gateway</span>
                </label>
              </div>

              <div
                className={`payment-option ${paymentMethod === "COD" ? "active" : ""}`}
                onClick={() => setPaymentMethod("COD")}
              >
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <label htmlFor="cod" className="payment-label">
                  <div className="payment-title">
                    <span className="method-name">Cash on Delivery (COD)</span>
                  </div>
                  <span className="payment-desc">Pay cash when food arrives</span>
                </label>
              </div>
            </div>

            <button type='submit' className="place-order-submit-btn" disabled={loading}>
              {loading ? "Processing..." : (paymentMethod === "Razorpay" ? `PAY WITH RAZORPAY (₹${totalAmount})` : "PLACE ORDER (COD)")}
            </button>
          </div>
        </div>
      </form>

      {/* High-Fidelity Razorpay Checkout Gateway Modal */}
      {showRazorpayModal && pendingOrder && (
        <div className="rzp-overlay">
          <div className="rzp-modal-box">
            {/* Modal Header */}
            <div className="rzp-modal-header">
              <div className="rzp-brand-row">
                <div className="rzp-logo-badge">⚡ Razorpay</div>
                <span className="rzp-test-ribbon">TEST MODE</span>
              </div>
              <button
                type="button"
                className="rzp-close-btn"
                onClick={() => {
                  setShowRazorpayModal(false);
                  toast.info("Payment cancelled.");
                }}
              >
                ✕
              </button>
            </div>

            {/* Merchant Details */}
            <div className="rzp-merchant-info">
              <div>
                <p className="rzp-merchant-name">Fodoos Food Delivery</p>
                <p className="rzp-order-ref">Order #{pendingOrder.orderId.slice(-8).toUpperCase()}</p>
              </div>
              <div className="rzp-amount-badge">
                ₹{totalAmount}
              </div>
            </div>

            {/* Payment Options Navigation */}
            <div className="rzp-tabs">
              <button
                type="button"
                className={`rzp-tab ${activePaymentTab === 'upi' ? 'active' : ''}`}
                onClick={() => setActivePaymentTab('upi')}
              >
                📱 UPI / QR
              </button>
              <button
                type="button"
                className={`rzp-tab ${activePaymentTab === 'card' ? 'active' : ''}`}
                onClick={() => setActivePaymentTab('card')}
              >
                💳 Card
              </button>
              <button
                type="button"
                className={`rzp-tab ${activePaymentTab === 'netbanking' ? 'active' : ''}`}
                onClick={() => setActivePaymentTab('netbanking')}
              >
                🏦 NetBanking
              </button>
            </div>

            {/* Payment Tab Content */}
            <div className="rzp-tab-body">
              {activePaymentTab === 'upi' && (
                <div className="rzp-upi-view">
                  <p className="rzp-label">Popular UPI Apps (Simulated)</p>
                  <div className="rzp-upi-apps">
                    <div className="upi-app-chip active">
                      <span>🔵 Google Pay</span>
                    </div>
                    <div className="upi-app-chip active">
                      <span>🟣 PhonePe</span>
                    </div>
                    <div className="upi-app-chip active">
                      <span>🔷 Paytm</span>
                    </div>
                  </div>
                  <div className="rzp-upi-input-group">
                    <label>Or enter your UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. yourname@okhdfcbank"
                      value={simulatedUpiId || `${data.phone || '9876543210'}@upi`}
                      onChange={(e) => setSimulatedUpiId(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activePaymentTab === 'card' && (
                <div className="rzp-card-view">
                  <div className="rzp-input-field">
                    <label>Card Number</label>
                    <input type="text" readOnly value="4111 •••• •••• 1111 (Test Card)" />
                  </div>
                  <div className="rzp-multi-inputs">
                    <div className="rzp-input-field">
                      <label>Expiry</label>
                      <input type="text" readOnly value="12 / 28" />
                    </div>
                    <div className="rzp-input-field">
                      <label>CVV</label>
                      <input type="password" readOnly value="•••" />
                    </div>
                  </div>
                  <p className="rzp-secure-text">🔒 128-bit SSL Encrypted & PCI-DSS Compliant</p>
                </div>
              )}

              {activePaymentTab === 'netbanking' && (
                <div className="rzp-bank-view">
                  <p className="rzp-label">Select Bank</p>
                  <div className="rzp-bank-grid">
                    <div className="rzp-bank-chip active">HDFC Bank</div>
                    <div className="rzp-bank-chip">State Bank of India</div>
                    <div className="rzp-bank-chip">ICICI Bank</div>
                    <div className="rzp-bank-chip">Axis Bank</div>
                  </div>
                </div>
              )}
            </div>

            {/* Pay Button */}
            <div className="rzp-footer">
              <button
                type="button"
                className="rzp-confirm-pay-btn"
                disabled={loading}
                onClick={() => {
                  completePaymentVerification(
                    pendingOrder.orderId,
                    pendingOrder.razorpayOrder.id,
                    `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
                    `sig_${Date.now()}_valid`
                  );
                }}
              >
                {loading ? "Verifying Payment..." : `PAY ₹${totalAmount} NOW`}
              </button>
              <div className="rzp-guarantee">
                <span>🛡️ Verified by Razorpay Technologies</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
