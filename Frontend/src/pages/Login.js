import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaTools } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Auth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Show loading toast
    const toastId = toast.loading('Signing in...');

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();

        toast.update(toastId, {
          render: 'Login successful!',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
          closeOnClick: true,
        });

        localStorage.setItem('user', JSON.stringify(data));
        if (data.role === 'ADMIN') {
        localStorage.setItem('isAdmin', 'true');
        setTimeout(() => {
          navigate('/admin');
          window.location.reload();
        }, 1000);
        } else {
          localStorage.removeItem('isAdmin');
          setTimeout(() => {
            navigate('/');
            window.location.reload();
          }, 1000);
        }
      } else {
        toast.update(toastId, {
          render:'Invalid username or password',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
          closeOnClick: true,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: 'Network error. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <FaTools className="auth-logo" />
          <h2>Welcome Back</h2>
          <p>Sign in to your Eagle Horizon (Pvt) Ltd account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>

      {/* Toast container */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
};

export default Login;
