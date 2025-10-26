import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTools, FaTruck, FaShieldAlt, FaStar, FaArrowRight, FaPhoneAlt } from 'react-icons/fa';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const features = [
    { icon: <FaTruck />, title: "Free Delivery", description: "Free delivery across Kegalle and surrounding areas" },
    { icon: <FaShieldAlt />, title: "Quality Guarantee", description: "All products come with manufacturer warranty" },
    { icon: <FaTools />, title: "Expert Support", description: "Professional advice from our experienced team" },
    { icon: <FaStar />, title: "Best Prices", description: "Competitive prices for quality hardware products" }
  ];

  if (loading) {
    return (
      <div className="home">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Your Trusted Hardware Partner in Sri Lanka</h1>
          <p>Quality tools, equipment, and rental services for all your construction and DIY needs</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">Shop Products</Link>
            <Link to="/rentals" className="btn btn-outline">View Rentals</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features section">
        <div className="container">
          <div className="grid grid-4">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-text">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section section">
        <div className="container">
            <div className="about-text">
              <h2>Why Choose Eagle Horizon (Pvt) Ltd?</h2>
              <p>With over 15 years of experience serving the Sri Lankan construction industry, we have built a reputation for quality, reliability, and excellent customer service.</p>
              <p>Our extensive inventory includes everything from basic hand tools to advanced power equipment, and we offer both product sales and rental services.</p>
              <div className="about-stats">
                <div className="stat"><h3>15+</h3><p>Years Experience</p></div>
                <div className="stat"><h3>5000+</h3><p>Happy Customers</p></div>
                <div className="stat"><h3>1000+</h3><p>Products Available</p></div>
              </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Your Project?</h2>
          <p>Get in touch with us today for expert advice and competitive quotes</p>
          <div className="cta-buttons">
            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
            <Link to="/products" className="btn btn-outline">Browse Products</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
