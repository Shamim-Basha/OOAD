import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import { convertByteToImage } from '../utils/imageHelpers';
import PaymentForm from '../components/PaymentForm';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [selectedRentals, setSelectedRentals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
  const USER = localStorage.getItem('user');
  const USER_ID = USER ? JSON.parse(USER)["id"] : null;
  
  const placeholderImage = 'https://via.placeholder.com/80?text=No+Image';

  const loadCart = () => {
    setLoading(true);
    setError('');
    console.log('🔄 Loading cart for user:', USER_ID);
    fetch(`${API_BASE}/cart/${USER_ID}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to load cart');
        }
        return res.json();
      })
      .then((data) => {
        console.log('✅ Cart data received:', data);
        console.log('  - Products count:', data.products?.length || 0);
        console.log('  - Rentals count:', data.rentals?.length || 0);
        
        const prod = (data.products || []).map(p => {
          const imageRaw = p.image || p.productImage || p.imageSrc || null;
          return ({
            userId: p.userId,
            productId: p.productId,
            name: p.productName || p.name,
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
            name: r.productName || r.name,
            dailyRate: Number(r.dailyRate || r.unitPrice || 0),
            quantity: r.quantity,
            rentalStart: r.rentalStart,
            rentalEnd: r.rentalEnd,
            subtotal: Number(r.subtotal || 0),
            imageSrc: convertByteToImage(imageRaw, placeholderImage)
          });
        });
        
        console.log('📦 Setting products:', prod.length);
        console.log('🔧 Setting rentals:', rent.length);
        
        setProducts(prod);
        setRentals(rent);
        // Don't auto-select items - let user choose
        const sp = {};
        prod.forEach(p => { sp[`${p.userId}-${p.productId}`] = false; });
        const sr = {};
        rent.forEach(r => { sr[`${r.userId}-${r.rentalId}`] = false; });
        setSelectedProducts(sp);
        setSelectedRentals(sr);
      })
      .catch((err) => {
        console.error('❌ loadCart error:', err);
        setError('Failed to load cart');
      })
      .finally(() => setLoading(false));
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

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  // Checkout: open payment form
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
    
    // Show payment form
    setShowPaymentForm(true);
  };

  // Process payment and complete checkout
  const handlePaymentSubmit = async (paymentData) => {
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
    
    console.log('🛒 Checkout initiated');
    console.log('📋 Checkbox states:', {
      selectedProducts: selectedProducts,
      selectedRentals: selectedRentals
    });
    console.log('📤 Sending to backend:', {
      selectedProducts: selectedProductsArr,
      selectedRentals: selectedRentalsArr
    });
    console.log('💡 This means backend should ONLY delete these items and keep others');
    
    const body = {
      userId: Number(USER_ID),
      selectedProducts: selectedProductsArr,
      selectedRentals: selectedRentalsArr,
      ...paymentData
    };
    
    try {
      const res = await fetch(`${API_BASE}/cart/${USER_ID}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Checkout failed');
      }
      
      const data = await res.json();
      console.log('✅ Order success:', data);
      setShowPaymentForm(false);
      
      console.log('🔄 Reloading cart to show remaining items...');
      // Reload cart to show remaining items (unchecked items stay)
      await loadCart();
      
      console.log('🎯 After reload, cart state:', {
        productsLength: products.length,
        rentalsLength: rentals.length,
        products: products,
        rentals: rentals
      });
      
      // Show success message but stay on cart page
      alert(`✅ Order placed successfully!\n\nOrder ID: ${data.orderId}\n\n✔️ Checked items were removed from cart\n✔️ Unchecked items remain in your cart`);
      
      // Optional: Navigate to user profile after user sees remaining cart
      // navigate('/user-profile', { state: { orderSuccess: true, orderId: data.orderId } });
    } catch (err) {
      console.error('❌ checkout error:', err);
      setError(err.message || 'Checkout failed. Please try again.');
      setShowPaymentForm(false);
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
          {/* Cart Items Side by Side */}
          <div className="cart-items-container">
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
            <div className="cart-items">
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
                <div key={`r-${r.userId}-${r.rentalId}`} className="cart-item rental-cart-item">
                  <div className="rental-item-main">
                    <div className="rental-left-section">
                      <input
                        type="checkbox"
                        checked={!!selectedRentals[`${r.userId}-${r.rentalId}`]}
                        onChange={(e) => setSelectedRentals({
                          ...selectedRentals,
                          [`${r.userId}-${r.rentalId}`]: e.target.checked
                        })}
                        style={{ marginRight: 8, alignSelf: 'flex-start', marginTop: 8 }}
                      />
                      <img src={r.imageSrc} alt={r.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} />
                      <div style={{ flex: 1 }}>
                        <div className="item-name" style={{ fontWeight: 700, fontSize: '15px' }}>{r.name}</div>
                        <div className="item-price" style={{ marginTop: 6 }}>
                          <span className="current-price" style={{ fontSize: '13px' }}>{formatPrice(r.dailyRate)} / day</span>
                        </div>
                      </div>
                      <div className="rental-dates-container">
                        <div className="rental-dates">
                          <div>
                            <label>Start Date</label>
                            <input 
                              type="date" 
                              value={r.rentalStart || ''} 
                              onChange={(e) => updateRental(r.userId, r.rentalId, { rentalStart: e.target.value, rentalEnd: r.rentalEnd, quantity: r.quantity })} 
                            />
                          </div>
                          <div>
                            <label>End Date</label>
                            <input 
                              type="date" 
                              value={r.rentalEnd || ''} 
                              onChange={(e) => updateRental(r.userId, r.rentalId, { rentalStart: r.rentalStart, rentalEnd: e.target.value, quantity: r.quantity })} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rental-right-section">
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
                  </div>
                </div>
              ))}
            </div>
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

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <PaymentForm
            totalAmount={calculateTotal()}
            onPaymentSubmit={handlePaymentSubmit}
            onCancel={() => setShowPaymentForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Cart;
