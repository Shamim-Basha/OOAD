import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './ToolManagement.css';

const defaultForm = {
  name: '',
  dailyRate: '',
  category: '',
  available: true,
  stockQuantity: 1,
  description: ''
};

const ToolManagement = () => {
  const [tools, setTools] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTool, setEditTool] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/tools');
      setTools(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch {
      setTools([]);
    }
    setLoading(false);
  };

  const handleSearch = e => setSearch(e.target.value);

  const openForm = (tool = null) => {
    setEditTool(tool);
    setForm(tool ? { ...tool } : defaultForm);
    setShowForm(true);
    setMessage('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditTool(null);
    setMessage('');
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const method = editTool ? 'put' : 'post';
      const url = editTool ? `http://localhost:8080/api/tools/${editTool.id}` : 'http://localhost:8080/api/tools';
      await axios({
        method,
        url,
        data: form,
        headers: { 'Content-Type': 'application/json' },
      });
      setMessage(editTool ? 'Tool updated.' : 'Tool added.');
      fetchTools();
      closeForm();
    } catch {
      setMessage('Error saving tool.');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this tool?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/tools/${id}`);
      fetchTools();
    } catch {}
  };

  const filtered = tools.filter(t =>
    (t.name + ' ' + t.category + ' ' + t.description).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tool-mgmt-page">
      <div className="tool-mgmt-header">
        <h2>Tool Management</h2>
        <button className="add-btn" onClick={() => openForm()}>+ Add Tool</button>
      </div>
      <input className="search-input" placeholder="Search tools..." value={search} onChange={handleSearch} />
      {loading ? <div>Loading...</div> : (
        <table className="tool-table">
          <thead>
            <tr>
              <th>Name</th><th>Category</th><th>Daily Rate</th><th>Stock</th><th>Available</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.category}</td>
                <td>Rs. {t.dailyRate?.toLocaleString() || '0'}</td>
                <td>{t.stockQuantity || 0}</td>
                <td>
                  <span className={`status-badge ${t.available ? 'available' : 'unavailable'}`}>
                    {t.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td>
                  <button className="edit-btn" onClick={() => openForm(t)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="modal-bg">
          <div className="modal">
            <h3>{editTool ? 'Edit Tool' : 'Add Tool'}</h3>
            <form onSubmit={handleSubmit} className="tool-form">
              <input name="name" placeholder="Tool Name" value={form.name} onChange={handleFormChange} required />
              <select name="category" value={form.category} onChange={handleFormChange} required>
                <option value="">Select Category</option>
                <option value="Heavy Machinery">Heavy Machinery</option>
                <option value="Construction Equipment">Construction Equipment</option>
                <option value="Power Tools">Power Tools</option>
                <option value="Hand Tools">Hand Tools</option>
                <option value="Safety Equipment">Safety Equipment</option>
              </select>
              <input name="dailyRate" placeholder="Daily Rate (Rs.)" value={form.dailyRate} onChange={handleFormChange} type="number" min="0" step="0.01" required />
              <input name="stockQuantity" placeholder="Stock Quantity" value={form.stockQuantity} onChange={handleFormChange} type="number" min="0" required />
              <div className="checkbox-group">
                <label>
                  <input 
                    name="available" 
                    type="checkbox" 
                    checked={form.available} 
                    onChange={(e) => setForm({...form, available: e.target.checked})} 
                  />
                  Available for Rent
                </label>
              </div>
              <textarea name="description" placeholder="Description" value={form.description} onChange={handleFormChange} rows="3" />
              <div className="form-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={closeForm}>Cancel</button>
              </div>
              {message && <div className="form-message">{message}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolManagement;
