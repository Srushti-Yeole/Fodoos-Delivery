import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import { Route, Routes } from 'react-router-dom';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import LoginPopup from './components/LoginPopup/LoginPopup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const url = "http://localhost:4000";

  const [showLogin, setShowLogin] = useState(false);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("adminToken") || "");
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem("adminUser");
    return saved ? JSON.parse(saved) : null;
  });

  const onLogout = () => {
    setAdminToken("");
    setAdminUser(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    toast.info("Admin Logged Out Successfully");
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        theme="colored"
      />

      {showLogin && (
        <LoginPopup
          setShowLogin={setShowLogin}
          setAdminToken={setAdminToken}
          setAdminUser={setAdminUser}
          url={url}
        />
      )}

      <Navbar
        adminToken={adminToken}
        adminUser={adminUser}
        onLogout={onLogout}
        setShowLogin={setShowLogin}
      />
      <hr />

      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path='/' element={<Add url={url} />} />
          <Route path='/add' element={<Add url={url} />} />
          <Route path='/list' element={<List url={url} />} />
          <Route path='/orders' element={<Orders url={url} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
