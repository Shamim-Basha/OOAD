import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit, FaEye, FaEyeSlash, FaSave, FaTimes } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', postalCode: '', role: 'CUSTOMER', username: '', password: ''
  });
  const [message, setMessage] = useState('');
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [editingUsers, setEditingUsers] = useState(new Set());
  const [editingForms, setEditingForms] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/users`);
      const data = res.data;
      setUsers(Array.isArray(data) ? data : (data.data || []));
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  const handleSearch = e => setSearch(e.target.value);

  const openForm = (user = null) => {
    setEditUser(user);
    setForm(user ? { ...user, password: '' } : { 
      firstName: '', lastName: '', email: '', phone: '', address: '', 
      city: '', postalCode: '', role: 'CUSTOMER', username: '', password: '' 
    });
    setShowForm(true);
    setMessage('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditUser(null);
    setMessage('');
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const method = editUser ? 'put' : 'post';
      const url = editUser ? `${API_URL}/api/users/${editUser.id}` : `${API_URL}/api/users/register`;
      const body = { ...form };
      if (!body.password) delete body.password;
      const res = await axios({
        method,
        url,
        data: body,
        headers: { 'Content-Type': 'application/json' },
      });
      const successMsg = res?.data?.message || (editUser ? 'User updated.' : 'User added.');
      setMessage(successMsg);
      toast.success(successMsg);
      await fetchUsers();
      closeForm();
    } catch (err) {
      let errMsg = 'Error saving user';
      if (err && err.response && err.response.data) {
        errMsg = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data) || errMsg;
      } else if (err && err.message) {
        errMsg = err.message;
      }
      setMessage(errMsg);
      toast.error(errMsg);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const res = await axios.delete(`${API_URL}/api/users/${id}`);
      const msg = res?.data?.message || 'User deleted';
      await fetchUsers();
      toast.success(msg);
    } catch (err) {
      console.error('Delete failed', err);
      let errMsg = 'Failed to delete user';
      if (err && err.response && err.response.data) {
        errMsg = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data) || errMsg;
      } else if (err && err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
    }
  };

  const toggleUserDetails = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
      // Also exit edit mode when closing details
      const newEditing = new Set(editingUsers);
      newEditing.delete(userId);
      setEditingUsers(newEditing);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const startEdit = (user) => {
    const newEditing = new Set(editingUsers);
    newEditing.add(user.id);
    setEditingUsers(newEditing);
    
    setEditingForms({
      ...editingForms,
      [user.id]: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        role: user.role || 'CUSTOMER',
        password: '' // For password change
      }
    });
  };

  const cancelEdit = (userId) => {
    const newEditing = new Set(editingUsers);
    newEditing.delete(userId);
    setEditingUsers(newEditing);
    
    const newEditingForms = { ...editingForms };
    delete newEditingForms[userId];
    setEditingForms(newEditingForms);
  };

  const handleEditFormChange = (userId, field, value) => {
    setEditingForms({
      ...editingForms,
      [userId]: {
        ...editingForms[userId],
        [field]: value
      }
    });
  };

  const saveEdit = async (userId) => {
    try {
      const editForm = editingForms[userId];
      const body = { ...editForm };
      
      // Don't send password if it's empty
      if (!body.password) {
        delete body.password;
      }
      
      const res = await axios.put(`${API_URL}/api/users/${userId}`, body);
      const msg = res?.data?.message || 'User updated';
      
      // Exit edit mode and refresh
      cancelEdit(userId);
      await fetchUsers();
      toast.success(msg);
    } catch (err) {
      console.error('Failed to save edit', err);
      let errMsg = 'Failed to update user';
      if (err && err.response && err.response.data) {
        errMsg = err.response.data.message || err.response.data.error || JSON.stringify(err.response.data) || errMsg;
      } else if (err && err.message) {
        errMsg = err.message;
      }
      toast.error(errMsg);
    }
  };

  const filtered = users.filter(u =>
    (u.firstName + ' ' + u.lastName + ' ' + u.email + ' ' + u.username + ' ' + u.phone + ' ' + u.city).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-mgmt-page">
      <ToastContainer position="top-right" />
      <div className="user-mgmt-header">
        <h2>User Management</h2>
        <button className="add-btn" onClick={() => openForm()}>+ Add User</button>
      </div>
      <input className="search-input" placeholder="Search users..." value={search} onChange={handleSearch} />
      {loading ? <div>Loading...</div> : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <React.Fragment key={u.id}>
                <tr>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button 
                        className="details-btn" 
                        onClick={() => toggleUserDetails(u.id)} 
                        title={expandedUsers.has(u.id) ? "Hide Details" : "Show Details"}
                      >
                        {expandedUsers.has(u.id) ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(u.id)} title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
                
                {/* Expanded details row */}
                {expandedUsers.has(u.id) && (
                  <tr className="details-row">
                    <td colSpan="6">
                      <div className="user-details">
                        <div className="details-header">
                          <h4>User Details</h4>
                          {editingUsers.has(u.id) ? (
                            <div className="edit-actions">
                              <button className="save-btn" onClick={() => saveEdit(u.id)} title="Save">
                                <FaSave /> Save
                              </button>
                              <button className="cancel-btn" onClick={() => cancelEdit(u.id)} title="Cancel">
                                <FaTimes /> Cancel
                              </button>
                            </div>
                          ) : (
                            <button className="edit-btn" onClick={() => startEdit(u)} title="Edit">
                              <FaEdit /> Edit
                            </button>
                          )}
                        </div>
                        
                        <div className="details-grid">
                          <div className="detail-item">
                            <label>First Name:</label>
                            {editingUsers.has(u.id) ? (
                              <input 
                                value={editingForms[u.id]?.firstName || ''} 
                                onChange={(e) => handleEditFormChange(u.id, 'firstName', e.target.value)}
                                className="detail-input"
                              />
                            ) : (
                              <span>{u.firstName || 'N/A'}</span>
                            )}
                          </div>
                          
                          <div className="detail-item">
                            <label>Last Name:</label>
                            {editingUsers.has(u.id) ? (
                              <input 
                                value={editingForms[u.id]?.lastName || ''} 
                                onChange={(e) => handleEditFormChange(u.id, 'lastName', e.target.value)}
                                className="detail-input"
                              />
                            ) : (
                              <span>{u.lastName || 'N/A'}</span>
                            )}
                          </div>
                          
                          <div className="detail-item">
                            <label>Email:</label>
                            {editingUsers.has(u.id) ? (
                              <input 
                                value={editingForms[u.id]?.email || ''} 
                                onChange={(e) => handleEditFormChange(u.id, 'email', e.target.value)}
                                className="detail-input"
                                type="email"
                              />
                            ) : (
                              <span>{u.email || 'N/A'}</span>
                            )}
                          </div>
                          
                          <div className="detail-item">
                            <label>Username:</label>
                            {editingUsers.has(u.id) ? (
                              <input 
                                value={editingForms[u.id]?.username || ''} 
                                onChange={(e) => handleEditFormChange(u.id, 'username', e.target.value)}
                                className="detail-input"
                              />
                            ) : (
                              <span>{u.username || 'N/A'}</span>
                            )}
                          </div>
                          
                          <div className="detail-item">
                            <label>Phone:</label>
                            {editingUsers.has(u.id) ? (
                              <input 
                                value={editingForms[u.id]?.phone || ''} 
                                onChange={(e) => handleEditFormChange(u.id, 'phone', e.target.value)}
                                className="detail-input"
                              />
                            ) : (
                              <span>{u.phone || 'N/A'}</span>
                            )}
                          </div>
                          
                          <div className="detail-item">
                            <label>Address:</label>
                            {editingUsers.has(u.id) ? (
                              <input 
                                value={editingForms[u.id]?.address || ''} 
                                onChange={(e) => handleEditFormChange(u.id, 'address', e.target.value)}
                                className="detail-input"
                              />
                            ) : (
                              <span>{u.address || 'N/A'}</span>
                            )}
                          </div>
                          
                          <div className="detail-item">
                            <label>City:</label>
                            {editingUsers.has(u.id) ? (
                              <input 
                                value={editingForms[u.id]?.city || ''} 
                                onChange={(e) => handleEditFormChange(u.id, 'city', e.target.value)}
                                className="detail-input"
                              />
                            ) : (
                              <span>{u.city || 'N/A'}</span>
                            )}
                          </div>
                          
                          <div className="detail-item">
                            <label>Postal Code:</label>
                            {editingUsers.has(u.id) ? (
                              <input 
                                value={editingForms[u.id]?.postalCode || ''} 
                                onChange={(e) => handleEditFormChange(u.id, 'postalCode', e.target.value)}
                                className="detail-input"
                              />
                            ) : (
                              <span>{u.postalCode || 'N/A'}</span>
                            )}
                          </div>
                          
                          <div className="detail-item">
                            <label>Role:</label>
                            {editingUsers.has(u.id) ? (
                              <select 
                                value={editingForms[u.id]?.role || 'CUSTOMER'} 
                                onChange={(e) => handleEditFormChange(u.id, 'role', e.target.value)}
                                className="detail-input"
                              >
                                <option value="CUSTOMER">Customer</option>
                                <option value="ADMIN">Admin</option>
                                <option value="MANAGER">Manager</option>
                              </select>
                            ) : (
                              <span>{u.role || 'N/A'}</span>
                            )}
                          </div>
                          
                          {editingUsers.has(u.id) && (
                            <div className="detail-item full-width">
                              <label>New Password (leave blank to keep current):</label>
                              <input 
                                value={editingForms[u.id]?.password || ''} 
                                onChange={(e) => handleEditFormChange(u.id, 'password', e.target.value)}
                                className="detail-input"
                                type="password"
                                placeholder="Enter new password"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="modal-bg">
          <div className="modal">
            <h3>{editUser ? 'Edit User' : 'Add User'}</h3>
            <form onSubmit={handleSubmit} className="user-form">
              <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleFormChange} required />
              <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleFormChange} required />
              <input name="email" placeholder="Email" value={form.email} onChange={handleFormChange} required />
              <input name="username" placeholder="Username" value={form.username} onChange={handleFormChange} required />
              <input name="phone" placeholder="Phone" value={form.phone} onChange={handleFormChange} />
              <input name="address" placeholder="Address" value={form.address} onChange={handleFormChange} />
              <input name="city" placeholder="City" value={form.city} onChange={handleFormChange} />
              <input name="postalCode" placeholder="Postal Code" value={form.postalCode} onChange={handleFormChange} />
              <select name="role" value={form.role} onChange={handleFormChange}>
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
              </select>
              <input name="password" placeholder="Password" value={form.password} onChange={handleFormChange} type="password" autoComplete="new-password" required={!editUser} />
              <div className="form-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={closeForm}>Cancel</button>
              </div>
              {message && <div className="form-message">{message}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
