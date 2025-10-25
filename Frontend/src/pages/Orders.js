import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchOrders(parsedUser.id);
    } else {
      toast.error('Please log in to view your orders');
      setLoading(false);
    }
  }, []);

  const fetchOrders = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        const sortedOrders = data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setOrders(sortedOrders);
      } else {
        const errorText = await response.text();
        toast.error(`Failed to fetch orders: ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(price).replace('LKR', 'Rs. ');
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'status-paid';
      case 'PENDING':
        return 'status-pending';
      case 'COD':
        return 'status-cod';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'DELIVERED':
        return 'status-delivered';
      case 'PROCESSING':
        return 'status-processing';
      default:
        return 'status-default';
    }
  };

  const getDeliveryStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'delivery-delivered';
      case 'SHIPPED':
        return 'delivery-shipped';
      case 'PROCESSING':
        return 'delivery-processing';
      case 'PENDING':
        return 'delivery-pending';
      default:
        return 'delivery-default';
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="orders-container">
        <div className="no-user">
          <h2>Please log in to view your orders</h2>
          <p>You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
          <a href="/products" className="btn btn-primary">Start Shopping</a>
        </div>
      ) : (
        <div className="orders-table-container">
        <table className="orders-table">
        <thead>
            <tr>
            <th>Order ID</th>
            <th>No of Items</th>
            <th>Date</th>
            <th>Payment Status</th>
            <th>Delivery Status</th>
            <th>Payment Method</th>
            <th>Total</th>
            <th>Action</th>
            </tr>
        </thead>
        <tbody>
          {orders.map((order)=>(
            <>
            <tr key={order.orderId}
                className={`${expandedOrder === order.orderId ? 'expanded' : ''}`}
                onClick={() => toggleOrderExpansion(order.orderId)}>
              <td className="order-id">#{order.orderId}</td>
              <td className="items-count">{order.items.length}</td>
              <td className="order-date">{formatDate(order.orderDate)}</td>
              <td className="payment-status">
                      <span className={`status-badge ${getStatusBadgeClass(order.paymentStatus)}`}>
                      {order.paymentStatus}
                      </span>
              </td>
              <td className="delivery-status">
                      {order.deliveryStatus && (
                      <span className={`delivery-badge ${getDeliveryStatusBadgeClass(order.deliveryStatus)}`}>
                          {order.deliveryStatus}
                      </span>
                      )}
              </td>
              <td className="payment-method">
                    {order.paymentMethod || 'Not specified'}
              </td>
              <td className="order-total">{formatPrice(order.total)}</td>
              <td className="expand-action">
                      <span className="expand-icon">
                      {expandedOrder === order.orderId ? '▲' : '▼'}
                      </span>
              </td>
            </tr>
            {expandedOrder === order.orderId && (
                <tr className="order-details-row">
                    <td colSpan="8" className="order-details-cell">
                    <div className="order-products-section">
                        <h3>Products Purchased</h3>
                        <table className="products-table">
                          <thead>
                              <tr>
                              <th>Product Type</th>
                              <th>Product Name</th>
                              <th>Quantity</th>
                              <th>Unit Price</th>
                              <th>Subtotal</th>
                              <th>Rental Period</th>
                              </tr>
                          </thead>
                          <tbody>
                              {order.items.map((item, index) => (
                              <tr key={index} className="product-row">
                                  <td>
                                  <span className="item-type-badge">{item.type}</span>
                                  </td>
                                  <td className="product-name">{item.name}</td>
                                  <td className="product-quantity">{item.quantity}</td>
                                  <td className="product-unit-price">{formatPrice(item.unitPrice)}</td>
                                  <td className="product-subtotal">{formatPrice(item.subtotal)}</td>
                                  <td className="rental-period">
                                  {item.type === 'RENTAL' && item.rentalStart && item.rentalEnd ? (
                                      <span>{formatDate(item.rentalStart)} - {formatDate(item.rentalEnd)}</span>
                                  ) : (
                                      <span className="not-applicable">N/A</span>
                                  )}
                                  </td>
                              </tr>
                              ))}
                          </tbody>
                        </table>
                        
                        {order.deliveryAddress && (
                        <div className="delivery-address-section">
                            <h4>Delivery Address</h4>
                            <p>{order.deliveryAddress}</p>
                        </div>
                        )}
                        
                        {order.transactionId && (
                        <div className="transaction-section">
                            <p><strong>Transaction ID:</strong> {order.transactionId}</p>
                        </div>
                        )} 
                    </div>
                    </td>
                </tr>
                )}
            </>
          ))}
        </tbody>
        </table>
        </div>
      )}
    </div>
  );
};

export default Orders;