import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties, fetchCities } from '../../redux/slices/propertySlice';
import { addWishlistProperty, fetchWishlist, removeWishlistProperty } from '../../redux/slices/interactionSlice';
import PropertyCard from '../../components/property/PropertyCard';
import { FiSearch, FiX, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiSliders } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const PROPERTY_TYPES = ['apartment', 'villa', 'house', 'plot', 'commercial', 'pg'];

const PropertiesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { properties, loading, total, totalPages, cities } = useSelector((s) => s.properties);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { wishlist, error: interactionError } = useSelector((s) => s.interactions);

  const [filters, setFilters] = useState({
    search: '', type: '', listingType: '', city: '',
    minPrice: '', maxPrice: '', minArea: '', maxArea: '',
    bedrooms: '', bathrooms: '', sort: '-createdAt',
  });
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [showFilters, setShowFilters] = useState(false);
  const [applied, setApplied] = useState({});

  useEffect(() => { dispatch(fetchCities()); }, [dispatch]);
  useEffect(() => {
    if (isAuthenticated) dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated]);

  const toggleWishlist = (propertyId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const saved = wishlist.some((property) => property._id === propertyId);
    dispatch(saved ? removeWishlistProperty(propertyId) : addWishlistProperty(propertyId));
  };

  const doFetch = useCallback(() => {
    const params = { page, limit: 9, ...applied };
    Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
    dispatch(fetchProperties(params));
  }, [dispatch, page, applied]);

  useEffect(() => { doFetch(); }, [doFetch]);

  const handleFilterChange = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const applyFilters = () => { setApplied({ ...filters }); setPage(1); setShowFilters(false); };
  const clearFilters = () => { const reset = { search: '', type: '', listingType: '', city: '', minPrice: '', maxPrice: '', minArea: '', maxArea: '', bedrooms: '', bathrooms: '', sort: '-createdAt' }; setFilters(reset); setApplied({}); setPage(1); };

  const hasActiveFilters = Object.entries(applied).some(([k, v]) => v && k !== 'sort');

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">🏠 Explore Properties</h1>
        <p className="page-subtitle">{total} properties found{applied.city ? ` in ${applied.city}` : ''}</p>
      </div>
      {interactionError && <div className="alert alert-error" role="alert">{interactionError}</div>}

      {/* Search + Controls Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
          <input
            className="form-input"
            placeholder="Search by location, title..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            style={{ paddingLeft: 40 }}
          />
        </div>

        {/* Quick filter chips */}
        <select className="form-input" value={filters.listingType} onChange={(e) => { handleFilterChange('listingType', e.target.value); setApplied((a) => ({ ...a, listingType: e.target.value })); setPage(1); }} style={{ width: 130 }}>
          <option value="">All Types</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>

        <select className="form-input" value={filters.city} onChange={(e) => { handleFilterChange('city', e.target.value); setApplied((a) => ({ ...a, city: e.target.value })); setPage(1); }} style={{ width: 150 }}>
          <option value="">All Cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="form-input" value={filters.sort} onChange={(e) => { handleFilterChange('sort', e.target.value); setApplied((a) => ({ ...a, sort: e.target.value })); setPage(1); }} style={{ width: 160 }}>
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-views">Most Viewed</option>
        </select>

        <button className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-outline'}`} onClick={() => setShowFilters(!showFilters)}>
          <FiSliders /> Filters {hasActiveFilters && <span style={{ background: 'var(--secondary)', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>!</span>}
        </button>

        {hasActiveFilters && (
          <button className="btn btn-sm" style={{ background: 'rgba(255,68,68,0.1)', color: '#ff6b6b', border: 'none' }} onClick={clearFilters}>
            <FiX /> Clear
          </button>
        )}

        {/* View toggle */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '3px' }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? 'var(--primary)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
            <FiGrid />
          </button>
          <button onClick={() => setViewMode('list')} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: viewMode === 'list' ? 'var(--primary)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
            <FiList />
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="card" style={{ marginBottom: '20px', padding: '24px', animation: 'slideUp 0.3s ease' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1rem' }}>🔍 Advanced Filters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Property Type</label>
              <select className="form-input" value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Min Price (₹)</label>
              <input className="form-input" type="number" placeholder="e.g. 500000" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Price (₹)</label>
              <input className="form-input" type="number" placeholder="e.g. 5000000" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Min Area</label>
              <input className="form-input" type="number" min="0" placeholder="e.g. 500" value={filters.minArea} onChange={(e) => handleFilterChange('minArea', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Area</label>
              <input className="form-input" type="number" min="0" placeholder="e.g. 2000" value={filters.maxArea} onChange={(e) => handleFilterChange('maxArea', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Min Bedrooms</label>
              <select className="form-input" value={filters.bedrooms} onChange={(e) => handleFilterChange('bedrooms', e.target.value)}>
                <option value="">Any</option>
                {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}+ BHK</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Min Bathrooms</label>
              <select className="form-input" value={filters.bathrooms} onChange={(e) => handleFilterChange('bathrooms', e.target.value)}>
                <option value="">Any</option>
                {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary btn-sm" onClick={applyFilters}>Apply Filters</button>
            <button className="btn btn-sm" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }} onClick={() => setShowFilters(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Property Grid / List */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr', gap: 24 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="property-card-skeleton" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🏚️</div>
          <h3 style={{ marginBottom: 8 }}>No properties found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters or search terms</p>
          <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={clearFilters}>Clear All Filters</button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'property-grid' : 'property-list'}>
          {properties.map((p) => (
            <PropertyCard
              key={p._id}
              property={p}
              onWishlist={toggleWishlist}
              isWishlisted={wishlist.some((item) => item._id === p._id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48 }}>
          <button
            className="btn btn-sm btn-outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <FiChevronLeft /> Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              style={{
                width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
                background: page === i + 1 ? 'var(--primary)' : 'var(--bg-card)',
                color: page === i + 1 ? 'white' : 'var(--text-secondary)',
                border: page === i + 1 ? 'none' : '1px solid var(--border)',
                fontWeight: page === i + 1 ? 700 : 400, transition: 'all 0.2s',
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-sm btn-outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
