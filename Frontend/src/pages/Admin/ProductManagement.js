import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './ProductManagement.css';

const defaultForm = {
  name: '',
  category: '',
  price: '',
  quantity: '',
  imageUrl: '',
  description: ''
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/products');
      setProducts(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch {
      setProducts([]);
    }
    setLoading(false);
  };

  const handleSearch = e => setSearch(e.target.value);

  const openForm = (product = null) => {
    setEditProduct(product);
    setForm(product ? { ...product } : defaultForm);
    setShowForm(true);
    setMessage('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditProduct(null);
    setMessage('');
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const method = editProduct ? 'put' : 'post';
      const url = editProduct ? `http://localhost:8080/api/products/${editProduct.id}` : 'http://localhost:8080/api/products';
      await axios({
        method,
        url,
        data: form,
        headers: { 'Content-Type': 'application/json' },
      });
      setMessage(editProduct ? 'Product updated.' : 'Product added.');
      fetchProducts();
      closeForm();
    } catch {
      setMessage('Error saving product.');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/products/${id}`);
      fetchProducts();
    } catch {}
  };

  const filtered = products.filter(p =>
    (p.name + ' ' + p.category + ' ' + p.description).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="product-mgmt-page">
      <div className="product-mgmt-header">
        <h2>Product Management</h2>
        <button className="add-btn" onClick={() => openForm()}>+ Add Product</button>
      </div>
      <input className="search-input" placeholder="Search products..." value={search} onChange={handleSearch} />
      {loading ? <div>Loading...</div> : (
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Quantity</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>{p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="product-img" /> : '-'}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.price}</td>
                <td>{p.quantity}</td>
                <td>
                  <button className="edit-btn" onClick={() => openForm(p)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="modal-bg">
          <div className="modal">
            <h3>{editProduct ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit} className="product-form">
              <input name="name" placeholder="Name" value={form.name} onChange={handleFormChange} required />
              <input name="category" placeholder="Category" value={form.category} onChange={handleFormChange} />
              <input name="price" placeholder="Price" value={form.price} onChange={handleFormChange} type="number" min="0" step="0.01" required />
              <input name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleFormChange} type="number" min="0" required />
              <input name="imageUrl" placeholder="Image URL" value={form.imageUrl} onChange={handleFormChange} />
              <textarea name="description" placeholder="Description" value={form.description} onChange={handleFormChange} />
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

export default ProductManagement;
