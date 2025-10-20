import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaInstagram, FaWhatsapp, FaTools } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset status after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    }, 2000);
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt />,
      title: "Address",
      details: "458/D, Kandy road, Yattogoda, Kandy Road A1, 71350"
    },
    {
      icon: <FaPhone />,
      title: "Phone",
      details: "0352 282 800"
    },
    {
      icon: <FaEnvelope />,
      title: "Email",
      details: "eagleHorizon.info@gmail.com"
    },
    {
      icon: <FaClock />,
      title: "Business Hours",
      details: "Mon-Fri: 8:00 AM - 6:00 PM\nSat: 8:00 AM - 4:00 PM\nSun: 9:00 AM - 2:00 PM"
    }
  ];

  const socialLinks = [
    { icon: <FaFacebook />, url: "https://facebook.com", label: "Facebook" },
    { icon: <FaInstagram />, url: "https://instagram.com", label: "Instagram" },
    { icon: <FaWhatsapp />, url: "https://wa.me/94711234567", label: "WhatsApp" }
  ];

  return (
    <div className="contact-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>Contact Us</h1>
          <p>Get in touch with us for expert advice, quotes, or any questions about our products and services</p>
        </div>

        <div className="contact-content">
          {/* Contact Information */}
          <div className="contact-info-section">
            <div className="contact-info-header">
              <FaTools className="contact-icon" />
              <h2>Get in Touch</h2>
              <p>We're here to help with all your hardware needs. Reach out to us through any of the following channels.</p>
            </div>

            <div className="contact-info-grid">
              {contactInfo.map((info, index) => (
                <div key={index} className="contact-info-item">
                  <div className="info-icon">{info.icon}</div>
                  <div className="info-content">
                    <h3>{info.title}</h3>
                    <p>{info.details}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="social-links-section">
              <h3>Follow Us</h3>
              <div className="social-links">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    {social.icon}
                    <span>{social.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-section">
            <h2>Send us a Message</h2>
            <p>Fill out the form below and we'll get back to you as soon as possible.</p>

            {submitStatus === 'success' && (
              <div className="alert alert-success">
                Thank you for your message! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject" className="form-label">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="product-inquiry">Product Inquiry</option>
                    <option value="rental-service">Rental Service</option>
                    <option value="quote-request">Quote Request</option>
                    <option value="technical-support">Technical Support</option>
                    <option value="general-inquiry">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="form-input form-textarea"
                  rows="5"
                  placeholder="Please describe your inquiry in detail..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

          <div className="store-info">
            <div className="store-detail">
              <h3>Store Location</h3>
              <p>Located in the heart of Colombo, our store is easily accessible by public transport and has ample parking space.</p>
            </div>
            <div className="store-detail">
              <h3>Parking</h3>
              <p>Free parking available for customers. Large vehicles and trucks can be accommodated.</p>
            </div>
            <div className="store-detail">
              <h3>Accessibility</h3>
              <p>Our store is wheelchair accessible with ramps and wide aisles for easy navigation.</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Do you offer delivery services?</h3>
              <p>Yes, we offer free delivery within Colombo and surrounding areas. For other locations, delivery charges apply based on distance.</p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept cash, credit cards, bank transfers, and mobile payments. We also offer installment plans for large purchases.</p>
            </div>
            <div className="faq-item">
              <h3>Do you provide technical support?</h3>
              <p>Yes, our team of experts provides technical support and advice for all our products and rental equipment.</p>
            </div>
            <div className="faq-item">
              <h3>What is your return policy?</h3>
              <p>We offer a 30-day return policy for unused items in original packaging. Some items may have different return terms.</p>
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default Contact; 