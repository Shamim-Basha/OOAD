# Quick Reference: Cart, Checkout & Payment System

## For Developers

### Backend API Endpoints

#### Cart Operations
```
GET    /api/cart/{userId}                      - Get user's cart
POST   /api/cart/product                       - Add product to cart
POST   /api/cart/rental                        - Add rental to cart
PUT    /api/cart/product/{userId}/{productId}  - Update product quantity
PUT    /api/cart/rental/{userId}/{toolId}      - Update rental details
DELETE /api/cart/product/{userId}/{productId}  - Remove product from cart
DELETE /api/cart/rental/{userId}/{toolId}      - Remove rental from cart
POST   /api/cart/{userId}/checkout             - Checkout and process payment
```

#### Payment Flow
```javascript
// Checkout Request Structure
{
  "userId": 1,
  "selectedProducts": [
    { "userId": 1, "productId": 5, "rentalId": null }
  ],
  "selectedRentals": [
    { "userId": 1, "productId": null, "rentalId": 3 }
  ],
  "paymentMethod": "CARD",           // CARD, UPI, or CASH
  "cardNumber": "1234567890123456",
  "cardHolderName": "JOHN DOE",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvv": "123"
}
```

```javascript
// Order Response Structure
{
  "orderId": 123,
  "total": 5000.00,
  "items": [...],
  "paymentStatus": "SUCCESS",
  "transactionId": "TXN-ABC12345",
  "paymentMethod": "CARD",
  "orderDate": "2025-10-19T10:30:00"
}
```

### Frontend Components

#### Using the PaymentForm Component
```javascript
import PaymentForm from '../components/PaymentForm';

const [showPaymentForm, setShowPaymentForm] = useState(false);

// Show payment form
<PaymentForm
  totalAmount={calculateTotal()}
  onPaymentSubmit={handlePaymentSubmit}
  onCancel={() => setShowPaymentForm(false)}
/>

// Handle payment submission
const handlePaymentSubmit = async (paymentData) => {
  // paymentData contains:
  // - paymentMethod
  // - cardNumber, cardHolderName, expiryMonth, expiryYear, cvv (for CARD)
  // - upiId (for UPI)
};
```

### Payment Methods

#### 1. Card Payment
- Requires: 16-digit card number, holder name, expiry (MM/YYYY), CVV (3-4 digits)
- Validation: Luhn algorithm for card number, expiry date check
- Success Rate: 95% (mock simulation)

#### 2. UPI Payment
- Requires: UPI ID (format: username@upi)
- Validation: Format check for @ symbol
- Success Rate: 100% (mock simulation)

#### 3. Cash on Delivery
- No additional details required
- Payment collected on delivery
- Success Rate: 100% (always approved)

### Styling Rental Items

The rental cart items are automatically styled with:
- Golden border and gradient background
- "RENTAL" badge in top-right corner
- Blue-tinted date picker section
- Enhanced hover effects

To apply custom styling:
```css
/* Rental items have the .rental-dates class */
.cart-item:has(.rental-dates) {
  /* Your custom styles */
}
```

### DTO Usage Guide

#### Adding Product to Cart
```java
AddProductCartRequest request = new AddProductCartRequest();
request.setUserId(1L);
request.setProductId(5L);
request.setQuantity(2);
```

#### Adding Rental to Cart
```java
AddRentalCartRequest request = new AddRentalCartRequest();
request.setUserId(1L);
request.setRentalId(3L);  // This is the toolId
request.setQuantity(1);
request.setRentalStart(LocalDate.of(2025, 10, 20));
request.setRentalEnd(LocalDate.of(2025, 10, 25));
```

#### Processing Payment
```java
PaymentRequestDTO request = PaymentRequestDTO.builder()
    .amount(new BigDecimal("5000.00"))
    .paymentMethod("CARD")
    .cardNumber("1234567890123456")
    .cardHolderName("JOHN DOE")
    .expiryMonth("12")
    .expiryYear("2025")
    .cvv("123")
    .build();

PaymentResponseDTO response = mockPaymentService.processPayment(request);
```

## For Users

### How to Checkout

1. **View Your Cart**
   - Click on the cart icon in the navigation bar
   - Review your products and rentals

2. **Select Items**
   - Check the boxes next to items you want to purchase
   - Use "Select All" to select all items at once

3. **Update Quantities**
   - Use +/- buttons to adjust quantities
   - For rentals, update the start and end dates

4. **Review Total**
   - Check the subtotal, tax (15%), and total amount
   - Verify delivery information

5. **Proceed to Checkout**
   - Click "Proceed to Checkout" button
   - The payment form will appear

6. **Select Payment Method**
   - Choose between Card, UPI, or Cash on Delivery

7. **Enter Payment Details**
   - **For Card**: Enter card number, holder name, expiry date, and CVV
   - **For UPI**: Enter your UPI ID
   - **For Cash**: No additional details needed

8. **Confirm Payment**
   - Click "Confirm Payment"
   - Wait for payment processing

9. **Order Confirmation**
   - You'll be redirected to your profile page
   - Your order details will be displayed
   - Check your email for order confirmation

### Rental Cart Features

Rental items have special features:
- **Date Selection**: Choose rental start and end dates
- **Duration Calculation**: Price is calculated based on number of days
- **Availability Check**: System ensures tool is available for selected dates
- **Visual Distinction**: Rental items have a golden border and "RENTAL" badge

### Payment Security

- Card details are validated before processing
- Secure mock payment gateway
- Transaction IDs generated for tracking
- Payment status clearly displayed

## Troubleshooting

### Common Issues

**Issue**: "Please select at least one item to checkout"
- **Solution**: Check at least one product or rental item checkbox

**Issue**: "Invalid card number"
- **Solution**: Ensure card number is exactly 16 digits

**Issue**: "Invalid or expired card"
- **Solution**: Check expiry month (1-12) and year (current or future)

**Issue**: "Invalid CVV"
- **Solution**: CVV must be 3 or 4 digits

**Issue**: "Checkout failed"
- **Solution**: Check your internet connection and try again

### Testing the System

Use these test card numbers (mock system):
- `4111111111111111` - Always succeeds (95% probability)
- `4242424242424242` - Visa test card
- `5555555555554444` - Mastercard test card

Test UPI IDs:
- `test@upi`
- `user@okaxis`
- `customer@paytm`

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all required fields are filled
3. Ensure selected dates are valid (start before end)
4. Contact system administrator if problems persist
