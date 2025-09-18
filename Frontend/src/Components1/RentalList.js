import React, { useEffect, useState } from "react";
import axios from "axios";

function RentalList() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/rentals");
      setRentals(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load rentals");
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
      await axios.delete(`http://localhost:8080/api/rentals/${id}`);
      setRentals(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete rental");
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
