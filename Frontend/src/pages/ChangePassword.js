import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const ChangePassword = () => {
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    // If user not logged in, redirect to login
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.oldPassword || !form.newPassword) {
      toast.error('Please fill both fields');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Changing password...');

    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: form.oldPassword, newPassword: form.newPassword }),
      });

      const text = await res.text();

      if (res.ok) {
        toast.update(toastId, { render: 'Password changed successfully', type: 'success', isLoading: false, autoClose: 2000 });
        // Optionally force logout so user re-authenticates with new password
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } else {
        toast.update(toastId, { render: text || 'Failed to change password', type: 'error', isLoading: false, autoClose: 3000 });
      }
    } catch (err) {
      toast.update(toastId, { render: 'Network error', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Change Password</h2>
          <p>Provide your current password and a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              placeholder="Current password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="New password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default ChangePassword;
