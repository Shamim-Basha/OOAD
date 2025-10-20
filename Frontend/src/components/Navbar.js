import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaSearch, FaBars, FaTimes, FaTools, FaUser, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { ToastContainer ,toast } from 'react-toastify';
import { isAdmin } from '../utils/Auth';
import 'react-toastify/dist/ReactToastify.css';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  const handleLogout = () => {
    const toastId = toast.loading('🔐 Signing out...');

    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);

    toast.update(toastId, {
              render: '✅ Signed out successfully!',
              type: 'success',
              isLoading: false,
              autoClose: 2000,
              closeOnClick: true,
    });
    navigate('/');
  };


  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div>
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <FaTools className="logo-icon" />
            <span>Lanka Hardware</span>
          </Link>
        </div>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/products" 
            className={`navbar-link ${isActive('/products') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Products
          </Link>
          <Link 
            to="/rentals" 
            className={`navbar-link ${isActive('/rentals') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Rental Services
          </Link>
          <Link 
            to="/contact" 
            className={`navbar-link ${isActive('/contact') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          {isAdmin() && <Link 
            to="/admin" 
            className={`btn btn-primary navbar-link ${isActive('/admin') ? 'active' : ''}`}
            style={{color: 'white', backgroundColor: '#dabd1dff'}}
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>}
        </div>

        <div className="navbar-actions">
          
          <Link to="/cart" className="cart-icon">
            <FaShoppingCart />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* User Authentication Section */}
          <div className="user-section">
            {isLoggedIn ? (
              <div className="user-dropdown">
                <button 
                  className="user-profile-btn"
                  onClick={toggleDropdown}
                  aria-label="User profile"
                >
                  <FaUserCircle className="user-icon" />
                  <span className="user-name">{user?.username || 'User'}</span>
                </button>
                
                {showDropdown && (
                  <div className="dropdown-menu">
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => {
                        setShowDropdown(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      <FaUser className="dropdown-icon" />
                      My Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="dropdown-item"
                      onClick={() => {
                        setShowDropdown(false);
                        setIsMenuOpen(false);
                      }}
                    >
                      <FaShoppingCart className="dropdown-icon" />
                      My Orders
                    </Link>
                    <button 
                      className="dropdown-item logout-btn"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="dropdown-icon" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link 
                  to="/login" 
                  className="login-btn"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser className="auth-icon" />
                  Login
                </Link>
              </div>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
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

export default Navbar;