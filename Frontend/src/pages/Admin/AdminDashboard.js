import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import DashboardCharts from './DashboardCharts'; 
import './AdminDashboard.css';

const DashboardCards = ({ stats }) => {
  const navigate = useNavigate();
  return (
    <div className="dashboard-cards">
      <div className="dashboard-card" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
        <div className="card-icon users">👥</div>
        <div className="card-info">
          <div className="card-title">Total Users</div>
          <div className="card-value">{stats.users}</div>
        </div>
      </div>
      <div className="dashboard-card" onClick={() => navigate('/admin/products')} style={{ cursor: 'pointer' }}>
        <div className="card-icon products">📦</div>
        <div className="card-info">
          <div className="card-title">Total Products</div>
          <div className="card-value">{stats.products}</div>
        </div>
      </div>
      <div className="dashboard-card" onClick={() => navigate('/admin/tools')} style={{ cursor: 'pointer' }}>
        <div className="card-icon tools">🛠️</div>
        <div className="card-info">
          <div className="card-title">Total Tools</div>
          <div className="card-value">{stats.tools}</div>
        </div>
      </div>
      <div className="dashboard-card" onClick={() => navigate('/admin/rentals')} style={{ cursor: 'pointer' }}>
        <div className="card-icon rentals">🔄</div>
        <div className="card-info">
          <div className="card-title">Total Rentals</div>
          <div className="card-value">{stats.rentals}</div>
        </div>
      </div>
      <div className="dashboard-card" onClick={() => navigate('/admin/orders')} style={{ cursor: 'pointer' }}>
        <div className="card-icon orders">📦</div>
        <div className="card-info">
          <div className="card-title">Total Orders</div>
          <div className="card-value">{stats.orders}</div>
        </div>
      </div>
      <div className="dashboard-card" style={{ cursor: 'default' }}>
        <div className="card-icon sales">💰</div>
        <div className="card-info">
          <div className="card-title">Sales Today</div>
          <div className="card-value">${stats.salesToday}</div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [active, setActive] = useState('dashboard');
  const [stats, setStats] = useState({ users: 0, products: 0, tools: 0, rentals: 0, orders: 0, salesToday: 0});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Fetch users count
        const usersRes = await axios.get('http://localhost:8080/api/users');
        const usersData = usersRes.data;
        const usersCount = Array.isArray(usersData) ? usersData.length : (usersData.data ? usersData.data.length : 0);

        // Fetch products count
        let productsCount = 0;
        try {
          const productsRes = await axios.get('http://localhost:8080/api/products');
          const productsData = productsRes.data;
          productsCount = Array.isArray(productsData) ? productsData.length : (productsData.data ? productsData.data.length : 0);
        } catch {}

        let salesToday = 0;
        try {
          const salesRes = await axios.get('http://localhost:8080/api/sales/today');
          const salesData = salesRes.data;
          salesToday = salesData.total || 0;
        } catch {}

        // Fetch tools count
        let toolsCount = 0;
        try {
          const toolsRes = await axios.get('http://localhost:8080/api/tools');
          const toolsData = toolsRes.data;
          toolsCount = Array.isArray(toolsData) ? toolsData.length : (toolsData.data ? toolsData.data.length : 0);
        } catch {}

        // Fetch rentals count
        let rentalsCount = 0;
        try {
          const rentalsRes = await axios.get('http://localhost:8080/api/rentals');
          const rentalsData = rentalsRes.data;
          rentalsCount = Array.isArray(rentalsData) ? rentalsData.length : (rentalsData.data ? rentalsData.data.length : 0);
        } catch {}

        // Fetch orders count
        let ordersCount = 0;
        try {
          const ordersRes = await axios.get('http://localhost:8080/api/orders/admin/all');
          const ordersData = ordersRes.data;
          ordersCount = Array.isArray(ordersData) ? ordersData.length : 0;
        } catch {}

        setStats({ users: usersCount, products: productsCount, tools: toolsCount, rentals: rentalsCount, orders: ordersCount, salesToday});
      } catch {
        setStats({ users: "-", products: "-", salesToday: "-"});
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar active={active} onNavigate={setActive} />
      <main className="admin-dashboard-main">
        <header className="dashboard-header">
          <h1>Admin Dashboard</h1>
        </header>
        {loading ? <div>Loading dashboard...</div> : <DashboardCards stats={stats} />}
        <DashboardCharts />
      </main>
    </div>
  );
};

export default AdminDashboard;
