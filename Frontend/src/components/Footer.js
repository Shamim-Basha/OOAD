import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt, FaTools } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <FaTools className="footer-logo" />
              <h3>Eagle Horizon (Pvt) Ltd</h3>
            </div>
            <p>
              Your trusted partner for quality hardware products and professional rental services across Sri Lanka. 
              We provide the best tools and equipment for all your construction and DIY needs.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://wa.me/94711234567" target="_blank" rel="noopener noreferrer">
                <FaWhatsapp />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/rentals">Rental Services</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Product Categories</h4>
            <ul>
              <li><Link to="/products?category=power-tools">Power Tools</Link></li>
              <li><Link to="/products?category=hand-tools">Hand Tools</Link></li>
              <li><Link to="/products?category=plumbing">Plumbing</Link></li>
              <li><Link to="/products?category=electrical">Electrical</Link></li>
              <li><Link to="/products?category=paint">Paint & Supplies</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-info">
              <div className="contact-item">
                <FaMapMarkerAlt />
                <span>123 Main Street, Colombo 03, Sri Lanka</span>
              </div>
              <div className="contact-item">
                <FaPhone />
                <span>+94 11 234 5678</span>
              </div>
              <div className="contact-item">
                <FaEnvelope />
                <span>info@lankahardware.lk</span>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <div className="business-hours">
              <h5>Business Hours</h5>
              <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
              <p>Saturday: 8:00 AM - 4:00 PM</p>
              <p>Sunday: 9:00 AM - 2:00 PM</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 Eagle Horizon (Pvt) Ltd. All rights reserved.</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/shipping">Shipping Info</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 