import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiEye, FiX } from 'react-icons/fi';
import API from '../../utils/axiosInstance';

const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 100 };
      if (filter === 'pending') {
        params.isApproved = false;
        params.status = 'pending';
      } else if (filter === 'approved') {
        params.isApproved = true;
      } else if (filter === 'rejected') {
        params.isApproved = false;
        params.status = 'rejected';
      }
      const { data } = await API.get('/properties/admin/all', { params });
      setProperties(data.properties);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load property listings.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const controller = new AbortController();
    const params = { page: 1, limit: 100 };
    if (filter === 'pending') {
      params.isApproved = false;
      params.status = 'pending';
    } else if (filter === 'approved') {
      params.isApproved = true;
    } else if (filter === 'rejected') {
      params.isApproved = false;
      params.status = 'rejected';
    }
    API.get('/properties/admin/all', { params, signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setProperties(data.properties);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError.response?.data?.message || 'Unable to load property listings.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filter]);

  const moderate = async (propertyId, isApproved) => {
    setActionId(propertyId);
    setError('');
    setMessage('');
    try {
      const { data } = await API.put(`/properties/${propertyId}/approve`, { isApproved });
      setMessage(data.message);
      await loadProperties();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update listing approval.');
    } finally {
      setActionId('');
    }
  };

  return (
    <main className="property-page">
      <header className="property-page-header">
        <p className="property-eyebrow">Administration</p>
        <h1>Property moderation</h1>
        <p>Review agent submissions before they appear in public search.</p>
      </header>
      <div className="admin-property-toolbar">
        <label className="form-group">
          <span className="form-label">Listing status</span>
          <select className="form-input" value={filter} onChange={(event) => { setLoading(true); setError(''); setFilter(event.target.value); }}>
            <option value="pending">Awaiting review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All listings</option>
          </select>
        </label>
        <Link className="btn btn-outline" to="/admin/analytics">View analytics &amp; reports</Link>
      </div>
      {message && <div className="alert alert-success" role="status">{message}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {loading ? (
        <div className="property-page-loading"><span className="spinner" /></div>
      ) : properties.length ? (
        <div className="admin-property-list">
          {properties.map((property) => (
            <article className="my-property-card card" key={property._id}>
              <div className="my-property-image">
                {property.images?.[0]?.url
                  ? <img src={property.images[0].url} alt={property.title} />
                  : <span>🏠</span>}
              </div>
              <div className="my-property-content">
                <div className="my-property-title-row">
                  <h2>{property.title}</h2>
                  <span className={`property-status property-status-${property.isApproved ? property.status : property.status === 'rejected' ? 'rejected' : 'pending'}`}>
                    {property.isApproved ? 'approved' : property.status === 'rejected' ? 'rejected' : 'awaiting approval'}
                  </span>
                </div>
                <p>{property.location?.address}, {property.location?.city}, {property.location?.state}</p>
                <p>Agent: {property.agent?.name || 'Unknown'} {property.agent?.email ? `(${property.agent.email})` : ''}</p>
                <div className="my-property-details">
                  <strong>₹{Number(property.price).toLocaleString('en-IN')}</strong>
                  <span>{property.area} {property.areaUnit}</span>
                  <span>{property.type} · {property.listingType}</span>
                </div>
                <div className="my-property-actions">
                  {property.isApproved && <Link to={`/properties/${property._id}`} className="btn btn-sm btn-outline"><FiEye /> View listing</Link>}
                  {!property.isApproved && property.status !== 'rejected' && (
                    <>
                      <button className="btn btn-sm btn-primary" disabled={actionId === property._id} onClick={() => moderate(property._id, true)}>
                        <FiCheck /> Approve
                      </button>
                      <button className="btn btn-sm btn-danger" disabled={actionId === property._id} onClick={() => moderate(property._id, false)}>
                        <FiX /> Reject
                      </button>
                    </>
                  )}
                  {!property.isApproved && property.status === 'rejected' && (
                    <button className="btn btn-sm btn-primary" disabled={actionId === property._id} onClick={() => moderate(property._id, true)}>
                      <FiCheck /> Approve
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="property-empty-state card">
          <h2>No listings in this view</h2>
          <p>There are no property submissions matching this filter.</p>
        </section>
      )}
    </main>
  );
};

export default AdminPropertiesPage;
