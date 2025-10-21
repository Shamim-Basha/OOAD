import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { convertByteToImage } from '../../utils/imageHelpers';
import './ToolManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const defaultForm = {
  name: '',
  dailyRate: '',
  category: '',
  available: true,
  totalStock: 1,
  stockQuantity: 1,
  description: '',
  image: ''
};

const ToolManagement = () => {
  const [tools, setTools] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTool, setEditTool] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/tools`);
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
    const preview = tool && tool.image ? convertByteToImage(tool.image) : '';
    setImagePreview(preview);
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

  const handleImageChange = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result; // data:image/...;base64,XXXX
      setImagePreview(typeof dataUrl === 'string' ? dataUrl : '');
      if (typeof dataUrl === 'string') {
        const commaIndex = dataUrl.indexOf(',');
        const base64 = commaIndex >= 0 ? dataUrl.substring(commaIndex + 1) : dataUrl;
        setForm(prev => ({ ...prev, image: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const method = editTool ? 'put' : 'post';
      const url = editTool ? `${API_URL}/api/tools/${editTool.id}` : `${API_URL}/api/tools`;
      
      // Prepare data - ensure numeric fields are numbers
      const toolData = {
        ...form,
        dailyRate: parseFloat(form.dailyRate) || 0,
        totalStock: parseInt(form.totalStock) || 1,
        stockQuantity: parseInt(form.stockQuantity) || 1,
        available: form.available === true || form.available === 'true'
      };
      
      console.log('Submitting tool data:', toolData);
      
      const response = await axios({
        method,
        url,
        data: toolData,
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log('Response:', response.data);
      setMessage(editTool ? 'Tool updated.' : 'Tool added.');
      fetchTools();
      closeForm();
    } catch (error) {
      console.error('Error saving tool:', error);
      console.error('Error response:', error.response?.data);
      setMessage(error.response?.data || 'Error saving tool.');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this tool?')) return;
    try {
      await axios.delete(`${API_URL}/api/tools/${id}`);
      fetchTools();
    } catch (err) {
      const msg = err?.response?.data || 'Error deleting tool.';
      setMessage(typeof msg === 'string' ? msg : 'Error deleting tool.');
    }
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
              <th>Image</th><th>Name</th><th>Category</th><th>Daily Rate</th><th>Total Stock</th><th>Available Qty</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td>
                  {t.image ? (
                    <img src={convertByteToImage(t.image)} alt={t.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                  ) : (
                    <div style={{ width: 48, height: 48, background: '#f1f3f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 12 }}>No Image</div>
                  )}
                </td>
                <td>{t.name}</td>
                <td>{t.category}</td>
                <td>Rs. {t.dailyRate?.toLocaleString() || '0'}</td>
                <td><strong>{t.totalStock || t.stockQuantity || 0}</strong></td>
                <td>
                  <strong style={{ color: t.stockQuantity > 0 ? '#28a745' : '#dc3545' }}>
                    {t.stockQuantity || 0}
                  </strong>
                </td>
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
              <input 
                name="totalStock" 
                placeholder="Total Stock (Total tools owned)" 
                value={form.totalStock || form.stockQuantity} 
                onChange={handleFormChange} 
                type="number" 
                min="0" 
                required 
              />
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '-8px', marginBottom: '12px' }}>
                Note: Total Stock is the total number of tools you own. Available quantity will be calculated automatically.
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6 }}>Image (optional)</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <div style={{ marginTop: 8 }}>
                    <img src={imagePreview} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #e9ecef' }} />
                  </div>
                )}
              </div>
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
