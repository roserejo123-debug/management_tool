import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { deleteProperty, fetchMyProperties } from '../../redux/slices/propertySlice';

const MyPropertiesPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { myProperties, loading, actionLoading, error } = useSelector((state) => state.properties);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    dispatch(fetchMyProperties({ limit: 100 }));
  }, [dispatch]);

  const removeProperty = async (property) => {
    if (!window.confirm(`Delete "${property.title}"? This cannot be undone.`)) return;
    setPageError('');
    try {
      await dispatch(deleteProperty(property._id)).unwrap();
    } catch (deleteError) {
      setPageError(deleteError || 'Unable to delete this listing.');
    }
  };

  return (
    <main className="property-page">
      <header className="property-page-header property-manage-header">
        <div>
          <p className="property-eyebrow">Agent workspace</p>
          <h1>My properties</h1>
          <p>Manage your listings, photos, and property details.</p>
        </div>
        <Link to="/properties/new" className="btn btn-primary"><FiPlus /> Add Property</Link>
      </header>

      {location.state?.message && <div className="alert alert-success" role="status">{location.state.message}</div>}
      {(pageError || error) && <div className="alert alert-error" role="alert">{pageError || error}</div>}

      {loading ? (
        <div className="property-page-loading"><span className="spinner" /></div>
      ) : myProperties.length === 0 ? (
        <section className="property-empty-state card">
          <div className="property-empty-icon">🏠</div>
          <h2>No listings yet</h2>
          <p>Create a listing to make your property visible to buyers and renters.</p>
          <Link to="/properties/new" className="btn btn-primary"><FiPlus /> Create your first listing</Link>
        </section>
      ) : (
        <div className="my-property-list">
          {myProperties.map((property) => (
            <article className="my-property-card card" key={property._id}>
              <div className="my-property-image">
                {property.images?.[0]?.url
                  ? <img src={property.images[0].url} alt={property.title} />
                  : <span>🏡</span>}
              </div>
              <div className="my-property-content">
                <div className="my-property-title-row">
                  <h2>{property.title}</h2>
                  <span className={`property-status property-status-${property.isApproved ? property.status : 'pending'}`}>
                    {property.isApproved ? property.status : property.status === 'rejected' ? 'rejected' : 'awaiting approval'}
                  </span>
                </div>
                <p>{property.location?.city}, {property.location?.state} · {property.type}</p>
                <div className="my-property-details">
                  <strong>₹{Number(property.price).toLocaleString('en-IN')}</strong>
                  <span>{property.area} {property.areaUnit}</span>
                  <span>For {property.listingType}</span>
                </div>
                <div className="my-property-actions">
                  {property.isApproved && (
                    <Link to={`/properties/${property._id}`} className="btn btn-sm btn-outline">View listing</Link>
                  )}
                  <Link to={`/properties/${property._id}/edit`} className="btn btn-sm btn-outline"><FiEdit2 /> Edit</Link>
                  <button className="btn btn-sm btn-danger" disabled={actionLoading} onClick={() => removeProperty(property)}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyPropertiesPage;
