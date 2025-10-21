import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './AdminSidebar.css';


const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token');
    
    navigate('/');
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };
  return (
    <>
    <aside className="admin-sidebar">
      <div className="sidebar-logo" onClick={()=> navigate('/')} style={{cursor : 'pointer'}}>Lanka Hardware</div>
      <nav className="sidebar-nav">
        <ul>
          <Link to="/admin" className="sidebar-link" style={{ textDecoration: 'none' }}>
            <li className={location.pathname === '/admin' ? 'active' : ''}>
              Dashboard
            </li>
          </Link>
          <Link to="/admin/users" className="sidebar-link" style={{ textDecoration: 'none' }}>
            <li className={location.pathname === '/admin/users' ? 'active' : ''}>
              User Management
            </li>
          </Link>
          <Link to="/admin/products" className="sidebar-link" style={{ textDecoration: 'none' }}>
            <li className={location.pathname === '/admin/products' ? 'active' : ''}>
              Product Management
            </li>
          </Link>
          <Link to="/admin/tools" className="sidebar-link" style={{ textDecoration: 'none' }}>
            <li className={location.pathname === '/admin/tools' ? 'active' : ''}>
              Tool Management
            </li>
          </Link>
          <Link to="/admin/rentals" className="sidebar-link" style={{ textDecoration: 'none' }}>
            <li className={location.pathname === '/admin/rentals' ? 'active' : ''}>
              Rental Management
            </li>
          </Link>
          <Link to="/admin/orders" className="sidebar-link" style={{ textDecoration: 'none' }}>
            <li className={location.pathname === '/admin/orders' ? 'active' : ''}>
              Orders & Delivery
            </li>
          </Link>
          <li
              className="sidebar-logout-btn"
              onClick={handleLogout}>
              Logout
          </li>
        </ul>
      </nav>
    </aside>
    {showLogoutModal && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <div className="modal-header">
              <h3>Confirm Logout</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to logout from the admin panel?</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={cancelLogout}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
