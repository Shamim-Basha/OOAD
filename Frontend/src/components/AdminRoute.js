import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user && user.role === 'ADMIN';

  if (!isAdmin) {
    console.log("Access denied. Admins only.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;