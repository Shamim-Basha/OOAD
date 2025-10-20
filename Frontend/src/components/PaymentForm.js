import React, { useState } from 'react';
import './PaymentForm.css';

const PaymentForm = ({ totalAmount, onPaymentSubmit, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});

  const validateCardNumber = (number) => {
    // Remove spaces and check if it's 16 digits
    const cleaned = number.replace(/\s/g, '');
    return /^\d{16}$/.test(cleaned);
  };

  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const validateExpiry = (month, year) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardDetails({
        ...cardDetails,
        cardNumber: formatCardNumber(value)
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (paymentMethod === 'CARD') {
      if (!validateCardNumber(cardDetails.cardNumber)) {
        newErrors.cardNumber = 'Invalid card number (must be 16 digits)';
      }
      if (!cardDetails.cardHolderName.trim()) {
        newErrors.cardHolderName = 'Card holder name is required';
      }
      if (!validateExpiry(cardDetails.expiryMonth, cardDetails.expiryYear)) {
        newErrors.expiry = 'Invalid or expired card';
      }
      if (!validateCVV(cardDetails.cvv)) {
        newErrors.cvv = 'Invalid CVV (3 or 4 digits)';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare payment data
    const paymentData = {
      paymentMethod,
      ...(paymentMethod === 'CARD' && {
        cardNumber: cardDetails.cardNumber.replace(/\s/g, ''),
        cardHolderName: cardDetails.cardHolderName,
        expiryMonth: cardDetails.expiryMonth,
        expiryYear: cardDetails.expiryYear,
        cvv: cardDetails.cvv
      })
    };

    onPaymentSubmit(paymentData);
  };

  return (
    <div className="payment-form-overlay">
      <div className="payment-form-container">
        <div className="payment-form-header">
          <h2>Payment Details</h2>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>

        <div className="payment-amount">
          <span>Total Amount:</span>
          <span className="amount">Rs. {totalAmount?.toLocaleString()}</span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Payment Method Selection */}
          <div className="payment-method-selection">
            <label className="payment-method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="CARD"
                checked={paymentMethod === 'CARD'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Credit/Debit Card</span>
            </label>
            <label className="payment-method-option">
              <input
                type="radio"
                name="paymentMethod"
                value="CASH"
                checked={paymentMethod === 'CASH'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>Cash on Delivery</span>
            </label>
          </div>

          {/* Card Payment Form */}
          {paymentMethod === 'CARD' && (
            <div className="card-payment-form">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength="19"
                  className={errors.cardNumber ? 'error' : ''}
                />
                {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
              </div>

              <div className="form-group">
                <label>Card Holder Name</label>
                <input
                  type="text"
                  placeholder="JOHN DOE"
                  value={cardDetails.cardHolderName}
                  onChange={(e) => setCardDetails({...cardDetails, cardHolderName: e.target.value.toUpperCase()})}
                  className={errors.cardHolderName ? 'error' : ''}
                />
                {errors.cardHolderName && <span className="error-message">{errors.cardHolderName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Month</label>
                  <select
                    value={cardDetails.expiryMonth}
                    onChange={(e) => setCardDetails({...cardDetails, expiryMonth: e.target.value})}
                    className={errors.expiry ? 'error' : ''}
                  >
                    <option value="">MM</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Expiry Year</label>
                  <select
                    value={cardDetails.expiryYear}
                    onChange={(e) => setCardDetails({...cardDetails, expiryYear: e.target.value})}
                    className={errors.expiry ? 'error' : ''}
                  >
                    <option value="">YYYY</option>
                    {[...Array(10)].map((_, i) => {
                      const year = new Date().getFullYear() + i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,4}$/.test(value)) {
                        setCardDetails({...cardDetails, cvv: value});
                      }
                    }}
                    maxLength="4"
                    className={errors.cvv ? 'error' : ''}
                  />
                  {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                </div>
              </div>
              {errors.expiry && <span className="error-message">{errors.expiry}</span>}
            </div>
          )}

          {/* Cash on Delivery Info */}
          {paymentMethod === 'CASH' && (
            <div className="cash-payment-info">
              <p>You will pay cash when the order is delivered to your address.</p>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
