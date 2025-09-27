import './App.css';

import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages (designs you added)
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Register from './pages/Register';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Home />} />
            <Route path="/rentals" element={<Services />} />
            <Route path="/cart" element={<Home />} />
            <Route path="/contact" element={<Home />} />
            <Route path="/product/:id" element={<Home />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/rental/:id" element={<ServiceDetail />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

