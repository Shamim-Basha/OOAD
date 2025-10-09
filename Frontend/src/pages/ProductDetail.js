import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { convertByteToImage } from '../utils/imageHelpers';
import { FaStar, FaShoppingCart, FaHeart, FaShare, FaTruck, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const placeholderImage = 'https://via.placeholder.com/400?text=No+Image';

   useEffect(() => {
    axios
      .get(`http://localhost:8080/api/products/${id}`)
      .then((res) => {
  const data = res.data;
  const imageSrc = convertByteToImage(data.image, placeholderImage);

        
        const formattedProduct = {
          ...data,
          imageSrc,
          rating: 4.5, 
          reviews: [],
          features: [
            "High quality and durable material",
            "Available for both retail and rental customers",
            "Ergonomic design and energy efficient"
          ],
          specifications: {
            "Category": data.category || "N/A",
            "Subcategory": data.subCategory || "N/A",
            "Price": `Rs. ${data.price}`,
            "Stock": data.quantity,
          },
          relatedProducts: [] 
        };

        setProduct(formattedProduct);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product details:", err);
        setLoading(false);
      });
  }, [id]);

  const formatPrice = (price) => {
    return `Rs. ${price?.toLocaleString()}`;
  };

  const addToCart = () => {
    console.log("Added to cart:", { ...product, quantity });
    
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-not-found">
            <h2>Product not found</h2>
            <p>The product you're looking for doesn't exist.</p>
            <Link to="/products" className="btn btn-primary">
              <FaArrowLeft /> Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-content">
          {/* Product Image */}
          <div className="product-images">
            <div className="main-image">
              <img src={product.imageSrc} alt={product.name} />
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <span className="category-badge">{product.category}</span>
              <h1>{product.name}</h1>
            </div>

            <div className="product-price">
              <span className="current-price">{formatPrice(product.price)}</span>
            </div>

            <div className="product-stock">
              <span className={`stock-status ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
              {product.quantity > 0 && (
                <span className="stock-count">{product.quantity} units available</span>
              )}
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="quantity-input"
                    min="1"
                    max={product.quantity}
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    disabled={quantity >= product.quantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="btn btn-primary add-to-cart"
                  onClick={addToCart}
                  disabled={product.quantity === 0}
                >
                  <FaShoppingCart /> Add to Cart
                </button>
                <button className="btn btn-outline wishlist-btn">
                  <FaHeart />
                </button>
                <button className="btn btn-outline share-btn">
                  <FaShare />
                </button>
              </div>
            </div>

            <div className="product-features">
              <div className="feature">
                <FaTruck />
                <span>Free delivery in Colombo</span>
              </div>
              <div className="feature">
                <FaShieldAlt />
                <span>Warranty available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="product-tabs">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-tab">
                <h3>Product Description</h3>
                <p>{product.description}</p>
                <h4>Key Features:</h4>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="specifications-tab">
                <h3>Technical Specifications</h3>
                <div className="specs-grid">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="spec-item">
                      <span className="spec-label">{key}:</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products placeholder */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="related-grid">
              {product.relatedProducts.map((related) => (
                <div key={related.id} className="related-item">
                  <img src={related.image} alt={related.name} />
                  <h3>{related.name}</h3>
                  <p className="price">{formatPrice(related.price)}</p>
                  <Link to={`/products/${related.id}`} className="btn btn-outline">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
