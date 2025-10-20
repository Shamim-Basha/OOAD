import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaCalendar, FaClock, FaTruck, FaTools, FaStar, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { convertByteToImage } from '../utils/imageHelpers';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const navigate = useNavigate();

  // Load tools from backend

  const [categories, setCategories] = useState([
    { value: 'all', label: 'All Categories' }
  ]);

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:8080/api/tools');
        const tools = res.data || [];
        // Map tools into UI shape
        const mapped = tools.map(t => ({
          id: t.id,
          name: t.name,
          price: Number(t.dailyRate),
          priceType: 'per day',
          category: t.category,
          categoryName: (t.category || '').replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
          rating: 4.8,
          reviews: 0,
          available: !!t.available,
          stockQuantity: Number(t.stockQuantity ?? 0),
          description: t.description || '',
          features: [],
          minRentalDays: 1,
          maxRentalDays: 30,
          imageSrc: convertByteToImage(t.image, 'https://via.placeholder.com/300?text=No+Image')
        }));
        setServices(mapped);
        const uniqueCats = Array.from(new Set(mapped.map(m => m.category))).filter(Boolean);
        setCategories([{ value: 'all', label: 'All Categories' }, ...uniqueCats.map(c => ({ value: c, label: (c || '').replace('-', ' ').replace(/\b\w/g, ch => ch.toUpperCase()) }))]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory, priceRange]);

  const filterServices = () => {
    let filtered = services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    setFilteredServices(filtered);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar key={i} className={i <= rating ? 'star filled' : 'star'} />
      );
    }
    return stars;
  };

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const handleRentNow = (service) => {
    navigate(`/service/${service.id}`);
  };

  if (loading) {
    return (
      <div className="services-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>Equipment Rental Services</h1>
          <p>Professional equipment rental for construction, events, and industrial projects</p>
        </div>

        {/* Hero Section */}
        <div className="services-hero">
          <div className="hero-content">
            <h2>Why Choose Our Rental Services?</h2>
            <div className="hero-features">
              <div className="hero-feature">
                <FaTools />
                <span>Professional Equipment</span>
              </div>
              <div className="hero-feature">
                <FaTruck />
                <span>Free Delivery</span>
              </div>
              <div className="hero-feature">
                <FaClock />
                <span>Flexible Rental Periods</span>
              </div>
              <div className="hero-feature">
                <FaStar />
                <span>Expert Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="search-filter">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range (per day):</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="price-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                  className="price-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-count">
          <p>Showing {filteredServices.length} of {services.length} rental services</p>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="services-grid">
            {filteredServices.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-art">
                  <div className="service-image">
                    <img src={service.imageSrc} alt={service.name} />
                  </div>
                  {!service.available && (
                    <div className="not-available">Currently Unavailable</div>
                  )}
                </div>
                
                <div className="service-info">
                  <span className="category-badge">{service.categoryName}</span>
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  
                  <div className="service-rating">
                    {renderStars(service.rating)}
                    <span className="rating-count">({service.reviews})</span>
                  </div>
                  
                  <div className="service-price">
                    <span className="current-price">{formatPrice(service.price)}</span>
                    <span className="price-type">/{service.priceType}</span>
                  </div>

                <div className="service-availability" style={{ marginTop: 8 }}>
                  {service.stockQuantity <= 0 ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 8px', borderRadius: 999,
                      background: '#f8d7da', color: '#842029', border: '1px solid #f5c2c7',
                      fontWeight: 600, fontSize: 12
                    }}>
                      <FaTimesCircle /> Out of stock
                    </span>
                  ) : service.stockQuantity <= 3 ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 8px', borderRadius: 999,
                      background: '#fff3cd', color: '#664d03', border: '1px solid #ffe69c',
                      fontWeight: 600, fontSize: 12
                    }}>
                      <FaExclamationTriangle /> Low stock: {service.stockQuantity}
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 8px', borderRadius: 999,
                      background: '#d1e7dd', color: '#0f5132', border: '1px solid #badbcc',
                      fontWeight: 600, fontSize: 12
                    }}>
                      <FaCheckCircle /> In stock: {service.stockQuantity}
                    </span>
                  )}
                </div>

                  <div className="service-features">
                    <h4>Features:</h4>
                    <ul>
                      {service.features.slice(0, 3).map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rental-info">
                    <div className="rental-period">
                      <FaCalendar />
                      <span>Min: {service.minRentalDays} day{service.minRentalDays > 1 ? 's' : ''}</span>
                    </div>
                    <div className="rental-period">
                      <FaClock />
                      <span>Max: {service.maxRentalDays} days</span>
                    </div>
                  </div>
                  
                  <div className="service-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleRentNow(service)}
                      disabled={!service.available || service.stockQuantity <= 0}
                    >
                      Rent Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h3>No rental services found</h3>
            <p>Try adjusting your search criteria or contact us for custom requirements</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceRange([0, 50000]);
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Rental Process */}
        <div className="rental-process">
          <h2>How Our Rental Process Works</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Choose Equipment</h3>
              <p>Browse our extensive catalog and select the equipment you need</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>Book Online</h3>
              <p>Select your rental dates and complete the booking process</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Delivery & Setup</h3>
              <p>We deliver and set up the equipment at your location</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Pickup</h3>
              <p>We collect the equipment when your rental period ends</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services; 