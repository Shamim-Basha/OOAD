import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserManagement.css';
import mockActivityForUser from './mockUserActivity';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/users');
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
  setForm(user ? { ...user, password: '' } : { firstName: '', lastName: '', email: '', phone: '', address: '', city: '', postalCode: '', role: 'CUSTOMER', username: '', password: '' });
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
      const url = editUser ? `http://localhost:8080/api/users/${editUser.id}` : 'http://localhost:8080/api/users/register';
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
      // Extract meaningful message from axios error when available
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
      const res = await axios.delete(`http://localhost:8080/api/users/${id}`);
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

  // Fetch and show user details (orders, purchases, activity)
  const [detailsUser, setDetailsUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingForm, setEditingForm] = useState({});

  const openDetails = async (user) => {
    // toggle
    if (expandedUserId === user.id) {
      setExpandedUserId(null);
      setDetailsData(null);
      return;
    }
    setExpandedUserId(user.id);
    setDetailsLoading(true);
    setDetailsData(null);
    try {
      const res = await axios.get(`http://localhost:8080/api/users/${user.id}/activity`);
      setDetailsData(res.data);
    } catch (err) {
      try {
        const orders = await axios.get(`http://localhost:8080/api/orders?userId=${user.id}`);
        setDetailsData({ orders: orders.data });
      } catch (e) {
        try {
          const mock = mockActivityForUser(user.id);
          setDetailsData(mock);
        } catch (mErr) {
          setDetailsData({ orders: [] });
        }
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setExpandedUserId(null);
    setDetailsData(null);
    setDetailsLoading(false);
  };

  // Inline edit support
  const startInlineEdit = (user) => {
    setEditingUserId(user.id);
    setEditingForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      postalCode: user.postalCode || '',
      role: user.role || 'CUSTOMER'
    });
  };

  const cancelInlineEdit = () => {
    setEditingUserId(null);
    setEditingForm({});
  };

  const saveInlineEdit = async (userId) => {
    try {
      const res = await axios.put(`http://localhost:8080/api/users/${userId}`, editingForm);
      const msg = res?.data?.message || 'User updated';
      // refresh list
      await fetchUsers();
      setEditingUserId(null);
      setEditingForm({});
      toast.success(msg);
    } catch (err) {
      console.error('Failed inline save', err);
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
    (u.firstName + ' ' + u.lastName + ' ' + u.email + ' ' + u.username).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-mgmt-page">
      <ToastContainer position="top-right" />
      <div className="user-mgmt-header">
        <h2>User Management</h2>
      {detailsUser && (
        <div className="modal-bg" onClick={closeDetails}>
          <div className="modal details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="details-header">
              <h3>{detailsUser.firstName} {detailsUser.lastName} — Activity</h3>
              <button className="close-btn" onClick={closeDetails}>Close</button>
            </div>
            {detailsLoading ? <div>Loading details...</div> : (
              <div className="details-body">
                <div className="metrics-row">
                  <div className="metric">
                    <div className="metric-label">Products Purchased</div>
                    <div className="metric-value">{(detailsData && detailsData.totalProducts) || (detailsData && detailsData.orders ? detailsData.orders.reduce((acc,o)=>acc + (o.items ? o.items.length : 0),0) : 0)}</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Total Spent</div>
                    <div className="metric-value">Rs. {(detailsData && detailsData.totalAmount) || (detailsData && detailsData.orders ? detailsData.orders.reduce((acc,o)=>acc + (o.total || o.amount || 0),0) : 0)}</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Recent Orders</div>
                    <div className="metric-value">{(detailsData && detailsData.recentOrdersCount) || (detailsData && detailsData.orders ? Math.min(5, detailsData.orders.length) : 0)}</div>
                  </div>
                </div>

                <div className="details-list">
                  <h4>Orders / Purchases</h4>
                  {(detailsData && detailsData.orders && detailsData.orders.length > 0) ? (
                    <div className="orders">
                      {detailsData.orders.map((o) => (
                        <div className="order-card" key={o.id || o.orderId}>
                          <div className="order-row">
                            <div><strong>Order:</strong> {o.id || o.orderId}</div>
                            <div><strong>Date:</strong> {o.date || o.createdAt || o.orderDate}</div>
                            <div><strong>Total:</strong> Rs. {o.total || o.amount || 0}</div>
                          </div>
                          <div className="order-items">
                            {(o.items || o.orderItems || []).map((it, idx) => (
                              <div key={idx} className="order-item">
                                <div className="oi-name">{it.name || it.productName || it.title}</div>
                                <div className="oi-qty">Qty: {it.quantity || it.qty || 1}</div>
                                <div className="oi-price">Rs. {it.price || it.unitPrice || it.amount || 0}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty">No orders found for this user.</div>
                  )}
                </div>
                {(detailsData && detailsData.activity && detailsData.activity.length > 0) && (
                  <div className="recent-activity">
                    <h4>Recent Activity</h4>
                    <ul>
                      {detailsData.activity.map((a, i) => (
                        <li key={i}>{a.timestamp || a.date}: {a.action || a.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
        <button className="add-btn" onClick={() => openForm()}>+ Add User</button>
      </div>
      <input className="search-input" placeholder="Search users..." value={search} onChange={handleSearch} />
      {loading ? <div>Loading...</div> : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
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
                  {editingUserId === u.id ? (
                    <>
                      <td style={{ display: 'flex', gap: 8 }}>
                        <input name="firstName" value={editingForm.firstName} onChange={(e)=>setEditingForm({...editingForm, firstName: e.target.value})} style={{width:120}} />
                        <input name="lastName" value={editingForm.lastName} onChange={(e)=>setEditingForm({...editingForm, lastName: e.target.value})} style={{width:120}} />
                      </td>
                      <td><input name="email" value={editingForm.email} onChange={(e)=>setEditingForm({...editingForm, email: e.target.value})} style={{width:220}} /></td>
                      <td><input name="username" value={editingForm.username} onChange={(e)=>setEditingForm({...editingForm, username: e.target.value})} style={{width:140}} /></td>
                      <td>
                        <select value={editingForm.role} onChange={(e)=>setEditingForm({...editingForm, role: e.target.value})}>
                          <option value="CUSTOMER">Customer</option>
                          <option value="ADMIN">Admin</option>
                          <option value="MANAGER">Manager</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="save-btn" onClick={()=>saveInlineEdit(u.id)}>Save</button>
                          <button className="cancel-btn" onClick={cancelInlineEdit}>Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{u.firstName} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td>{u.username}</td>
                      <td>{u.role}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button className="edit-btn" onClick={() => startInlineEdit(u)} title="Edit">
                            <FaEdit />
                          </button>
                          <button className="details-btn" onClick={() => openDetails(u)}>{expandedUserId===u.id ? 'Hide' : 'Details'}</button>
                          <button className="delete-btn" onClick={() => handleDelete(u.id)} title="Delete">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>

                {expandedUserId === u.id && (
                  <tr className="details-row">
                    <td colSpan={5}>
                      {detailsLoading ? <div>Loading details...</div> : (
                        <div className="inline-details">
                          <div className="metrics-row">
                            <div className="metric">
                              <div className="metric-label">Products Purchased</div>
                              <div className="metric-value">{(detailsData && detailsData.totalProducts) || (detailsData && detailsData.orders ? detailsData.orders.reduce((acc,o)=>acc + (o.items ? o.items.length : 0),0) : 0)}</div>
                            </div>
                            <div className="metric">
                              <div className="metric-label">Total Spent</div>
                              <div className="metric-value">Rs. {(detailsData && detailsData.totalAmount) || (detailsData && detailsData.orders ? detailsData.orders.reduce((acc,o)=>acc + (o.total || o.amount || 0),0) : 0)}</div>
                            </div>
                            <div className="metric">
                              <div className="metric-label">Recent Orders</div>
                              <div className="metric-value">{(detailsData && detailsData.recentOrdersCount) || (detailsData && detailsData.orders ? Math.min(5, detailsData.orders.length) : 0)}</div>
                            </div>
                          </div>

                          <div className="details-list">
                            <h4>Orders / Purchases</h4>
                            {(detailsData && detailsData.orders && detailsData.orders.length > 0) ? (
                              <div className="orders">
                                {detailsData.orders.map((o) => (
                                  <div className="order-card" key={o.id || o.orderId}>
                                    <div className="order-row">
                                      <div><strong>Order:</strong> {o.id || o.orderId}</div>
                                      <div><strong>Date:</strong> {o.date || o.createdAt || o.orderDate}</div>
                                      <div><strong>Total:</strong> Rs. {o.total || o.amount || 0}</div>
                                    </div>
                                    <div className="order-items">
                                      {(o.items || o.orderItems || []).map((it, idx) => (
                                        <div key={idx} className="order-item">
                                          <div className="oi-name">{it.name || it.productName || it.title}</div>
                                          <div className="oi-qty">Qty: {it.quantity || it.qty || 1}</div>
                                          <div className="oi-price">Rs. {it.price || it.unitPrice || it.amount || 0}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="empty">No orders found for this user.</div>
                            )}
                          </div>

                          {(detailsData && detailsData.activity && detailsData.activity.length > 0) && (
                            <div className="recent-activity">
                              <h4>Recent Activity</h4>
                              <ul>
                                {detailsData.activity.map((a, i) => (
                                  <li key={i}>{a.timestamp || a.date}: {a.action || a.description}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
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
