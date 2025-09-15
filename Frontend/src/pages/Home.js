import React from 'react';
import { Link } from 'react-router-dom';
import { FaTools, FaTruck, FaShieldAlt, FaStar, FaArrowRight } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const featuredProducts = [
    {
      id: 1,
      name: "Bosch Professional Drill",
      price: "Rs. 25,000",
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      category: "Power Tools",
      rating: 4.8
    },
    {
      id: 2,
      name: "Stanley Hammer Set",
      price: "Rs. 3,500",
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      category: "Hand Tools",
      rating: 4.6
    },
    {
      id: 3,
      name: "PVC Pipes 4-inch",
      price: "Rs. 1,200",
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      category: "Plumbing",
      rating: 4.7
    },
    {
      id: 4,
      name: "LED Light Bulbs Pack",
      price: "Rs. 2,800",
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      category: "Electrical",
      rating: 4.9
    }
  ];

  const rentalServices = [
    {
      id: 1,
      name: "Excavator Rental",
      price: "Rs. 15,000/day",
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      description: "Professional excavator for construction projects"
    },
    {
      id: 2,
      name: "Concrete Mixer",
      price: "Rs. 8,000/day",
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      description: "Heavy-duty concrete mixer for large projects"
    },
    {
      id: 3,
      name: "Scaffolding Set",
      price: "Rs. 5,000/day",
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      description: "Complete scaffolding system for construction"
    }
  ];

  const features = [
    {
      icon: <FaTruck />,
      title: "Free Delivery",
      description: "Free delivery across Colombo and surrounding areas"
    },
    {
      icon: <FaShieldAlt />,
      title: "Quality Guarantee",
      description: "All products come with manufacturer warranty"
    },
    {
      icon: <FaTools />,
      title: "Expert Support",
      description: "Professional advice from our experienced team"
    },
    {
      icon: <FaStar />,
      title: "Best Prices",
      description: "Competitive prices for quality hardware products"
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar key={i} className={i <= rating ? 'star filled' : 'star'} />
      );
    }
    return stars;
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Your Trusted Hardware Partner in Sri Lanka</h1>
          <p>Quality tools, equipment, and rental services for all your construction and DIY needs</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">
              Shop Products
            </Link>
            <Link to="/rentals" className="btn btn-outline">
              View Rentals
            </Link>
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

      {/* Featured Products */}
      <section className="featured-products section">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Discover our most popular hardware products</p>
          
          <div className="grid grid-4">
            {featuredProducts.map((product) => (
              <div key={product.id} className="card product-card">
                <img src={product.image} alt={product.name} className="card-img" />
                <div className="card-body">
                  <span className="badge badge-primary">{product.category}</span>
                  <h3 className="card-title">{product.name}</h3>
                  <div className="rating">
                    {renderStars(product.rating)}
                    <span className="rating-text">({product.rating})</span>
                  </div>
                  <div className="card-price">{product.price}</div>
                  <Link to={`/product/${product.id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center" style={{ marginTop: '40px' }}>
            <Link to="/products" className="btn btn-outline">
              View All Products <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Rental Services */}
      <section className="rental-services section">
        <div className="container">
          <h2 className="section-title">Equipment Rental Services</h2>
          <p className="section-subtitle">Professional equipment for your construction projects</p>
          
          <div className="grid grid-3">
            {rentalServices.map((service) => (
              <div key={service.id} className="card service-card">
                <img src={service.image} alt={service.name} className="card-img" />
                <div className="card-body">
                  <h3 className="card-title">{service.name}</h3>
                  <p className="card-text">{service.description}</p>
                  <div className="card-price">{service.price}</div>
                  <Link to={`/rental/${service.id}`} className="btn btn-primary">
                    Rent Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center" style={{ marginTop: '40px' }}>
            <Link to="/rentals" className="btn btn-outline">
              View All Services <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Why Choose Lanka Hardware?</h2>
              <p>
                With over 15 years of experience serving the Sri Lankan construction industry, 
                we have built a reputation for quality, reliability, and excellent customer service. 
                Our extensive inventory includes everything from basic hand tools to advanced power equipment.
              </p>
              <p>
                We understand the unique needs of Sri Lankan builders, contractors, and DIY enthusiasts. 
                That's why we offer both product sales and rental services, ensuring you have access to 
                the right tools for every project, regardless of budget or duration.
              </p>
              <div className="about-stats">
                <div className="stat">
                  <h3>15+</h3>
                  <p>Years Experience</p>
                </div>
                <div className="stat">
                  <h3>5000+</h3>
                  <p>Happy Customers</p>
                </div>
                <div className="stat">
                  <h3>1000+</h3>
                  <p>Products Available</p>
                </div>
              </div>
            </div>
            <div className="about-image">
              <img src="https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=500&h=400&fit=crop" alt="Lanka Hardware Store" />
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
            <Link to="/contact" className="btn btn-primary">
              Contact Us
            </Link>
            <Link to="/products" className="btn btn-outline">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 