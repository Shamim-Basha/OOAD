import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function RentalForm() {
  const [userId, setUserId] = useState("");
  const [toolId, setToolId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rentalData = { 
      userId: parseInt(userId), 
      toolId: parseInt(toolId), 
      startDate, 
      endDate, 
      quantity: parseInt(quantity)
    };

    try {
      const response = await axios.post(`${API_URL}/api/rentals`, rentalData);
      alert("Rental created! Total cost: " + response.data.totalCost);
      // Reset form
      setUserId("");
      setToolId("");
      setStartDate("");
      setEndDate("");
      setQuantity(1);
    } catch (error) {
      console.error(error);
      alert("Failed to create rental: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>Create Rental</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>User ID</label>
        <input 
          type="number" 
          placeholder="User ID" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Tool ID</label>
        <input 
          type="number" 
          placeholder="Tool ID" 
          value={toolId} 
          onChange={(e) => setToolId(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Quantity</label>
        <input 
          type="number" 
          min="1"
          max="100"
          value={quantity} 
          onChange={(e) => setQuantity(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Start Date</label>
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>End Date</label>
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>
      
      <button 
        type="submit" 
        style={{ 
          width: '100%', 
          padding: '10px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Create Rental
      </button>
    </form>
  );
}

export default RentalForm;
