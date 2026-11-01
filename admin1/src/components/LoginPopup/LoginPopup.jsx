import React, { useState } from 'react';
import './LoginPopup.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const LoginPopup = ({ setShowLogin, setAdminToken, setAdminUser, url }) => {
  const [currState, setCurrState] = useState("Login");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    let endpoint = currState === "Login" ? "/api/user/login" : "/api/user/register";

    try {
      const response = await axios.post(`${url}${endpoint}`, data);
      if (response.data.success) {
        const token = response.data.token;
        const user = response.data.user || {
          name: data.name || data.email.split("@")[0],
          email: data.email
        };

        setAdminToken(token);
        setAdminUser(user);
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminUser", JSON.stringify(user));

        setShowLogin(false);
        toast.success(currState === "Login" ? "Admin Logged In Successfully!" : "Admin Registered Successfully!");
      } else {
        toast.error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Admin Auth Error:", error);
      toast.error(error.response?.data?.message || "Server connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-popup'>
      <div className="login-popup-backdrop" onClick={() => setShowLogin(false)}></div>
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState === "Login" ? "Admin Login" : "Admin Sign Up"}</h2>
          <button
            type="button"
            onClick={() => setShowLogin(false)}
            className="popup-close-btn"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <div className="input-group">
              <label>Full Name</label>
              <input
                name='name'
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder='Admin Name'
                required
              />
            </div>
          )}

          <div className="input-group">
            <label>Admin Email</label>
            <input
              name='email'
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder='admin@fodoos.com'
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              name='password'
              onChange={onChangeHandler}
              value={data.password}
              type="password"
              placeholder='Enter your password'
              required
            />
          </div>
        </div>

        <button type='submit' className="submit-auth-btn" disabled={loading}>
          {loading ? "Verifying..." : (currState === "Sign Up" ? "Create Admin Account" : "Sign In to Admin Panel")}
        </button>

        <div className="login-toggle-text">
          {currState === "Login" ? (
            <p>
              New administrator?{" "}
              <span onClick={() => setCurrState("Sign Up")} className="link-highlight">
                Register here
              </span>
            </p>
          ) : (
            <p>
              Already an administrator?{" "}
              <span onClick={() => setCurrState("Login")} className="link-highlight">
                Login here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPopup;
