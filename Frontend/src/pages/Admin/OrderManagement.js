import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import { FaTimes, FaCheck } from 'react-icons/fa';
import './OrderManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    userName: '',
    orderType: '' // PRODUCT, RENTAL, MIXED
  });
  
  // Sorting state
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/orders/admin/all`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/admin/${orderId}`);
      setSelectedOrder(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setDeliveryStatus(order.deliveryStatus || 'PENDING');
    setDeliveryAddress(order.deliveryAddress || '');
    setShowStatusModal(true);
  };

  const handleSaveStatus = async () => {
    try {
      await axios.put(`${API_URL}/api/orders/admin/${selectedOrder.orderId}/delivery-status`, {
        deliveryStatus: deliveryStatus,
        deliveryAddress: deliveryAddress
      });
      setShowStatusModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/orders/admin/${orderId}`);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'PENDING': 'status-badge status-pending',
      'PROCESSING': 'status-badge status-processing',
      'SHIPPED': 'status-badge status-shipped',
      'DELIVERED': 'status-badge status-delivered',
      'CANCELLED': 'status-badge status-cancelled'
    };
    const displayStatus = status || 'PENDING';
    return <span className={statusClasses[displayStatus] || 'status-badge'}>{displayStatus}</span>;
  };

  const getPaymentStatusBadge = (status) => {
    if (status === 'COD') {
      return <span className="status-badge status-cod">COD</span>;
    }
    return status === 'PAID' || status === 'SUCCESS'
      ? <span className="status-badge status-paid">PAID</span>
      : <span className="status-badge status-failed">FAILED</span>;
  };
  
  const handleMarkAsPaid = async (orderId) => {
    if (!window.confirm('Mark this COD order as PAID?')) {
      return;
    }

    try {
      await axios.put(`${API_URL}/api/orders/admin/${orderId}/payment-status`);
      fetchOrders();
      if (showDetailsModal && selectedOrder?.orderId === orderId) {
        handleViewDetails(orderId); // Refresh modal
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const formatPrice = (price) => {
    return `Rs. ${Number(price).toFixed(2)}`;
  };
  
  const handleClearFilters = () => {
    setFilters({ status: '', userName: '', orderType: '' });
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };
  
  const filteredOrders = orders.filter(order => {
    const matchesStatus = !filters.status || order.deliveryStatus === filters.status;
    const matchesUser = !filters.userName || 
      order.userName?.toLowerCase().includes(filters.userName.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(filters.userName.toLowerCase());
    
    // Filter by order type based on items
    let orderType = 'PRODUCT'; // default
    if (order.items && order.items.length > 0) {
      const hasProducts = order.items.some(item => item.type === 'PRODUCT');
      const hasRentals = order.items.some(item => item.type === 'RENTAL');
      if (hasProducts && hasRentals) {
        orderType = 'MIXED';
      } else if (hasRentals) {
        orderType = 'RENTAL';
      }
    }
    const matchesOrderType = !filters.orderType || orderType === filters.orderType;
    
    return matchesStatus && matchesUser && matchesOrderType;
  }).sort((a, b) => {
    // Sort by order date
    const dateA = new Date(a.orderDate);
    const dateB = new Date(b.orderDate);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="order-mgmt-page">
      <AdminSidebar active="orders" />
      <div className="admin-content">
        <div className="order-header">
          <h1>Order & Delivery Management</h1>
        </div>

        {/* Filter Bar */}
        <div className="order-filters">
          <div className="filter-group">
            <label>Filter by Customer</label>
            <input
              type="text"
              placeholder="Search by name or email"
              value={filters.userName}
              onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>Filter by Status</label>
            <select 
              value={filters.status} 
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Filter by Order Type</label>
            <select 
              value={filters.orderType} 
              onChange={(e) => setFilters({ ...filters, orderType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="PRODUCT">Product Only</option>
              <option value="RENTAL">Rental Only</option>
              <option value="MIXED">Mixed (Product + Rental)</option>
            </select>
          </div>
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>
          <button className="sort-btn" onClick={toggleSortOrder}>
            Sort by Date {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>

        {loading ? (
          <div className="loading-container">Loading orders...</div>
        ) : (
          <div className="table-wrapper">
            <table className="order-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Order Type</th>
                  <th>Items</th>
                  <th>Total Cost</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    // Determine order type
                    let orderType = 'Product';
                    if (order.items && order.items.length > 0) {
                      const hasProducts = order.items.some(item => item.type === 'PRODUCT');
                      const hasRentals = order.items.some(item => item.type === 'RENTAL');
                      if (hasProducts && hasRentals) {
                        orderType = 'Mixed';
                      } else if (hasRentals) {
                        orderType = 'Rental';
                      }
                    }
                    
                    return (
                      <tr key={order.orderId}>
                        <td>{order.orderId}</td>
                        <td>{order.userName}</td>
                        <td>
                          <span className={`order-type-badge order-type-${orderType.toLowerCase()}`}>
                            {orderType}
                          </span>
                        </td>
                        <td>{order.items ? order.items.length : 0}</td>
                        <td>{formatPrice(order.total)}</td>
                        <td>{getPaymentStatusBadge(order.paymentStatus)}</td>
                        <td>{getStatusBadge(order.deliveryStatus || 'PENDING')}</td>
                        <td>{formatDate(order.orderDate)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-view"
                              onClick={() => handleViewDetails(order.orderId)}
                            >
                              View
                            </button>
                            <button
                              className="btn-edit"
                              onClick={() => handleUpdateStatus(order)}
                            >
                              Edit
                            </button>
                            {order.paymentStatus === 'COD' && (
                              <button
                                className="btn-pay"
                                onClick={() => handleMarkAsPaid(order.orderId)}
                                title="Mark as Paid"
                              >
                                Pay
                              </button>
                            )}
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteOrder(order.orderId)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Order Details - #{selectedOrder.orderId}</h2>
                <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="order-details-grid">
                  <div className="detail-section">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> {selectedOrder.userName}</p>
                    <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
                    <p><strong>User ID:</strong> {selectedOrder.userId}</p>
                  </div>
                  
                  <div className="detail-section">
                    <h3>Order Information</h3>
                    <p><strong>Order Date:</strong> {formatDate(selectedOrder.orderDate)}</p>
                    <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                    <p><strong>Payment Status:</strong> {getPaymentStatusBadge(selectedOrder.paymentStatus)}</p>
                    <p><strong>Transaction ID:</strong> {selectedOrder.transactionId}</p>
                  </div>
                  
                  <div className="detail-section">
                    <h3>Delivery Information</h3>
                    <p><strong>Status:</strong> {getStatusBadge(selectedOrder.deliveryStatus || 'PENDING')}</p>
                    <p><strong>Address:</strong> {selectedOrder.deliveryAddress || 'Not provided'}</p>
                    {selectedOrder.deliveredAt && (
                      <p><strong>Delivered At:</strong> {formatDate(selectedOrder.deliveredAt)}</p>
                    )}
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Order Items</h3>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items && selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            {item.name}
                            {item.type === 'RENTAL' && item.rentalStart && item.rentalEnd && (
                              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                {formatDate(item.rentalStart)} - {formatDate(item.rentalEnd)}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`order-type-badge order-type-${item.type === 'PRODUCT' ? 'product' : 'rental'}`}>
                              {item.type}
                            </span>
                          </td>
                          <td>{item.quantity}</td>
                          <td>{formatPrice(item.unitPrice)}</td>
                          <td>{formatPrice(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'right' }}><strong>Total:</strong></td>
                        <td><strong>{formatPrice(selectedOrder.total)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {showStatusModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
            <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Delivery Status</h2>
                <button className="close-btn" onClick={() => setShowStatusModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Delivery Status</label>
                  <select 
                    value={deliveryStatus} 
                    onChange={(e) => setDeliveryStatus(e.target.value)}
                    className="form-control"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Delivery Address</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="form-control"
                    rows="3"
                    placeholder="Enter delivery address"
                  />
                </div>
                
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveStatus}>
                    <FaCheck /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
