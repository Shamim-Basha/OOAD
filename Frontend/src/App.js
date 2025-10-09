import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import './App.css';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Products from './pages/Products';
import ProductDetail from "./pages/ProductDetail";
import Register from './pages/Register';
import Login from './pages/Login';
import Cart from './pages/Cart';
import UserProfile from './pages/UserProfile'
import AdminSidebar from './components/AdminSidebar';
import AdminDashboard from "./pages/Admin/AdminDashboard"
import UserManagement from './pages/Admin/UserManagement';
import ProductManagement from './pages/Admin/ProductManagement';
import ToolManagement from './pages/Admin/ToolManagement';
import RentalManagement from './pages/Admin/RentalManagement';



function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <div className={isAdminRoute ? "App app-has-sidebar" : "App"}>
      {!isAdminRoute && <Navbar />}
      {isAdminRoute && <AdminSidebar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rentals" element={<Services />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetail/>} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/rental/:id" element={<ServiceDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<UserProfile/>}/>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/tools" element={<ToolManagement />} />
          <Route path="/admin/rentals" element={<RentalManagement />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

