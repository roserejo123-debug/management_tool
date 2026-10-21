import { Link } from 'react-router-dom';
import { FiHome, FiDroplet, FiMaximize, FiMapPin, FiEye, FiHeart } from 'react-icons/fi';

const typeIcons = {
  apartment: '🏢',
  villa: '🏡',
  house: '🏠',
  plot: '🌿',
  commercial: '🏪',
  pg: '🛏️',
};

const formatPrice = (price) => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

const PropertyCard = ({ property, onWishlist, isWishlisted }) => {
  const {
    _id, title, type, listingType, price, area, areaUnit,
    bedrooms, bathrooms, location, images, status, views, agent,
  } = property;

  const mainImage = images?.[0]?.url || null;
  const price_display = formatPrice(price);

  return (
    <div className="property-card">
      {/* Image */}
      <div className="property-card-img">
        {mainImage ? (
          <img src={mainImage} alt={title} loading="lazy" />
        ) : (
          <div className="property-card-img-placeholder">
            <span style={{ fontSize: '3rem' }}>{typeIcons[type] || '🏠'}</span>
          </div>
        )}

        {/* Badges */}
        <div className="property-card-badges">
          <span className={`prop-badge ${listingType === 'rent' ? 'badge-rent' : 'badge-sale'}`}>
            For {listingType === 'rent' ? 'Rent' : 'Sale'}
          </span>
          {status === 'sold' && <span className="prop-badge badge-sold">Sold</span>}
          {status === 'rented' && <span className="prop-badge badge-sold">Rented</span>}
        </div>

        {/* Type icon */}
        <div className="property-card-type">{typeIcons[type] || '🏠'} {type}</div>

        {/* Wishlist */}
        {onWishlist && (
          <button
            className={`property-wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
            onClick={(e) => { e.preventDefault(); onWishlist(_id); }}
            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <FiHeart />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="property-card-body">
        <div className="property-price">{price_display}
          {listingType === 'rent' && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/mo</span>}
        </div>

        <h3 className="property-title" title={title}>{title}</h3>

        <div className="property-location">
          <FiMapPin size={12} />
          <span>{location?.city}, {location?.state}</span>
        </div>

        <div className="property-meta">
          {bedrooms > 0 && (
            <span className="property-meta-item">
              <FiHome size={14} /> {bedrooms} BHK
            </span>
          )}
          {bathrooms > 0 && (
            <span className="property-meta-item">
              <FiDroplet size={14} /> {bathrooms} Bath
            </span>
          )}
          <span className="property-meta-item">
            <FiMaximize size={14} /> {area} {areaUnit}
          </span>
        </div>

        <div className="property-card-footer">
          <div className="property-agent">
            <div className="property-agent-avatar">
              {agent?.avatar?.url
                ? <img src={agent.avatar.url} alt={agent.name} />
                : agent?.name?.charAt(0).toUpperCase()
              }
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{agent?.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            <FiEye size={12} /> {views || 0}
          </div>
        </div>

        <Link to={`/properties/${_id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '10px' }}>
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
