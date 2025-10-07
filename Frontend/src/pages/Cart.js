import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const [products, setProducts] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({}); // key: `${userId}-${productId}`
  const [selectedRentals, setSelectedRentals] = useState({}); // key: `${userId}-${rentalId}`
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
  const USER = localStorage.getItem('user');
  const USER_ID = USER? JSON.parse(USER)["id"] : 1;

  const loadCart = () => {
    setLoading(true);
    setError('');
    fetch(`${API_BASE}/cart/${USER_ID}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to load cart');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Cart data received:', data); // Debugging
        
        const prod = (data.products || []).map(p => ({
          userId: p.userId,
          productId: p.productId,
          name: p.productName || p.name, // Handle both field names
          unitPrice: Number(p.unitPrice || 0),
          quantity: p.quantity,
          subtotal: Number(p.subtotal || (p.unitPrice * p.quantity) || 0)
        }));
        
        const rent = (data.rentals || []).map(r => ({
          userId: r.userId,
          rentalId: r.rentalId,
          name: r.productName || r.name, // Handle both field names
          dailyRate: Number(r.dailyRate || r.unitPrice || 0),
          quantity: r.quantity,
          rentalStart: r.rentalStart,
          rentalEnd: r.rentalEnd,
          subtotal: Number(r.subtotal || 0)
        }));
        setProducts(prod);
        setRentals(rent);
        // default select all
        const sp = {};
        prod.forEach(p => { sp[`${p.userId}-${p.productId}`] = true; });
        const sr = {};
        rent.forEach(r => { sr[`${r.userId}-${r.rentalId}`] = true; });
        setSelectedProducts(sp);
        setSelectedRentals(sr);
      })
      .catch((err) => {
        console.error('loadCart error', err);
        setError('Failed to load cart');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Add a debug logging effect for selected items
  useEffect(() => {
    console.log("Selected Products:", selectedProducts);
    console.log("Selected Rentals:", selectedRentals);
  }, [selectedProducts, selectedRentals]);

  // Update product quantity
  const updateProductQty = (userId, productId, newQuantity) => {
    if (newQuantity < 1) return;
    setError('');
    fetch(`${API_BASE}/cart/product/${userId}/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQuantity })
    })
      .then(async (res) => { if (!res.ok) { throw new Error(await res.text()); } })
      .then(() => loadCart())
      .catch((err) => { console.error(err); setError('Failed to update product'); });
  };

  // Update rental quantity or dates
  const updateRental = (userId, rentalId, payload) => {
    if (payload.quantity && payload.quantity < 1) return;
    if (payload.rentalStart && payload.rentalEnd && payload.rentalStart >= payload.rentalEnd) {
      setError('Rental start must be before end');
      return;
    }
    setError('');
    fetch(`${API_BASE}/cart/rental/${userId}/${rentalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => { if (!res.ok) { throw new Error(await res.text()); } })
      .then(() => loadCart())
      .catch((err) => { console.error(err); setError('Failed to update rental'); });
  };

  const removeProduct = (userId, productId) => {
    setError('');
    fetch(`${API_BASE}/cart/product/${userId}/${productId}`, { method: 'DELETE' })
      .then(async (res) => { if (!res.ok) { throw new Error(await res.text()); } })
      .then(() => loadCart())
      .catch((err) => { console.error(err); setError('Failed to remove product'); });
  };

  const removeRental = (userId, rentalId) => {
    setError('');
    fetch(`${API_BASE}/cart/rental/${userId}/${rentalId}`, { method: 'DELETE' })
      .then(async (res) => { if (!res.ok) { throw new Error(await res.text()); } })
      .then(() => loadCart())
      .catch((err) => { console.error(err); setError('Failed to remove rental'); });
  };

  const calculateSubtotal = () => {
    // Only include products that are selected
    const prodTotal = products.reduce((t, p) => {
      const isSelected = !!selectedProducts[`${p.userId}-${p.productId}`];
      return isSelected ? t + (p.unitPrice * p.quantity) : t;
    }, 0);
    
    // Only include rentals that are selected
    const rentTotal = rentals.reduce((t, r) => {
      const isSelected = !!selectedRentals[`${r.userId}-${r.rentalId}`];
      return isSelected ? t + r.subtotal : t;
    }, 0);
    
    return prodTotal + rentTotal;
  };

  const calculateDiscount = () => 0;

  const calculateTax = () => {
    return calculateSubtotal() * 0.15; // 15% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // combined list of items for summary count
  const cartItems = [...products, ...rentals];

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const navigate = useNavigate();

  // Checkout: call backend then navigate to confirmation / checkout flow
  const handleCheckout = () => {
    setError('');
    
    const selectedProductsArr = Object.entries(selectedProducts)
      .filter(([,v]) => v)
      .map(([k]) => {
        const [, productId] = k.split('-');
        return { userId: Number(USER_ID), productId: Number(productId), rentalId: null };
      });
    
    const selectedRentalsArr = Object.entries(selectedRentals)
      .filter(([,v]) => v)
      .map(([k]) => {
        const [, rentalId] = k.split('-');
        return { userId: Number(USER_ID), productId: null, rentalId: Number(rentalId) };
      });
    
    // Validate at least one item is selected
    if (selectedProductsArr.length === 0 && selectedRentalsArr.length === 0) {
      setError('Please select at least one item to checkout');
      return;
    }
    
    // Log what we're sending for debugging
    console.log('Selected products:', selectedProductsArr);
    console.log('Selected rentals:', selectedRentalsArr);
    
    const body = {
      userId: Number(USER_ID),
      selectedProducts: selectedProductsArr,
      selectedRentals: selectedRentalsArr,
      paymentMethod: 'CARD',
      paymentDetails: 'mock-payment-4242424242424242'
    };
    fetch(`${API_BASE}/cart/${USER_ID}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Checkout failed');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Order success', data);
        navigate('/checkout');
      })
      .catch((err) => {
        console.error('checkout error', err);
        setError('Checkout failed. Please try again.');
      });
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

  if (products.length === 0 && rentals.length === 0) {
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
          {/* Products to Purchase */}
          <div className="cart-items">
            <div className="cart-items-header">
              <h2>Products to Purchase ({products.length})</h2>
              {products.length > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={products.length > 0 && products.every(p => !!selectedProducts[`${p.userId}-${p.productId}`])}
                    onChange={(e) => {
                      const newSelectedProducts = {};
                      products.forEach(p => {
                        newSelectedProducts[`${p.userId}-${p.productId}`] = e.target.checked;
                      });
                      setSelectedProducts(newSelectedProducts);
                    }}
                    style={{ marginRight: '5px' }}
                  />
                  <span>Select All Products</span>
                </label>
              )}
            </div>
            {products.map(p => (
              <div key={`p-${p.userId}-${p.productId}`} className="cart-item">
                <div className="item-details" style={{ flex: 2 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!selectedProducts[`${p.userId}-${p.productId}`]}
                      onChange={(e) => setSelectedProducts({
                        ...selectedProducts,
                        [`${p.userId}-${p.productId}`]: e.target.checked
                      })}
                      style={{ marginRight: 8 }}
                    />
                    <span className="item-name">{p.name}</span>
                  </label>
                  <div className="item-price">
                    <span className="current-price">{formatPrice(p.unitPrice)}</span>
                  </div>
                </div>
                <div className="item-quantity">
                  <div className="quantity-selector">
                    <button className="quantity-btn" onClick={() => updateProductQty(p.userId, p.productId, p.quantity - 1)} disabled={p.quantity <= 1}>-</button>
                    <input type="number" value={p.quantity} onChange={(e) => updateProductQty(p.userId, p.productId, parseInt(e.target.value) || 1)} className="quantity-input" min="1" />
                    <button className="quantity-btn" onClick={() => updateProductQty(p.userId, p.productId, p.quantity + 1)}>+</button>
                  </div>
                </div>
                <div className="item-total">
                  <span className="total-price">{formatPrice(p.unitPrice * p.quantity)}</span>
                </div>
                <button className="remove-btn" onClick={() => removeProduct(p.userId, p.productId)} title="Remove item">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Tools to Rent */}
          <div className="cart-items" style={{ marginTop: 24 }}>
            <div className="cart-items-header">
              <h2>Tools to Rent ({rentals.length})</h2>
              {rentals.length > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={rentals.length > 0 && rentals.every(r => !!selectedRentals[`${r.userId}-${r.rentalId}`])}
                    onChange={(e) => {
                      const newSelectedRentals = {};
                      rentals.forEach(r => {
                        newSelectedRentals[`${r.userId}-${r.rentalId}`] = e.target.checked;
                      });
                      setSelectedRentals(newSelectedRentals);
                    }}
                    style={{ marginRight: '5px' }}
                  />
                  <span>Select All Rentals</span>
                </label>
              )}
            </div>
            {rentals.map(r => (
              <div key={`r-${r.userId}-${r.rentalId}`} className="cart-item">
                <div className="item-details" style={{ flex: 2 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!selectedRentals[`${r.userId}-${r.rentalId}`]}
                      onChange={(e) => setSelectedRentals({
                        ...selectedRentals,
                        [`${r.userId}-${r.rentalId}`]: e.target.checked
                      })}
                      style={{ marginRight: 8 }}
                    />
                    <span className="item-name">{r.name}</span>
                  </label>
                  <div className="item-price">
                    <span className="current-price">{formatPrice(r.dailyRate)} / day</span>
                  </div>
                  <div className="rental-dates" style={{ marginTop: 8 }}>
                    <input type="date" value={r.rentalStart || ''} onChange={(e) => updateRental(r.userId, r.rentalId, { rentalStart: e.target.value, rentalEnd: r.rentalEnd, quantity: r.quantity })} />
                    <span style={{ margin: '0 8px' }}>to</span>
                    <input type="date" value={r.rentalEnd || ''} onChange={(e) => updateRental(r.userId, r.rentalId, { rentalStart: r.rentalStart, rentalEnd: e.target.value, quantity: r.quantity })} />
                  </div>
                </div>
                <div className="item-quantity">
                  <div className="quantity-selector">
                    <button className="quantity-btn" onClick={() => updateRental(r.userId, r.rentalId, { quantity: r.quantity - 1, rentalStart: r.rentalStart, rentalEnd: r.rentalEnd })} disabled={r.quantity <= 1}>-</button>
                    <input type="number" value={r.quantity} onChange={(e) => updateRental(r.userId, r.rentalId, { quantity: parseInt(e.target.value) || 1, rentalStart: r.rentalStart, rentalEnd: r.rentalEnd })} className="quantity-input" min="1" />
                    <button className="quantity-btn" onClick={() => updateRental(r.userId, r.rentalId, { quantity: r.quantity + 1, rentalStart: r.rentalStart, rentalEnd: r.rentalEnd })}>+</button>
                  </div>
                </div>
                <div className="item-total">
                  <span className="total-price">{formatPrice(r.subtotal)}</span>
                </div>
                <button className="remove-btn" onClick={() => removeRental(r.userId, r.rentalId)} title="Remove item">
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
                <span>
                  Subtotal (
                  {Object.values(selectedProducts).filter(Boolean).length + 
                   Object.values(selectedRentals).filter(Boolean).length} selected items)
                </span>
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
              {/* Check if any items are selected before enabling checkout */}
              <button 
                className="btn btn-primary" 
                onClick={handleCheckout}
                disabled={
                  Object.values(selectedProducts).filter(Boolean).length === 0 && 
                  Object.values(selectedRentals).filter(Boolean).length === 0
                }
              >
                <FaCreditCard /> Proceed to Checkout
              </button>
            </div>
            {error && <p style={{ marginTop: 12, color: '#c00' }}>{error}</p>}
            {Object.values(selectedProducts).filter(Boolean).length === 0 && 
             Object.values(selectedRentals).filter(Boolean).length === 0 && 
             <p style={{ marginTop: 12, color: '#c00' }}>Please select at least one item to checkout</p>}
          </div>
        </div>

        {/* Recommended Products - unchanged */}
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
