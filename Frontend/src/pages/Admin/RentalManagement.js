import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RentalManagement.css';

const RentalManagement = () => {
  const [rentals, setRentals] = useState([]);
  const [users, setUsers] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // create, edit, view
  const [selectedRental, setSelectedRental] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    userId: '',
    toolId: '',
    startDate: '',
    endDate: '',
    quantity: 1,
    status: 'ACTIVE'
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    userId: '',
    toolId: '',
    status: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rentalsRes, usersRes, toolsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/rentals'),
        axios.get('http://localhost:8080/api/users'),
        axios.get('http://localhost:8080/api/tools')
      ]);
      
      setRentals(rentalsRes.data);
      setUsers(usersRes.data);
      setTools(toolsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getRentalStatus = (rental) => {
    // Use the actual status from the database if available
    if (rental.status) {
      return rental.status.toLowerCase();
    }
    
    // Fallback to date-based calculation if status is not set
    const today = new Date();
    const startDate = new Date(rental.startDate);
    const endDate = new Date(rental.endDate);
    
    if (today < startDate) return 'upcoming';
    if (today >= startDate && today <= endDate) return 'active';
    return 'completed';
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'status-badge status-active',
      completed: 'status-badge status-completed',
      returned: 'status-badge status-completed',
      upcoming: 'status-badge status-upcoming'
    };
    return <span className={statusClasses[status]}>{status.toUpperCase()}</span>;
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : `User ${userId}`;
  };

  const getToolName = (toolId) => {
    const tool = tools.find(t => t.id === toolId);
    return tool ? tool.name : `Tool ${toolId}`;
  };

  const handleCreateRental = async (e) => {
    e.preventDefault();
    try {
      const rentalData = {
        userId: parseInt(formData.userId),
        toolId: parseInt(formData.toolId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        quantity: parseInt(formData.quantity)
      };
      
      await axios.post('http://localhost:8080/api/rentals', rentalData);
      setSuccess('Rental created successfully!');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating rental:', error);
      setError(error.response?.data?.message || 'Failed to create rental');
    }
  };

  const handleUpdateRental = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status
      };
      
      console.log('Updating rental with data:', updateData);
      console.log('Rental ID:', selectedRental.id);
      
      const response = await axios.put(`http://localhost:8080/api/rentals/${selectedRental.id}`, updateData);
      console.log('Update response:', response.data);
      
      setSuccess('Rental updated successfully!');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error updating rental:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || error.response?.data || 'Failed to update rental');
    }
  };

  const handleDeleteRental = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rental?')) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/rentals/${id}`);
      setSuccess('Rental deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting rental:', error);
      setError('Failed to delete rental');
    }
  };

  const openModal = (type, rental = null) => {
    setModalType(type);
    setSelectedRental(rental);
    setShowModal(true);
    setError('');
    setSuccess('');
    
    if (type === 'edit' && rental) {
      setFormData({
        userId: rental.userId.toString(),
        toolId: rental.toolId.toString(),
        startDate: rental.startDate,
        endDate: rental.endDate,
        quantity: rental.quantity,
        status: rental.status || 'ACTIVE'
      });
    } else if (type === 'create') {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      toolId: '',
      startDate: '',
      endDate: '',
      quantity: 1,
      status: 'ACTIVE'
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRental(null);
    setError('');
    setSuccess('');
  };

  const filteredRentals = rentals.filter(rental => {
    if (filters.userId && rental.userId !== parseInt(filters.userId)) return false;
    if (filters.toolId && rental.toolId !== parseInt(filters.toolId)) return false;
    if (filters.status) {
      const status = getRentalStatus(rental);
      if (status !== filters.status) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilters({ userId: '', toolId: '', status: '' });
  };

  if (loading) {
    return <div className="loading">Loading rental data...</div>;
  }

  return (
    <div className="rental-management">
      <div className="rental-header">
        <h1>Rental Management</h1>
        <button 
          className="add-rental-btn"
          onClick={() => openModal('create')}
        >
          + Add New Rental
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="rental-filters">
        <div className="filter-group">
          <label>Filter by User</label>
          <select 
            value={filters.userId} 
            onChange={(e) => setFilters({...filters, userId: e.target.value})}
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Filter by Tool</label>
          <select 
            value={filters.toolId} 
            onChange={(e) => setFilters({...filters, toolId: e.target.value})}
          >
            <option value="">All Tools</option>
            {tools.map(tool => (
              <option key={tool.id} value={tool.id}>
                {tool.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Filter by Status</label>
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="returned">Returned</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>&nbsp;</label>
          <button 
            onClick={clearFilters}
            style={{ 
              padding: '8px 16px', 
              background: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {filteredRentals.length === 0 ? (
        <div className="no-data">No rentals found matching the current filters.</div>
      ) : (
        <table className="rental-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Tool</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Quantity</th>
              <th>Total Cost</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRentals.map(rental => (
              <tr key={rental.id}>
                <td>{rental.id}</td>
                <td>{getUserName(rental.userId)}</td>
                <td>{getToolName(rental.toolId)}</td>
                <td>{new Date(rental.startDate).toLocaleDateString()}</td>
                <td>{new Date(rental.endDate).toLocaleDateString()}</td>
                <td>{rental.quantity}</td>
                <td>Rs. {rental.totalCost}</td>
                <td>{getStatusBadge(getRentalStatus(rental))}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-view"
                      onClick={() => openModal('view', rental)}
                    >
                      View
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => openModal('edit', rental)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteRental(rental.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {modalType === 'create' && 'Create New Rental'}
                {modalType === 'edit' && 'Edit Rental'}
                {modalType === 'view' && 'Rental Details'}
              </h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            {modalType === 'view' ? (
              <div className="rental-details">
                <h4>Rental Information</h4>
                <p><strong>ID:</strong> {selectedRental.id}</p>
                <p><strong>User:</strong> {getUserName(selectedRental.userId)}</p>
                <p><strong>Tool:</strong> {getToolName(selectedRental.toolId)}</p>
                <p><strong>Start Date:</strong> {new Date(selectedRental.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(selectedRental.endDate).toLocaleDateString()}</p>
                <p><strong>Quantity:</strong> {selectedRental.quantity}</p>
                <p><strong>Total Cost:</strong> Rs. {selectedRental.totalCost}</p>
                <p><strong>Status:</strong> {getStatusBadge(getRentalStatus(selectedRental))}</p>
              </div>
            ) : (
              <form onSubmit={modalType === 'create' ? handleCreateRental : handleUpdateRental}>
                <div className="form-group">
                  <label>User</label>
                  <select 
                    value={formData.userId} 
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    required
                    disabled={modalType === 'edit'}
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tool</label>
                  <select 
                    value={formData.toolId} 
                    onChange={(e) => setFormData({...formData, toolId: e.target.value})}
                    required
                    disabled={modalType === 'edit'}
                  >
                    <option value="">Select Tool</option>
                    {tools.map(tool => (
                      <option key={tool.id} value={tool.id}>
                        {tool.name} - Rs. {tool.dailyRate}/day (Stock: {tool.stockQuantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="100"
                    value={formData.quantity} 
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                    disabled={modalType === 'edit'}
                  />
                </div>

                <div className="form-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={formData.startDate} 
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={formData.endDate} 
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>

                {modalType === 'edit' && (
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      required
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="RETURNED">Returned</option>
                    </select>
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    {modalType === 'create' ? 'Create Rental' : 'Update Rental'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalManagement;
