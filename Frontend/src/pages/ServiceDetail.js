import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaStar, FaCalendar, FaClock, FaTruck, FaShieldAlt, FaArrowLeft, FaPhone, FaEnvelope, FaTools } from 'react-icons/fa';
import axios from 'axios';
import './ServiceDetail.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rentalDays, setRentalDays] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Calculate rental days from selected dates
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.max(1, Math.round(timeDiff / (1000 * 3600 * 24))); // exclusive end date
      if (daysDiff > 0) {
        setRentalDays(daysDiff);
      }
    }
  }, [startDate, endDate]);

  // Days are strictly derived from dates; no manual +/- controls
  const [activeTab, setActiveTab] = useState('details');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTool = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8080/api/tools/${id}`);
        const t = res.data;
        if (!t) {
          setService(null);
        } else {
          const defaultSpecs = (() => {
            const n = (t.name || '').toLowerCase();
            if (n.includes('excavator')) {
              return {
                'Engine Power': '85 HP',
                'Operating Weight': '8,500 kg',
                'Max Digging Depth': '6.5 m',
                'Fuel Type': 'Diesel'
              };
            }
            if (n.includes('cement') || n.includes('mixer')) {
              return {
                'Drum Capacity': '350 L',
                'Power': '3 kW',
                'Output': '8–10 m³/h',
                'Power Source': 'Electric'
              };
            }
            if (n.includes('scaffold')) {
              return {
                'Max Height': '10 m',
                'Material': 'Steel/Aluminium',
                'Load Rating': 'Up to 200 kg/m²',
                'Standards': 'EN 12811'
              };
            }
            if (n.includes('wacker') || n.includes('compactor')) {
              return {
                'Plate Size': '500 × 350 mm',
                'Centrifugal Force': '15 kN',
                'Travel Speed': 'Up to 25 m/min',
                'Fuel Type': 'Petrol'
              };
            }
            if (n.includes('drill')) {
              return {
                'Power': '750 W',
                'Chuck Size': '13 mm',
                'Speed': '0–3000 RPM',
                'Modes': 'Drill / Hammer'
              };
            }
            if (n.includes('ladder')) {
              return {
                'Type': 'Foldable',
                'Max Height': '12 ft',
                'Material': 'Aluminium',
                'Load Rating': '150 kg'
              };
            }
            return {
              'Category': t.category || 'General',
              'Condition': 'Industrial grade',
              'Support': '24/7 phone support',
              'Delivery': 'Available in Colombo'
            };
          })();
          const mapped = {
            id: t.id,
            name: t.name,
            price: Number(t.dailyRate),
            priceType: 'per day',
            images: [],
            category: (t.category || '').replace('-', ' '),
            categoryName: (t.category || '').replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
            rating: 4.8,
            reviews: [],
            available: !!t.available,
            description: t.description || '',
            specifications: defaultSpecs,
            features: [],
            rentalTerms: [
              'Minimum rental period: 1 day',
              'Maximum rental period: 30 days'
            ],
            relatedServices: []
          };
          setService(mapped);
        }
      } catch (e) {
        console.error(e);
        setService(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTool();
  }, [id]);

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

  const calculateTotalPrice = () => {
    if (!service) return 0;
    return service.price * rentalDays * quantity;
  };

  const fees = useMemo(() => {
    const subtotal = calculateTotalPrice();
    const delivery = subtotal > 0 ? 1500 : 0; // sample delivery fee
    const insurance = Math.round(subtotal * 0.05);
    const tax = Math.round(subtotal * 0.02);
    const total = subtotal + delivery + insurance + tax;
    return { subtotal, delivery, insurance, tax, total };
  }, [service, rentalDays, quantity]);

  const handleRentNow = async () => {
    if (!service) return;
    // Basic client-side validation to match backend constraints
    if (!startDate || !endDate) {
      alert('Please select start and end dates.');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (startDate < todayStr) {
      alert('Start date cannot be in the past.');
      return;
    }
    if (endDate <= startDate) {
      alert('End date must be after start date.');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const USER = localStorage.getItem('user');
      const userId = USER? JSON.parse(USER)["id"] : 1;
      
      // Add rental item to cart instead of creating rental directly
      const payload = {
        userId,
        rentalId: Number(service.id), // Use service.id as rentalId for tools
        quantity: 1,
        rentalStart: startDate,
        rentalEnd: endDate
      };
      
      // Log full details for debugging
      console.log('Sending rental cart add request:', JSON.stringify(payload));
      
      try {
        const res = await axios.post('http://localhost:8080/api/cart/rental/add', payload);
        console.log('Rental cart add response:', res.data);
        alert('Item added to cart successfully!');
        navigate('/cart');
      } catch (apiError) {
        console.error('API Error:', apiError);
        console.error('Response:', apiError.response);
        const message = apiError?.response?.data || apiError?.message || 'Failed to add item to cart';
        alert(`Error adding to cart: ${message}`);
      }
    } catch (e) {
      console.error('General error in handleRentNow:', e);
      const message = e?.response?.data?.message || e?.message || 'Failed to add item to cart';
      alert(`Error: ${message}`);
    }
  };

  const handleInquiry = () => {
    // TODO: Implement inquiry functionality
    console.log('Sending inquiry for:', service);
  };

  if (loading) {
    return (
      <div className="service-detail-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-detail-page">
        <div className="container">
          <div className="service-not-found">
            <h2>Service not found</h2>
            <p>The rental service you're looking for doesn't exist.</p>
            <Link to="/services" className="btn btn-primary">
              <FaArrowLeft /> Back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/services">Services</Link>
          <span>/</span>
          <Link to={`/services?category=${service.category.toLowerCase()}`}>{service.categoryName}</Link>
          <span>/</span>
          <span>{service.name}</span>
        </div>

        <div className="service-content">
          {/* Service Art Placeholder */}
          <div className="service-art">
            <div className="art-circle large">
              <FaTools size={40} />
            </div>
          </div>

          {/* Service Info */}
          <div className="service-info">
            <div className="service-header">
              <span className="category-badge">{service.categoryName}</span>
              <h1>{service.name}</h1>
              <div className="service-rating">
                {renderStars(service.rating)}
                <span className="rating-text">({service.rating})</span>
                <span className="review-count">{service.reviews.length} reviews</span>
              </div>
            </div>

            <div className="service-price">
              <span className="current-price">{formatPrice(service.price)}</span>
              <span className="price-type">/{service.priceType}</span>
            </div>

            <div className="service-availability">
              <span className={`availability-status ${service.available ? 'available' : 'unavailable'}`}>
                {service.available ? 'Available for Rent' : 'Currently Unavailable'}
              </span>
            </div>

            <div className="service-description">
              <p>{service.description}</p>
            </div>

            {/* Rental Form */}
            <div className="rental-form">
              <h3>Rental Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      const selectedEndDate = e.target.value;
                      if (startDate && selectedEndDate <= startDate) {
                        alert('End date must be after start date');
                        return;
                      }
                      setEndDate(selectedEndDate);
                    }}
                    className="form-input"
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Number of Days</label>
                <div className="days-display" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', background: '#f8f9fa' }}>
                    {rentalDays}
                  </span>
                  <small style={{ color: '#666' }}>Calculated from selected dates</small>
                </div>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <div className="quantity-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="days-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                    className="days-input"
                    min="1"
                    max="5"
                  />
                  <button
                    type="button"
                    className="days-btn"
                    onClick={() => setQuantity(Math.min(5, quantity + 1))}
                    disabled={quantity >= 5}
                  >
                    +
                  </button>
                </div>
                <small style={{ color: '#666' }}>Limited rental quantity (max 5)</small>
              </div>

              <div className="rental-summary">
                <div className="summary-item">
                  <span>Daily Rate:</span>
                  <span>{formatPrice(service.price)}</span>
                </div>
                <div className="summary-item">
                  <span>Number of Days:</span>
                  <span>{rentalDays} {rentalDays === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="summary-item">
                  <span>Subtotal:</span>
                  <span>{formatPrice(fees.subtotal)}</span>
                </div>
                <div className="summary-item">
                  <span>Delivery:</span>
                  <span>{formatPrice(fees.delivery)}</span>
                </div>
                <div className="summary-item">
                  <span>Insurance (5%):</span>
                  <span>{formatPrice(fees.insurance)}</span>
                </div>
                <div className="summary-item">
                  <span>Tax (2%):</span>
                  <span>{formatPrice(fees.tax)}</span>
                </div>
                <div className="summary-item total">
                  <span>Estimated Total:</span>
                  <span>{formatPrice(fees.total)}</span>
                </div>
              </div>

              <div className="rental-actions">
                <button
                  className="btn btn-primary rent-btn"
                  onClick={handleRentNow}
                  disabled={!service.available || !startDate || !endDate}
                >
                  Rent Now
                </button>
                <button className="btn btn-outline inquiry-btn" onClick={handleInquiry}>
                  Send Inquiry
                </button>
              </div>
            </div>

            <div className="service-features">
              <div className="feature">
                <FaTruck />
                <span>Free delivery in Colombo</span>
              </div>
              <div className="feature">
                <FaShieldAlt />
                <span>Insurance included</span>
              </div>
              <div className="feature">
                <FaPhone />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Tabs */}
        <div className="service-tabs">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={`tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => setActiveTab('terms')}
            >
              Rental Terms
            </button>
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({service.reviews.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'details' && (
              <div className="details-tab">
                <h3>Service Details</h3>
                <p>{service.description}</p>
                <h4>Key Features:</h4>
                <ul>
                  {service.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="specifications-tab">
                <h3>Technical Specifications</h3>
                <div className="specs-grid">
                  {Object.entries(service.specifications).map(([key, value]) => (
                    <div key={key} className="spec-item">
                      <span className="spec-label">{key}:</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="terms-tab">
                <h3>Rental Terms & Conditions</h3>
                <ul>
                  {service.rentalTerms.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
                <div className="additional-info">
                  <h4>Additional Information</h4>
                  <p>All rentals include comprehensive insurance coverage and 24/7 technical support. Delivery and pickup services are available within Colombo and surrounding areas.</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                <h3>Customer Reviews</h3>
                <div className="reviews-list">
                  {service.reviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <span className="reviewer-name">{review.user}</span>
                        <div className="review-rating">
                          {renderStars(review.rating)}
                        </div>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Services */}
        <div className="related-services">
          <h2>Related Services</h2>
          <div className="related-grid">
            {service.relatedServices.map(relatedService => (
              <div key={relatedService.id} className="related-item">
                <img src={relatedService.image} alt={relatedService.name} />
                <h3>{relatedService.name}</h3>
                <p className="price">{formatPrice(relatedService.price)}/day</p>
                <Link to={`/service/${relatedService.id}`} className="btn btn-outline">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail; 