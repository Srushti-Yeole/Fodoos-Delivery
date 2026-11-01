import React, { useEffect, useState } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from "../../assets/assets";

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: newStatus
      });
      if (response.data.success) {
        toast.success(`Order status updated to: ${newStatus}`);
        await fetchAllOrders();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating order status");
    }
  };

  const markPaidHandler = async (orderId, method) => {
    try {
      const response = await axios.post(`${url}/api/order/mark-paid`, {
        orderId,
        paymentMethod: method || 'COD'
      });
      if (response.data.success) {
        toast.success("Order marked as Paid! Receipt emailed to customer ✉️");
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || "Could not mark order paid");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error marking order as paid");
    }
  };

  const openReceipt = (orderId) => {
    window.open(`${url}/api/order/receipt/${orderId}`, '_blank');
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div className='order add'>
      <div className="order-header">
        <h3>Customer Orders ({orders.length})</h3>
        <button onClick={fetchAllOrders} className="refresh-btn">
          {loading ? 'Refreshing...' : '🔄 Refresh Orders'}
        </button>
      </div>

      {orders.length === 0 && !loading ? (
        <div className="no-orders">
          <p>No orders placed yet.</p>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order, index) => {
            const address = order.address || {};
            const items = order.items || [];
            const isPaid = order.payment === true;

            return (
              <div key={order._id || index} className='order-item'>
                <img src={assets.parcel_icon} alt="Order" className="order-parcel-icon" />
                <div>
                  <p className="order-item-food">
                    {items.map((item, idx) => {
                      const suffix = idx === items.length - 1 ? "" : ", ";
                      return `${item.name || 'Food item'} x ${item.quantity || 1}${suffix}`;
                    })}
                  </p>
                  <p className="order-item-name">
                    {(address.firstName || '') + " " + (address.lastName || '')}
                  </p>
                  <div className="order-item-address">
                    <p>{(address.street ? address.street + ", " : "")}</p>
                    <p>
                      {[address.city, address.state, address.zipcode, address.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <p className='order-item-phone'>
                    📞 {address.phone || 'No phone'} | ✉️ {address.email || 'No email'}
                  </p>
                  <p className="order-item-date">
                    📅 {new Date(order.date || Date.now()).toLocaleString()}
                  </p>
                </div>

                <div className="order-meta">
                  <p className="order-items-count"><b>Items:</b> {items.length}</p>
                  <p className="order-amount"><b>₹{order.amount}</b></p>
                  <div className="payment-status-badge">
                    {isPaid ? (
                      <span className="badge paid">✅ Paid ({order.paymentMethod || 'Razorpay'})</span>
                    ) : order.paymentMethod === 'COD' ? (
                      <span className="badge cod">💵 COD (Pending)</span>
                    ) : (
                      <span className="badge pending">⏳ Payment Pending</span>
                    )}
                  </div>

                  {/* Mark Paid button for Admin (COD collection) */}
                  {!isPaid && (
                    <button
                      onClick={() => markPaidHandler(order._id, order.paymentMethod)}
                      className="mark-paid-btn"
                      title="Collect cash and issue email receipt"
                    >
                      💵 Mark Paid (Cash Collected)
                    </button>
                  )}

                  <button
                    onClick={() => openReceipt(order._id)}
                    className="admin-receipt-btn"
                    title="View printable official receipt"
                  >
                    📄 View Receipt
                  </button>
                </div>

                <div className="order-status-control">
                  <label htmlFor={`status-${order._id}`}>Status:</label>
                  <select
                    id={`status-${order._id}`}
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status || "Food Processing"}
                    className={`status-select ${(order.status || '').toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <option value="Food Processing">Food Processing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
