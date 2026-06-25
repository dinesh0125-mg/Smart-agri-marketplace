import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/Products/ProductCard';
import { useProducts } from '../../context/ProductsContext';
import { categories } from '../../data';
import './Shop.css';

const ITEMS_PER_PAGE = 8;

export default function Shop() {
  const { products } = useProducts();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialQuery    = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange,  setPriceRange]  = useState([0, 1000]);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [minRating,   setMinRating]   = useState(0);
  const [sortBy,      setSortBy]      = useState('featured');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [page,        setPage]        = useState(1);

  const filtered = useMemo(() => {
    let result = [...products];
    if (searchQuery)
      result = result.filter(p =>
        (p.productName ?? p.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.farmerName ?? p.farmer ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    if (selectedCategory !== 'All')
      result = result.filter(p =>
        (p.categoryName ?? p.category ?? '').includes(selectedCategory) ||
        (p.productName ?? p.name ?? '').includes(selectedCategory)
      );
    result = result.filter(p => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]);
    if (organicOnly) result = result.filter(p => p.organicCertified ?? p.organic);
    if (minRating > 0) result = result.filter(p => (p.averageRating ?? p.rating ?? 0) >= minRating);
    if (sortBy === 'price-asc')  result.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === 'price-desc') result.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortBy === 'rating')     result.sort((a, b) => (b.averageRating ?? b.rating ?? 0) - (a.averageRating ?? a.rating ?? 0));
    return result;
  }, [products, searchQuery, selectedCategory, priceRange, organicOnly, minRating, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, 1000]);
    setOrganicOnly(false);
    setMinRating(0);
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="shop-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link> <span>/</span> <span>Shop</span>
          </nav>
        </div>
      </div>

      <div className="container shop-layout">
        {/* ── Sidebar ── */}
        <aside className="shop-sidebar">
          <h3 className="sidebar-title"> Filters</h3>

          <div className="filter-group">
            <label className="filter-label">Search</label>
            <input
              type="text"
              className="filter-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Category</label>
            <div className="cat-filter-list">
              {['All', ...categories.map(c => c.name)].map(cat => (
                <button
                  key={cat}
                  className={`cat-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => { setSelectedCategory(cat); setPage(1); }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Price Range: ₹0 – ₹{priceRange[1]}</label>
            <input
              type="range" min="0" max="1000" step="10"
              value={priceRange[1]}
              onChange={e => { setPriceRange([0, +e.target.value]); setPage(1); }}
              className="range-slider"
            />
          </div>

          <div className="filter-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={organicOnly}
                onChange={e => setOrganicOnly(e.target.checked)} />
              <span>Organic Products Only</span>
            </label>
          </div>

          <div className="filter-group">
            <label className="filter-label">Minimum Rating</label>
            {[4.5, 4, 3.5, 3].map(r => (
              <label key={r} className="checkbox-label">
                <input type="radio" name="rating" checked={minRating === r}
                  onChange={() => { setMinRating(r); setPage(1); }} />
                <span>{''.repeat(Math.floor(r))} {r}+ above</span>
              </label>
            ))}
            <label className="checkbox-label">
              <input type="radio" name="rating" checked={minRating === 0}
                onChange={() => setMinRating(0)} />
              <span>All Ratings</span>
            </label>
          </div>

          <button className="clear-filters-btn" onClick={resetFilters}>
             Clear All Filters
          </button>
        </aside>

        {/* ── Main ── */}
        <div className="shop-main">
          <div className="shop-top-bar">
            <div>
              <h2 className="shop-title">All Products</h2>
              <p className="shop-count">
                Showing {paginated.length} of {filtered.length} products
              </p>
            </div>
            <div className="sort-wrap">
              <label>Sort by:</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="sort-select">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {paginated.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon"></div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="shop-grid">
              {paginated.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p}
                  className={`page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}>›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
