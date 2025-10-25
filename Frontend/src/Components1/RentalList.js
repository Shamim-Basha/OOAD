import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function RentalList() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/rentals`);
      setRentals(response.data);
    } catch (error) {
      console.error("Failed to load rentals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this rental?")) return;
    try {
      await axios.delete(`${API_URL}/api/rentals/${id}`);
      setRentals(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Failed to delete rental:", error);
    }
  };

  return (
    <div>
      <h2>All Rentals</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {rentals.map(rental => (
            <li key={rental.id}>
              Tool ID: {rental.toolId}, User ID: {rental.userId}, Total Cost: Rs.{rental.totalCost}
              <button style={{ marginLeft: 8 }} onClick={() => handleDelete(rental.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={fetchRentals}>Refresh</button>
    </div>
  );
}

export default RentalList;
