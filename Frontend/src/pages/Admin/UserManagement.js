import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserManagement.css';

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

  // details (activity) feature removed
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingForm, setEditingForm] = useState({});



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
      {/* details feature removed */}
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
                          {/* Details feature removed */}
                          <button className="delete-btn" onClick={() => handleDelete(u.id)} title="Delete">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>

                {/* details row removed */}
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
