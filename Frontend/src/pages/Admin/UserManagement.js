import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
      await axios({
        method,
        url,
        data: body,
        headers: { 'Content-Type': 'application/json' },
      });
      setMessage(editUser ? 'User updated.' : 'User added.');
      fetchUsers();
      closeForm();
    } catch {
      setMessage('Error saving user.');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/users/${id}`);
      fetchUsers();
    } catch {}
  };

  const filtered = users.filter(u =>
    (u.firstName + ' ' + u.lastName + ' ' + u.email + ' ' + u.username).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="user-mgmt-page">
      <div className="user-mgmt-header">
        <h2>User Management</h2>
        <button className="add-btn" onClick={() => openForm()}>+ Add User</button>
      </div>
      <input className="search-input" placeholder="Search users..." value={search} onChange={handleSearch} />
      {loading ? <div>Loading...</div> : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Username</th><th>Role</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>
                  <button className="edit-btn" onClick={() => openForm(u)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
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
              <input name="password" placeholder="Password" value={form.password} onChange={handleFormChange} type="password" autoComplete="new-password" />
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
