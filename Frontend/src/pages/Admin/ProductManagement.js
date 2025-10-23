import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './ProductManagement.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const defaultForm = {
  name: '',
  category: '',
  subCategory: '', 
  price: '',
  quantity: '',
  image: null, 
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
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error fetching products';
      setMessage(typeof errorMsg === 'string' ? errorMsg : 'Error fetching products');
    }
    setLoading(false);
  };

  const handleSearch = e => setSearch(e.target.value);

  const openForm = (product = null) => {
    setEditProduct(product);
    setForm(
      product
        ? { ...product, image: null } // Reset image for file input
        : defaultForm
    );
    setImagePreview(product?.image ? `data:image/jpeg;base64,${product.image}` : null);
    setShowForm(true);
    setMessage('');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditProduct(null);
    setImagePreview(null);
    setMessage('');
  };

  // Function to compress image
  const compressImage = (file, maxSizeMB = 1, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file'));
        return;
      }

      // Check initial file size (1MB = 1,048,576 bytes)
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size <= maxSizeBytes) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 1200; // Maximum width/height
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with quality adjustment
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas to Blob conversion failed'));
                return;
              }
              
              // If still too large, recursively compress with lower quality
              if (blob.size > maxSizeBytes && quality > 0.1) {
                compressImage(file, maxSizeMB, quality - 0.1)
                  .then(resolve)
                  .catch(reject);
              } else if (blob.size > maxSizeBytes) {
                reject(new Error('Image is too large even after compression'));
              } else {
                // Create new file with compressed blob
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleFormChange = async e => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      const file = files[0];
      if (!file) return;

      setMessage('Compressing image...');

      try {
        // Validate and compress image
        const compressedFile = await compressImage(file, 1);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview(event.target.result);
        };
        reader.readAsDataURL(compressedFile);
        
        setForm({ ...form, image: compressedFile });
        setMessage('');
      } catch (error) {
        console.error('Image processing error:', error);
        setMessage(error.message);
        // Clear the file input
        e.target.value = '';
        setImagePreview(null);
        setForm({ ...form, image: null });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');

    // Final image validation
    if (form.image && form.image.size > 1 * 1024 * 1024) {
      setMessage('Image must be less than 1MB');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('category', form.category);
    formData.append('subCategory', form.subCategory);
    formData.append('price', form.price);
    formData.append('quantity', form.quantity);
    formData.append('description', form.description);
    if (form.image) formData.append('image', form.image);

    try {
      const method = editProduct ? 'put' : 'post';
      const url = editProduct
        ? `${API_URL}/api/products/${editProduct.id}`
        : `${API_URL}/api/products`;

      const res = await axios({
        method,
        url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Server response:', res.data);
      setMessage(editProduct ? 'Product updated.' : 'Product added.');
      fetchProducts();
      closeForm();
    } catch (err) {
      console.error('Error saving product:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error saving product.';
      setMessage(typeof errorMsg === 'string' ? errorMsg : 'Error saving product.');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/api/products/${id}`);
      setMessage('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error deleting product';
      setMessage(typeof errorMsg === 'string' ? errorMsg : 'Error deleting product');
    }
  };

  const filtered = products.filter(p =>
    (p.name + ' ' + p.category + ' ' + p.subCategory + ' ' + p.description)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="product-mgmt-page">
      <div className="product-mgmt-header">
        <h2>Product Management</h2>
        <button className="add-btn" onClick={() => openForm()}>+ Add Product</button>
      </div>

      <input
        className="search-input"
        placeholder="Search products..."
        value={search}
        onChange={handleSearch}
      />

      {message && !showForm && (
        <div className="form-message" style={{ marginBottom: '10px' }}>
          {typeof message === 'string' ? message : 'An error occurred'}
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Sub Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  {p.image ? (
                    <img
                      src={`data:image/jpeg;base64,${p.image}`}
                      alt={p.name}
                      className="product-img"
                    />
                  ) : (
                    '-'
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.subCategory}</td>
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
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleFormChange}
                required
              />
              <input
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleFormChange}
                required
              />
              <input
                name="subCategory"
                placeholder="Sub Category"
                value={form.subCategory}
                onChange={handleFormChange}
                required
              />
              <input
                name="price"
                placeholder="Price"
                value={form.price}
                onChange={handleFormChange}
                type="number"
                min="0"
                required
              />
              <input
                name="quantity"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleFormChange}
                type="number"
                min="0"
                required
              />
              
              {/* Image upload section */}
              <div className="image-upload-section">
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFormChange}
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" className="preview-img" />
                    <div className="image-size">
                      {form.image ? `Size: ${(form.image.size / 1024 / 1024).toFixed(2)} MB` : ''}
                    </div>
                  </div>
                )}
              </div>
              
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleFormChange}
                maxLength="100"
              />
              <div className="form-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={closeForm}>Cancel</button>
              </div>
              {message && <div className="form-message">{typeof message === 'string' ? message : 'An error occurred'}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;