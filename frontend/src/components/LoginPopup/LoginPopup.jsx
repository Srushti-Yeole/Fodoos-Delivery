import React, { useContext, useState } from 'react';
import './LoginPopup.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const LoginPopup = ({ setShowLogin }) => {
  const { url, saveAuth } = useContext(StoreContext);
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

    let newUrl = url;
    if (currState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }

    try {
      const response = await axios.post(newUrl, data);
      if (response.data.success) {
        saveAuth(response.data.token, response.data.user || { name: data.name || data.email.split("@")[0], email: data.email });
        setShowLogin(false);
        toast.success(response.data.message || (currState === "Login" ? "Welcome back!" : "Account created successfully!"));
      } else {
        toast.error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);
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
          <h2>{currState}</h2>
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
                placeholder='Your Name'
                required
              />
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <input
              name='email'
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder='your.email@example.com'
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
              placeholder={currState === "Sign Up" ? "At least 8 characters" : "Enter password"}
              required
            />
          </div>
        </div>

        <button type='submit' className="submit-auth-btn" disabled={loading}>
          {loading ? "Please wait..." : (currState === "Sign Up" ? "Create Account" : "Sign In")}
        </button>

        <div className="login-popup-condition">
          <input type="checkbox" id="terms" required defaultChecked />
          <label htmlFor="terms">
            By continuing, I agree to the terms of use & privacy policy.
          </label>
        </div>

        <div className="login-toggle-text">
          {currState === "Login" ? (
            <p>
              New to Fodoos?{" "}
              <span onClick={() => setCurrState("Sign Up")} className="link-highlight">
                Create an account
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
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
