import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiMail, FiPhone } from 'react-icons/fi';
import { fetchEnquiries } from '../redux/slices/interactionSlice';

const EnquiriesPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { enquiries, loading, error } = useSelector((state) => state.interactions);
  const isAgent = user?.role === 'agent' || user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchEnquiries());
  }, [dispatch]);

  return (
    <main className="property-page">
      <header className="property-page-header">
        <p className="property-eyebrow">{isAgent ? 'Agent workspace' : 'Your messages'}</p>
        <h1>{isAgent ? 'Property enquiries' : 'My enquiries'}</h1>
        <p>{isAgent ? 'Messages from people interested in your listings.' : 'A record of messages you sent to agents.'}</p>
      </header>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {loading ? (
        <div className="property-page-loading"><span className="spinner" /></div>
      ) : enquiries.length ? (
        <div className="enquiry-list">
          {enquiries.map((enquiry) => (
            <article className="enquiry-card card" key={enquiry._id}>
              <div className="enquiry-header">
                <div>
                  {enquiry.property ? (
                    <Link to={`/properties/${enquiry.property._id}`} className="booking-property-title">{enquiry.property.title}</Link>
                  ) : <strong>Property unavailable</strong>}
                  <p>{new Date(enquiry.createdAt).toLocaleString()}</p>
                </div>
                <strong>{isAgent ? enquiry.name : enquiry.property?.location?.city}</strong>
              </div>
              <p className="enquiry-message">{enquiry.message}</p>
              <div className="enquiry-contact">
                <a href={`mailto:${enquiry.email}`}><FiMail /> {enquiry.email}</a>
                {enquiry.phone && <a href={`tel:${enquiry.phone}`}><FiPhone /> {enquiry.phone}</a>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="property-empty-state card">
          <div className="property-empty-icon">💬</div>
          <h2>No enquiries yet</h2>
          <p>{isAgent ? 'Messages about your listings will appear here.' : 'Contact an agent from a property page to start a conversation.'}</p>
          {!isAgent && <Link to="/properties" className="btn btn-primary">Explore properties</Link>}
        </section>
      )}
    </main>
  );
};

export default EnquiriesPage;
