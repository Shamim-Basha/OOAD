import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Products.css';
import axios from 'axios';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState('name');

  const USER = localStorage.getItem('user');
  const USER_ID = USER? JSON.parse(USER)["id"] : null;

  const navigate = useNavigate();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Tools', label: 'Tools' },
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Paint', label: 'Paint & Supplies' }
  ];

  const placeholderImage = 'https://via.placeholder.com/300?text=No+Image';

  function convertByteToImage(image) {
    if (!image) return placeholderImage;
    return `data:image/png;base64,${image}`;
  }

  useEffect(() => {
    
    axios.get("http://localhost:8080/api/products")
      .then((res) => {
        const prods = (res.data || []).map(p => {
          const product = {
            id: p.id,
            name: p.name || '',
            quantity: p.quantity ?? 0,
            category: p.category || '',
            subCategory: p.subCategory || '',
            description: p.description || '',
            price: p.price ?? 0,
            image: p.image ?? null
          };
          try {
            product.imageSrc = convertByteToImage(product.image);
          } catch (e) {
            console.error('Error converting image for product', product.id, e);
            product.imageSrc = placeholderImage;
          }
          return product;
        });
        setProducts(prods);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error while retrieving the products:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const filterProducts = () => {
    const term = searchTerm.trim().toLowerCase();

    let filtered = products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.subCategory?.toLowerCase().includes(term);

      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const formatPrice = (price) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const addToCart = async (product) => {
    if(USER == null){
      navigate("/login");
      return;
    }
    try {
      console.log('Adding to cart:', product);
      const payload = {
        userId: Number(USER_ID),
        productId: product.id,
        quantity: 1
      };
      
      const res = await axios.post("http://localhost:8080/api/cart/product/add", payload);
      // alert('Item added to cart successfully!');
      console.log('Cart response:', res.data);
      navigate('/cart');
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to add item to cart';
      alert(message);
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="page-header">
          <h1>Our Products</h1>
          <p>Discover quality hardware products for all your construction and DIY needs</p>
        </div>

        <div className="filters-section">
          <div className="search-filter">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range:</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value, 10) || 0, priceRange[1]])}
                  className="price-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value, 10) || 100000])}
                  className="price-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="results-count">
          <p>Showing {filteredProducts.length} of {products.length} products</p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img
                    src={product.imageSrc || placeholderImage}
                    alt={product.name}
                  />
                  {(product.quantity === 0) && (
                    <div className="out-of-stock">Out of Stock</div>
                  )}
                </div>

                <div className="product-info">
                  <div className="badges">
                    <span className="category-badge">{product.category}</span>
                    {product.subCategory && <span className="subcategory-badge">{product.subCategory}</span>}
                  </div>

                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>

                  <div className="product-meta">
                    <span className={`stock-info ${product.quantity === 0 ? 'out' : ''}`}>
                      {product.quantity > 0 ? `In stock: ${product.quantity}` : 'Out of stock'}
                    </span>
                  </div>

                  <div className="product-price">
                    <span className="current-price">{formatPrice(product.price)}</span>
                  </div>

                  <div className="product-actions">
                    {/* ✅ Fixed: link to ProductDetails page */}
                    <Link to={`/products/${product.id}`} className="btn btn-outline">
                      <FaEye /> View Details
                    </Link>

                    <button
                      className="btn btn-primary"
                      onClick={() => addToCart(product)}
                      disabled={product.quantity === 0}
                    >
                      <FaShoppingCart /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <h3>No products found</h3>
            <p>Try adjusting your search criteria or browse all products</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceRange([0, 100000]);
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
