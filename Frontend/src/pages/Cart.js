import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { convertByteToImage } from '../utils/imageHelpers';
import { FaTrash, FaArrowLeft, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const [products, setProducts] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({}); // key: `${userId}-${productId}` - Updated layout to include images
  const [selectedRentals, setSelectedRentals] = useState({}); // key: `${userId}-${rentalId}`
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
  const USER = localStorage.getItem('user');
  const USER_ID = USER? JSON.parse(USER)["id"] : null;

  const placeholderImage = 'https://via.placeholder.com/80?text=No+Image';

  const loadCart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/cart/${USER_ID}`);
      const data = res.data;
      console.log('Cart data received:', data); // Debugging

      const prod = (data.products || []).map(p => {
        const imageRaw = p.image || p.productImage || p.imageSrc || null;
        return ({
          userId: p.userId,
          productId: p.productId,
          name: p.productName || p.name, // Handle both field names
          unitPrice: Number(p.unitPrice || 0),
          quantity: p.quantity,
          subtotal: Number(p.subtotal || (p.unitPrice * p.quantity) || 0),
          imageSrc: convertByteToImage(imageRaw, placeholderImage)
        });
      });

      const rent = (data.rentals || []).map(r => {
        const imageRaw = r.image || r.productImage || r.imageSrc || null;
        return ({
          userId: r.userId,
          rentalId: r.rentalId,
          name: r.productName || r.name, // Handle both field names
          dailyRate: Number(r.dailyRate || r.unitPrice || 0),
          quantity: r.quantity,
          rentalStart: r.rentalStart,
          rentalEnd: r.rentalEnd,
          subtotal: Number(r.subtotal || 0),
          imageSrc: convertByteToImage(imageRaw, placeholderImage)
        });
      });

      setProducts(prod);
      setRentals(rent);
      // default select all
      const sp = {};
      prod.forEach(p => { sp[`${p.userId}-${p.productId}`] = true; });
      const sr = {};
      rent.forEach(r => { sr[`${r.userId}-${r.rentalId}`] = true; });
      setSelectedProducts(sp);
      setSelectedRentals(sr);
    } catch (err) {
      console.error('loadCart error', err);
      setError(err?.response?.data || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    if (!USER) {
      setError('Please log in to view your cart');
      navigate('/login');
      return;
    }
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Add a debug logging effect for selected items
  useEffect(() => {
    console.log("Selected Products:", selectedProducts);
    console.log("Selected Rentals:", selectedRentals);
  }, [selectedProducts, selectedRentals]);

  // Update product quantity
  const updateProductQty = async (userId, productId, newQuantity) => {
    if (newQuantity < 1) return;
    setError('');
    try {
      await axios.put(`${API_BASE}/cart/product/${userId}/${productId}`, { quantity: newQuantity });
      await loadCart();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data || 'Failed to update product');
    }
  };

  // Update rental quantity or dates
  const updateRental = async (userId, rentalId, payload) => {
    if (payload.quantity && payload.quantity < 1) return;
    if (payload.rentalStart && payload.rentalEnd && payload.rentalStart >= payload.rentalEnd) {
      setError('Rental start must be before end');
      return;
    }
    setError('');
    try {
      await axios.put(`${API_BASE}/cart/rental/${userId}/${rentalId}`, payload);
      await loadCart();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data || 'Failed to update rental');
    }
  };

  const removeProduct = async (userId, productId) => {
    setError('');
    try {
      await axios.delete(`${API_BASE}/cart/product/${userId}/${productId}`);
      await loadCart();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data || 'Failed to remove product');
    }
  };

  const removeRental = async (userId, rentalId) => {
    setError('');
    try {
      await axios.delete(`${API_BASE}/cart/rental/${userId}/${rentalId}`);
      await loadCart();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data || 'Failed to remove rental');
    }
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

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const navigate = useNavigate();

  // Checkout: call backend then navigate to confirmation / checkout flow
  const handleCheckout = async () => {
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
    try {
      const res = await axios.post(`${API_BASE}/cart/${USER_ID}/checkout`, body);
      console.log('Order success', res.data);
      navigate('/checkout');
    } catch (err) {
      console.error('checkout error', err);
      setError(err?.response?.data || 'Checkout failed. Please try again.');
    }
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
                <div className="item-details" style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="checkbox"
                    checked={!!selectedProducts[`${p.userId}-${p.productId}`]}
                    onChange={(e) => setSelectedProducts({
                      ...selectedProducts,
                      [`${p.userId}-${p.productId}`]: e.target.checked
                    })}
                    style={{ marginRight: 8, alignSelf: 'center' }}
                  />
                  <img src={p.imageSrc} alt={p.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <div className="item-name" style={{ fontWeight: 700 }}>{p.name}</div>
                    <div className="item-price" style={{ marginTop: 6 }}>
                      <span className="current-price">{formatPrice(p.unitPrice)}</span>
                    </div>
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
                <div className="item-details" style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="checkbox"
                    checked={!!selectedRentals[`${r.userId}-${r.rentalId}`]}
                    onChange={(e) => setSelectedRentals({
                      ...selectedRentals,
                      [`${r.userId}-${r.rentalId}`]: e.target.checked
                    })}
                    style={{ marginRight: 8, alignSelf: 'center' }}
                  />
                  <img src={r.imageSrc} alt={r.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <div className="item-name" style={{ fontWeight: 700 }}>{r.name}</div>
                    <div className="item-price" style={{ marginTop: 6 }}>
                      <span className="current-price">{formatPrice(r.dailyRate)} / day</span>
                    </div>
                    <div className="rental-dates" style={{ marginTop: 8 }}>
                      <input type="date" value={r.rentalStart || ''} onChange={(e) => updateRental(r.userId, r.rentalId, { rentalStart: e.target.value, rentalEnd: r.rentalEnd, quantity: r.quantity })} />
                      <span style={{ margin: '0 8px' }}>to</span>
                      <input type="date" value={r.rentalEnd || ''} onChange={(e) => updateRental(r.userId, r.rentalId, { rentalStart: r.rentalStart, rentalEnd: e.target.value, quantity: r.quantity })} />
                    </div>
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
      </div>
    </div>
  );
};

export default Cart;
