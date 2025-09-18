import './App.css';

import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages (designs you added)
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';

// Existing rental components (kept accessible for now)
import RentalForm from './Components1/RentalForm';
import RentalList from './Components1/RentalList';
import RentalUpdate from './Components1/RentalUpdate';

function Placeholder({ title }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>{title}</h2>
      <p>Coming soon.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        {/** Rental pages using your new designs */}
        <Route path="/rentals" element={<Services />} />
        <Route path="/service/:id" element={<ServiceDetail />} />

        {/** Keep legacy rental tools available under /admin/rentals */}
        <Route path="/admin/rentals" element={
          <div style={{ padding: '20px' }}>
            <h1>Rental Management</h1>
            <RentalForm />
            <RentalList />
            <RentalUpdate />
          </div>
        } />

        {/** Simple placeholders for links present in Navbar/Home */}
        <Route path="/products" element={<Placeholder title="Products" />} />
        <Route path="/contact" element={<Placeholder title="Contact" />} />
        <Route path="/cart" element={<Placeholder title="Cart" />} />
        <Route path="/profile" element={<Placeholder title="My Profile" />} />
        <Route path="/orders" element={<Placeholder title="My Orders" />} />

        {/** Fallback */}
        <Route path="*" element={<Placeholder title="Page Not Found" />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

