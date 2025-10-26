import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';

import './App.css';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Products from './pages/Products';
import ProductDetail from "./pages/ProductDetail";
import Register from './pages/Register';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import UserProfile from './pages/UserProfile'
import ChangePassword from './pages/ChangePassword';
import AdminSidebar from './components/AdminSidebar';
import AdminDashboard from "./pages/Admin/AdminDashboard"
import UserManagement from './pages/Admin/UserManagement';
import ProductManagement from './pages/Admin/ProductManagement';
import ToolManagement from './pages/Admin/ToolManagement';
import RentalManagement from './pages/Admin/RentalManagement';
import OrderManagement from './pages/Admin/OrderManagement';


import Contact from './pages/Contact';


function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className={isAdminRoute ? "App app-has-sidebar" : "App"}>
      {!isAdminRoute && <Navbar />}
      {isAdminRoute && <AdminSidebar />}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rentals" element={<Services />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products/:id" element={<ProductDetail/>} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/rental/:id" element={<ServiceDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<UserProfile/>}/>
          <Route path="/change-password" element={<ChangePassword/>}/>
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <AdminRoute>
                <ProductManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/tools" 
            element={
              <AdminRoute>
                <ToolManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/rentals" 
            element={
              <AdminRoute>
                <RentalManagement />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <AdminRoute>
                <OrderManagement />
              </AdminRoute>
            } 
          />
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