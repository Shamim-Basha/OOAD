import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaEye } from 'react-icons/fa';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100000]); 
  const [sortBy, setSortBy] = useState('name');

  // Mock products data
  const mockProducts = [
    {
      id: 1,
      name: "Bosch Professional Drill",
      price: 25000,
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      category: "power-tools",
      categoryName: "Power Tools",
      inStock: true,
      description: "Professional grade drill with variable speed control"
    },
    {
      id: 2,
      name: "Stanley Hammer Set",
      price: 3500,
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      category: "hand-tools",
      categoryName: "Hand Tools",
      inStock: true,
      description: "Complete hammer set with various sizes"
    },
    {
      id: 3,
      name: "PVC Pipes 4-inch",
      price: 1200,
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      category: "plumbing",
      categoryName: "Plumbing",
      inStock: true,
      description: "High-quality PVC pipes for plumbing"
    },
    {
      id: 4,
      name: "LED Light Bulbs Pack",
      price: 2800,
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      category: "electrical",
      categoryName: "Electrical",
      inStock: true,
      description: "Energy-efficient LED bulbs pack"
    },
    {
      id: 5,
      name: "Dewalt Circular Saw",
      price: 45000,
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      category: "power-tools",
      categoryName: "Power Tools",
      inStock: true,
      description: "Professional circular saw with safety features"
    },
    {
      id: 6,
      name: "Paint Brushes Set",
      price: 1500,
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      category: "paint",
      categoryName: "Paint & Supplies",
      inStock: true,
      description: "Professional paint brushes for all surfaces"
    },
    {
      id: 7,
      name: "Makita Angle Grinder",
      price: 32000,
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      category: "power-tools",
      categoryName: "Power Tools",
      inStock: false,
      description: "Heavy-duty angle grinder for metal work"
    },
    {
      id: 8,
      name: "Copper Wire 2.5mm",
      price: 8500,
      image: "https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop",
      category: "electrical",
      categoryName: "Electrical",
      inStock: true,
      description: "High-quality copper wire for electrical work"
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'power-tools', label: 'Power Tools' },
    { value: 'hand-tools', label: 'Hand Tools' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'paint', label: 'Paint & Supplies' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const filterProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
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

  const addToCart = (product) => {
    console.log('Added to cart:', product);
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
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="price-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
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
                  <img src={product.image} alt={product.name} />
                  {!product.inStock && (
                    <div className="out-of-stock">Out of Stock</div>
                  )}
                </div>

                <div className="product-info">
                  <span className="category-badge">{product.categoryName}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>

                  <div className="product-price">
                    <span className="current-price">{formatPrice(product.price)}</span>
                  </div>

                  <div className="product-actions">
                    <Link to={`/product/${product.id}`} className="btn btn-outline">
                      <FaEye /> View Details
                    </Link>
                    <button
                      className="btn btn-primary"
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
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
