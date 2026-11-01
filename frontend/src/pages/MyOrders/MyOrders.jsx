import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MyOrders = ({ setShowLogin }) => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [payNowModal, setPayNowModal] = useState(null); // { orderId, amount, razorpayOrder, key }
  const [activePaymentTab, setActivePaymentTab] = useState("upi");
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.post(
        `${url}/api/order/userorders`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setData(response.data.data);
      } else {
        toast.error("Failed to load your orders");
      }
    } catch (error) {
      console.error("Orders fetch error:", error);
      toast.error("Server connection error while loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setShowLogin(true);
    }
  }, [token]);

  const toggleTrack = (orderId) => {
    setTrackingOrderId(prev => prev === orderId ? null : orderId);
  };

  const getStatusStep = (status) => {
    if (status === "Delivered") return 3;
    if (status === "Out for Delivery") return 2;
    return 1; // Food Processing
  };

  // Pay Now Handler for Pending Payments
  const handlePayNow = async (order) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${url}/api/order/retry-payment`,
        { orderId: order._id },
        { headers: { token } }
      );

      if (res.data.success) {
        setPayNowModal({
          orderId: order._id,
          amount: order.amount,
          razorpayOrder: res.data.razorpayOrder,
          key: res.data.key,
          address: order.address
        });
      } else {
        toast.error(res.data.message || "Failed to initiate payment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error setting up payment");
    } finally {
      setLoading(false);
    }
  };

  // Complete Payment Verification for Pending Order
  const verifyPayNowPayment = async () => {
    if (!payNowModal) return;
    try {
      setVerifying(true);
      const paymentId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      const signature = `sig_${Date.now()}_verified`;

      const verifyRes = await axios.post(`${url}/api/order/verify`, {
        orderId: payNowModal.orderId,
        razorpay_order_id: payNowModal.razorpayOrder.id,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        success: true
      });

      if (verifyRes.data.success) {
        setPayNowModal(null);
        toast.success("Payment Verified! Official Receipt sent to your email ✉️");
        await fetchOrders();
      } else {
        toast.error(verifyRes.data.message || "Payment verification failed");
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("Error verifying payment");
    } finally {
      setVerifying(false);
    }
  };

  // Open Official Receipt
  const openReceipt = (orderId) => {
    window.open(`${url}/api/order/receipt/${orderId}`, '_blank');
  };

  if (!token) {
    return (
      <div className="orders-unauth">
        <h2>Please Sign In</h2>
        <p>You need to be logged in to view your orders history.</p>
        <button onClick={() => setShowLogin(true)} className="auth-btn">
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className='my-orders'>
      <div className="my-orders-header">
        <h2>My Orders ({data.length})</h2>
        <button onClick={fetchOrders} className="refresh-orders-btn">
          {loading ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {data.length === 0 && !loading ? (
        <div className="no-orders-box">
          <div className="no-orders-icon">📦</div>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any food orders yet. Explore our delicious menu today!</p>
          <button onClick={() => navigate('/')} className="start-order-btn">
            Explore Menu
          </button>
        </div>
      ) : (
        <div className="orders-container">
          {data.map((order, index) => {
            const isTracking = trackingOrderId === order._id;
            const currentStep = getStatusStep(order.status);
            const isPaid = order.payment === true;

            return (
              <div key={order._id || index} className='my-orders-order'>
                <div className="order-main-row">
                  <img src={assets.parcel_icon} alt="Parcel" className="parcel-img" />

                  <div className="order-items-col">
                    <p className="order-food-summary">
                      {order.items.map((item, idx) => {
                        const comma = idx === order.items.length - 1 ? "" : ", ";
                        return `${item.name} x ${item.quantity}${comma}`;
                      })}
                    </p>
                    <p className="order-date-text">
                      📅 {new Date(order.date || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <p className="order-price-col">₹{order.amount}</p>
                  <p className="order-count-col">Items: {order.items.length}</p>

                  <div className="order-payment-col">
                    {isPaid ? (
                      <span className="payment-pill paid">✅ Paid ({order.paymentMethod || 'Razorpay'})</span>
                    ) : order.paymentMethod === 'COD' ? (
                      <span className="payment-pill cod">💵 Cash on Delivery</span>
                    ) : (
                      <span className="payment-pill pending">⏳ Payment Pending</span>
                    )}
                  </div>

                  <div className="order-status-col">
                    <span className={`status-dot ${order.status.toLowerCase().replace(/\s+/g, '-')}`}></span>
                    <b>{order.status}</b>
                  </div>

                  {/* Actions Column */}
                  <div className="order-actions-col">
                    {!isPaid ? (
                      <button
                        onClick={() => handlePayNow(order)}
                        className="pay-now-btn"
                        title="Complete payment for this pending order"
                      >
                        💳 Pay Now (₹{order.amount})
                      </button>
                    ) : (
                      <button
                        onClick={() => openReceipt(order._id)}
                        className="view-receipt-btn"
                        title="View or print official receipt"
                      >
                        📄 View Receipt
                      </button>
                    )}

                    <button
                      onClick={() => toggleTrack(order._id)}
                      className={`track-order-btn ${isTracking ? "active" : ""}`}
                    >
                      {isTracking ? "Hide Tracking" : "Track Order"}
                    </button>
                  </div>
                </div>

                {/* Interactive Order Tracking Timeline */}
                {isTracking && (
                  <div className="tracking-timeline-box">
                    <h4>Live Order Tracking</h4>
                    <div className="tracking-steps">
                      <div className={`step-item ${currentStep >= 1 ? "completed" : ""}`}>
                        <div className="step-circle">{currentStep >= 1 ? "✓" : "1"}</div>
                        <p className="step-title">Order Confirmed</p>
                        <span className="step-sub">We received your order</span>
                      </div>

                      <div className={`step-line ${currentStep >= 2 ? "active" : ""}`}></div>

                      <div className={`step-item ${currentStep >= 1 ? (currentStep >= 2 ? "completed" : "current") : ""}`}>
                        <div className="step-circle">{currentStep >= 2 ? "✓" : "2"}</div>
                        <p className="step-title">Food Processing</p>
                        <span className="step-sub">Chef is preparing meal</span>
                      </div>

                      <div className={`step-line ${currentStep >= 3 ? "active" : ""}`}></div>

                      <div className={`step-item ${currentStep >= 2 ? (currentStep >= 3 ? "completed" : "current") : ""}`}>
                        <div className="step-circle">{currentStep >= 3 ? "✓" : "3"}</div>
                        <p className="step-title">Out for Delivery</p>
                        <span className="step-sub">Rider is on the way</span>
                      </div>

                      <div className={`step-line ${currentStep >= 3 ? "active" : ""}`}></div>

                      <div className={`step-item ${currentStep === 3 ? "completed" : ""}`}>
                        <div className="step-circle">{currentStep === 3 ? "✓" : "4"}</div>
                        <p className="step-title">Delivered</p>
                        <span className="step-sub">Enjoy your food!</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pay Now Razorpay Modal for Pending Orders */}
      {payNowModal && (
        <div className="rzp-overlay">
          <div className="rzp-modal-box">
            <div className="rzp-modal-header">
              <div className="rzp-brand-row">
                <div className="rzp-logo-badge">⚡ Razorpay</div>
                <span className="rzp-test-ribbon">PAY PENDING ORDER</span>
              </div>
              <button
                type="button"
                className="rzp-close-btn"
                onClick={() => setPayNowModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="rzp-merchant-info">
              <div>
                <p className="rzp-merchant-name">Fodoos Food Delivery</p>
                <p className="rzp-order-ref">Order #{payNowModal.orderId.slice(-8).toUpperCase()}</p>
              </div>
              <div className="rzp-amount-badge">
                ₹{payNowModal.amount}
              </div>
            </div>

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

            <div className="rzp-tab-body">
              {activePaymentTab === 'upi' && (
                <div className="rzp-upi-view">
                  <p className="rzp-label">Select UPI App to Complete Payment</p>
                  <div className="rzp-upi-apps">
                    <div className="upi-app-chip active"><span>🔵 Google Pay</span></div>
                    <div className="upi-app-chip active"><span>🟣 PhonePe</span></div>
                    <div className="upi-app-chip active"><span>🔷 Paytm</span></div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>
                    Receipt will be automatically dispatched to: <b>{payNowModal.address?.email}</b>
                  </p>
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

            <div className="rzp-footer">
              <button
                type="button"
                className="rzp-confirm-pay-btn"
                disabled={verifying}
                onClick={verifyPayNowPayment}
              >
                {verifying ? "Verifying Payment & Sending Receipt..." : `PAY ₹${payNowModal.amount} & GET RECEIPT`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
