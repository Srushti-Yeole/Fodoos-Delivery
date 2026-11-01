# 🍕 Fodoos - Full Stack Food Ordering Application

Fodoos is a modern, full-stack food ordering platform built on the **MERN** stack (MongoDB, Express.js, React, Node.js) with online payment gateway integration powered by **Razorpay** and **Cash on Delivery (COD)**.

---

## 🌟 Architecture & Features

### 1. Customer Frontend (`/frontend`) - `http://localhost:5173`
- **User Authentication**: Register & Login with bcrypt password hashing and JWT token authentication.
- **Hero & Explore Menu**: Category filtering for *Salad, Rolls, Deserts, Sandwich, Cake, Pure Veg, Pasta, Noodles*.
- **Interactive Menu Search**: Search dishes by keyword in real time.
- **Dynamic Cart**: Synchronized cart with backend database, item increment/decrement, subtotal calculation.
- **Discounts & Promo Codes**: Supports promo codes (e.g. `FODOOS20` for 20% off, `WELCOME50` for ₹50 off) and free delivery over ₹500.
- **Checkout & Address Details**: Delivery info form with validation.
- **Razorpay Payment Integration**:
  - Secure order creation with amount in paise.
  - Razorpay hosted / in-app checkout modal with prefilled customer details.
  - Backend payment signature verification via HMAC SHA-256.
  - Automatic cart clearing upon successful payment confirmation.
- **Cash on Delivery (COD)** option with instant confirmation.
- **My Orders & Live Tracking**: Real-time order history with visual status tracker (*Food Processing* ➔ *Out for Delivery* ➔ *Delivered*).

### 2. Admin Panel (`/admin1`) - `http://localhost:5174`
- **Add Food Item**: Upload food picture, select category, add name, description, and price (₹).
- **Manage Food List**: View all foods with thumbnails, remove items, refresh catalog.
- **Order Management**: Real-time customer orders list, payment badges (`Paid via Razorpay`, `COD Pending`, `Unpaid`), and order status update dropdown (*Food Processing*, *Out for Delivery*, *Delivered*, *Cancelled*).

### 3. Backend API (`/backend`) - `http://localhost:4000`
- **Express Server**: CORS, JSON parser, static upload serving (`/uploads` & `/images`).
- **MongoDB Atlas Integration**: Mongoose models for `Food`, `User`, and `Order`.
- **Multer Storage**: Secure image upload handling.
- **JWT & Auth Middleware**: Protected routes for cart and user orders.
- **Razorpay SDK Integration**:
  - `POST /api/order/place`: Creates order in MongoDB and initializes Razorpay Order.
  - `POST /api/order/verify`: Verifies Razorpay payment signature (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`).
  - `POST /api/order/userorders`: Retrieves customer-specific orders.
  - `GET /api/order/list`: Retrieves all orders for Admin panel.
  - `POST /api/order/status`: Updates order fulfillment status.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas connection string (already configured in `.env`)
- Razorpay Test Credentials (configured in `.env`)

### 1. Start the Backend API
```bash
cd Fodoos-main/backend
npm install
npm run server
# Server runs on http://localhost:4000
```

### 2. Start the Customer Frontend
```bash
cd Fodoos-main/frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 3. Start the Admin Panel
```bash
cd Fodoos-main/admin1
npm install
npm run dev
# Admin runs on http://localhost:5174
```

---

## 💳 Razorpay Payment Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as Customer Frontend (React)
    participant Backend as Backend API (Express)
    participant DB as MongoDB Atlas
    participant RZP as Razorpay Gateway

    Customer->>Frontend: Select dishes & Proceed to Checkout
    Customer->>Frontend: Enter delivery details & Choose Razorpay
    Frontend->>Backend: POST /api/order/place (items, address, amount, token)
    Backend->>DB: Save Order (status: "Food Processing", payment: false)
    Backend->>RZP: razorpay.orders.create({ amount, currency: "INR", receipt })
    RZP-->>Backend: Returns razorpayOrder (id, amount, currency)
    Backend-->>Frontend: Return { success: true, orderId, razorpayOrder, key }
    Frontend->>RZP: Open Razorpay Checkout Modal (amount, order_id, prefill)
    Customer->>RZP: Complete payment (UPI / Card / NetBanking)
    RZP-->>Frontend: Payment Success (razorpay_payment_id, razorpay_signature)
    Frontend->>Backend: POST /api/order/verify (orderId, paymentId, signature)
    Backend->>Backend: HMAC SHA-256 Signature Verification
    Backend->>DB: Update Order (payment: true, paymentId, signature)
    Backend->>DB: Clear Customer Cart
    Backend-->>Frontend: { success: true, message: "Payment verified" }
    Frontend-->>Customer: Redirect to /myorders with Success Toast
```

---

## 🔒 Environment Configuration (`backend/.env`)

```env
PORT=4000
MONGODB_URI=mongodb+srv://Atharv:Atharv11@cluster0.ic05ypi.mongodb.net/foodos?retryWrites=true&w=majority
JWT_SECRET=Fodoos@2026#MySecureSecretKey
RAZORPAY_KEY_ID=rzp_test_5173fodooskey
RAZORPAY_KEY_SECRET=fodoos_razorpay_secret_key_2026
```
*(To use live/test keys from your own Razorpay Dashboard, simply replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with your credentials from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)).*
