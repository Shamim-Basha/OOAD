import React, { useEffect, useState } from 'react';
import './UserProfile.css';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Replace with actual user ID from auth context or localStorage
  const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null;

  const navigate = useNavigate();

  useEffect(() => {
    if (!userId){
      navigate('/login');
      return;
    };
    fetch(`http://localhost:8080/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data.data || data); // handle ResponseDTO or direct user
        setForm(data.data || data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setEditMode(true);
  }
  const handleCancel = () => {
    setEditMode(false);
    setForm(user);
    setMessage('');
  };

  const handleSave = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.text();
      if (res.ok) {
        setUser(form);
        setEditMode(false);
        setMessage('Profile updated successfully!');
        localStorage.setItem('user', JSON.stringify(form));
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage(result || 'Update failed.');
      }
    } catch (err) {
      setMessage('Error updating profile.');
    }
  };

  if (loading) return <div className="user-profile"><div className="loader" /></div>;
  if (!user) return <div className="user-profile">User not found.</div>;

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSave} className="profile-form">
        <div className="form-grid">
          <div className="profile-row">
            <label>
              <span className="icon">👤</span>
              First Name:
            </label>
            <input name="firstName" value={form.firstName || ''} onChange={handleChange} disabled={!editMode} required />
          </div>
          <div className="profile-row">
            <label>
              <span className="icon">👤</span>
              Last Name:
            </label>
            <input name="lastName" value={form.lastName || ''} onChange={handleChange} disabled={!editMode} required />
          </div>
          <div className="profile-row">
            <label>
              <span className="icon">👤</span>
              Username:
            </label>
            <input name="username" value={form.username || ''} onChange={handleChange} disabled={!editMode} required />
          </div>
          <div className="profile-row">
            <label>
              <span className="icon">📧</span>
              Email:
            </label>
            <input name="email" type="email" value={form.email || ''} onChange={handleChange} disabled={!editMode} required />
          </div>
          <div className="profile-row">
            <label>
              <span className="icon">📱</span>
              Phone:
            </label>
            <input name="phone" value={form.phone || ''} onChange={handleChange} disabled={!editMode} />
          </div>
          <div className="profile-row">
            <label>
              <span className="icon">🏙️</span>
              City:
            </label>
            <input name="city" value={form.city || ''} onChange={handleChange} disabled={!editMode} />
          </div>
          <div className="profile-row postal-code-row">
            <label>
              <span className="icon">📮</span>
              Postal Code:
            </label>
            <input name="postalCode" value={form.postalCode || ''} onChange={handleChange} disabled={!editMode} />
          </div>
          <div className="profile-row address-row">
            <label>
              <span className="icon">🏠</span>
              Address:
            </label>
            <textarea 
              name="address" 
              value={form.address || ''} 
              onChange={handleChange} 
              disabled={!editMode}
              rows="3"
              placeholder="Enter your full address..."
            />
          </div>
          <div className="profile-actions">
            {editMode ? (
              <>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="edit-btn" onClick={handleEdit}>                Edit Profile
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;