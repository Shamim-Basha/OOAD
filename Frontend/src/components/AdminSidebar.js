import { Link, useLocation } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">Lanka Hardware</div>
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
          <li>
            Sales Reports
          </li>
          <li>
            Orders & Deliveries
          </li>
          <li>
            Logout
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
