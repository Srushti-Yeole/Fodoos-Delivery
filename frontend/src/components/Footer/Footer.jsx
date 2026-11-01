import React from 'react';
import './Footer.css';
import { assets } from '../../assets/assets';

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
          <div className="footer-brand">
            <span className="footer-logo-text">FODOOS</span>
          </div>
          <p>
            Fodoos is dedicated to delivering the finest meals crafted by passionate chefs straight to your doorstep. Experience quick delivery, reliable payment with Razorpay, and mouthwatering cuisines anytime.
          </p>
          <div className="footer-social-icons">
            <div className="social-icon">f</div>
            <div className="social-icon">𝕏</div>
            <div className="social-icon">in</div>
            <div className="social-icon">📸</div>
          </div>
        </div>

        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery Info</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>📞 +91 98765 43210</li>
            <li>✉️ contact@fodoos.com</li>
            <li>📍 Mumbai, Maharashtra, India</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2026 © Fodoos.com - All Rights Reserved. Powered by MERN & Razorpay.
      </p>
    </div>
  );
};

export default Footer;
