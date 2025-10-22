import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function RentalUpdate() {
  const [id, setId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/rentals/${id}`, { startDate, endDate });
      alert("Rental updated!");
    } catch (error) {
      console.error(error);
      alert("Failed to update rental.");
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <h2>Update Rental</h2>
      <input type="text" placeholder="Rental ID" value={id} onChange={(e) => setId(e.target.value)} />
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <button type="submit">Update Rental</button>
    </form>
  );
}

export default RentalUpdate;
