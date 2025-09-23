import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import './App.css';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import RentalList from './Components1/RentalList';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Home />} />
            <Route path="/rentals" element={<RentalList />} />
            <Route path="/cart" element={<Home />} />
            <Route path="/contact" element={<Home />} />
            <Route path="/product/:id" element={<Home />} />
            <Route path="/rental/:id" element={<Home />} />
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

