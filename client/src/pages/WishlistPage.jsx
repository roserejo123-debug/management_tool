import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import PropertyCard from '../components/property/PropertyCard';
import { fetchWishlist, removeWishlistProperty } from '../redux/slices/interactionSlice';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { wishlist, loading, error } = useSelector((state) => state.interactions);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const toggleWishlist = (propertyId) => {
    dispatch(removeWishlistProperty(propertyId));
  };

  return (
    <main className="property-page">
      <header className="property-page-header">
        <p className="property-eyebrow">Your saved homes</p>
        <h1>My wishlist</h1>
        <p>Properties you saved for later.</p>
      </header>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {loading ? (
        <div className="property-page-loading"><span className="spinner" /></div>
      ) : wishlist.length ? (
        <div className="property-grid">
          {wishlist.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onWishlist={toggleWishlist}
              isWishlisted
            />
          ))}
        </div>
      ) : (
        <section className="property-empty-state card">
          <div className="property-empty-icon"><FiHeart /></div>
          <h2>Your wishlist is empty</h2>
          <p>Save properties while browsing and they will appear here.</p>
          <Link to="/properties" className="btn btn-primary">Explore properties</Link>
        </section>
      )}
    </main>
  );
};

export default WishlistPage;
