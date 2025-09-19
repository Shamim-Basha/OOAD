import React, { useState } from "react";
import axios from "axios";

function RentalForm() {
  const [userId, setUserId] = useState("");
  const [toolId, setToolId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rentalData = { userId, toolId, startDate, endDate };

    try {
      const response = await axios.post("http://localhost:8080/api/rentals", rentalData);
      alert("Rental created! Total cost: " + response.data.totalCost);
    } catch (error) {
      console.error(error);
      alert("Failed to create rental.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Rental</h2>
      <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
      <input type="text" placeholder="Tool ID" value={toolId} onChange={(e) => setToolId(e.target.value)} />
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <button type="submit">Create Rental</button>
    </form>
  );
}

export default RentalForm;
