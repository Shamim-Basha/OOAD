import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
  const USER_ID = Number(process.env.REACT_APP_USER_ID || localStorage.getItem('userId') || 1);

  const loadCart = () => {
    setLoading(true);
    setError('');
    fetch(`${API_BASE}/cart/user/${USER_ID}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to load cart');
        }
        return res.json();
      })
      .then((data) => {
        const mapped = (data.cartItems || []).map((ci) => ({
          id: ci.id, // cart item id
          productId: ci.product?.id,
          name: ci.product?.name,
          price: Number(ci.unitPrice),
          originalPrice: Number(ci.product?.originalPrice ?? ci.unitPrice),
          image: ci.product?.imageUrl,
          category: ci.product?.categoryName,
          quantity: ci.quantity,
          inStock: ci.available
        }));
        setCartItems(mapped);
      })
      .catch(() => setError('Failed to load cart'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    fetch(`${API_BASE}/cart/user/${USER_ID}/update?productId=${encodeURIComponent(productId)}&quantity=${encodeURIComponent(newQuantity)}`, {
      method: 'PUT'
    })
      .then(() => loadCart())
      .catch(() => setError('Failed to update quantity'));
  };

  const removeItem = (productId) => {
    fetch(`${API_BASE}/cart/user/${USER_ID}/remove?productId=${encodeURIComponent(productId)}`, {
      method: 'DELETE'
    })
      .then(() => loadCart())
      .catch(() => setError('Failed to remove item'));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    return cartItems.reduce((total, item) => {
      const originalTotal = item.originalPrice * item.quantity;
      const currentTotal = item.price * item.quantity;
      return total + (originalTotal - currentTotal);
    }, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.15; // 15% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <FaShoppingCart className="empty-cart-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any products to your cart yet.</p>
            <Link to="/products" className="btn btn-primary">
              <FaArrowLeft /> Continue Shopping
            </Link>
            {error && <p style={{ marginTop: 12, color: '#c00' }}>{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>Review your items and proceed to checkout</p>
        </div>

        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items">
            <div className="cart-items-header">
              <h2>Cart Items ({cartItems.length})</h2>
            </div>

            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-category">{item.category}</p>
                  <div className="item-price">
                    <span className="current-price">{formatPrice(item.price)}</span>
                    {item.originalPrice > item.price && (
                      <span className="original-price">{formatPrice(item.originalPrice)}</span>
                    )}
                  </div>
                </div>

                <div className="item-quantity">
                  <div className="quantity-selector">
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                      className="quantity-input"
                      min="1"
                    />
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="item-total">
                  <span className="total-price">{formatPrice(item.price * item.quantity)}</span>
                  {item.originalPrice > item.price && (
                    <span className="savings">
                      Save {formatPrice((item.originalPrice - item.price) * item.quantity)}
                    </span>
                  )}
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.productId)}
                  title="Remove item"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
              <div className="summary-item">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              
              {calculateDiscount() > 0 && (
                <div className="summary-item discount">
                  <span>Discount</span>
                  <span>-{formatPrice(calculateDiscount())}</span>
                </div>
              )}
              
              <div className="summary-item">
                <span>Tax (15%)</span>
                <span>{formatPrice(calculateTax())}</span>
              </div>
              
              <div className="summary-item total">
                <span>Total</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            <div className="delivery-info">
              <h3>Delivery Information</h3>
              <p>Free delivery within Colombo and surrounding areas</p>
              <p>Estimated delivery: 2-3 business days</p>
            </div>

            <div className="payment-methods">
              <h3>Payment Methods</h3>
              <div className="payment-icons">
                <span>Cash</span>
                <span>Credit Card</span>
                <span>Bank Transfer</span>
                <span>Mobile Payment</span>
              </div>
            </div>

            <div className="cart-actions">
              <Link to="/products" className="btn btn-outline">
                <FaArrowLeft /> Continue Shopping
              </Link>
              <button className="btn btn-primary" onClick={handleCheckout}>
                <FaCreditCard /> Proceed to Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="recommended-products">
          <h2>You might also like</h2>
          <div className="recommended-grid">
            <div className="recommended-item">
              <img src="https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=200&h=150&fit=crop" alt="Recommended product" />
              <h3>Dewalt Circular Saw</h3>
              <p className="price">Rs. 45,000</p>
              <button className="btn btn-outline">Add to Cart</button>
            </div>
            <div className="recommended-item">
              <img src="https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=200&h=150&fit=crop" alt="Recommended product" />
              <h3>Paint Brushes Set</h3>
              <p className="price">Rs. 1,500</p>
              <button className="btn btn-outline">Add to Cart</button>
            </div>
            <div className="recommended-item">
              <img src="https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=200&h=150&fit=crop" alt="Recommended product" />
              <h3>LED Light Bulbs Pack</h3>
              <p className="price">Rs. 2,800</p>
              <button className="btn btn-outline">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 