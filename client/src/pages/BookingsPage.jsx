import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiCalendar } from 'react-icons/fi';
import { fetchBookings, updateBookingStatus } from '../redux/slices/interactionSlice';

const formatDate = (date) => new Date(date).toLocaleString(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const BookingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { bookings, loading, actionLoading, error } = useSelector((state) => state.interactions);
  const [actionError, setActionError] = useState('');
  const isAgent = user?.role === 'agent' || user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const updateStatus = async (bookingId, status) => {
    setActionError('');
    try {
      const result = await dispatch(updateBookingStatus({ id: bookingId, status })).unwrap();
      if (status === 'confirmed' && !result.notificationSent) {
        setActionError('Visit confirmed, but the confirmation email could not be sent. Check the server email settings.');
      }
    } catch (updateError) {
      setActionError(updateError || 'Unable to update this visit.');
    }
  };

  return (
    <main className="property-page">
      <header className="property-page-header">
        <p className="property-eyebrow">{isAgent ? 'Agent workspace' : 'Your property visits'}</p>
        <h1>{isAgent ? 'Visit requests' : 'My bookings'}</h1>
        <p>{isAgent ? 'Review requests and update the visit status.' : 'Manage upcoming property visits.'}</p>
      </header>
      {(actionError || error) && <div className="alert alert-error" role="alert">{actionError || error}</div>}
      {loading ? (
        <div className="property-page-loading"><span className="spinner" /></div>
      ) : bookings.length ? (
        <div className="booking-list">
          {bookings.map((booking) => (
            <article className="booking-card card" key={booking._id}>
              <div className="booking-card-main">
                {booking.property?.images?.[0]?.url
                  ? <img className="booking-image" src={booking.property.images[0].url} alt={booking.property.title} />
                  : <div className="booking-image booking-image-placeholder">🏠</div>}
                <div className="booking-details">
                  {booking.property ? (
                    <Link to={`/properties/${booking.property._id}`} className="booking-property-title">{booking.property.title}</Link>
                  ) : <strong>Property unavailable</strong>}
                  <p><FiCalendar /> {formatDate(booking.scheduledAt)}</p>
                  <p>{isAgent ? `Requested by ${booking.customer?.name || 'Buyer'} (${booking.customer?.email || ''})` : `Agent: ${booking.agent?.name || 'Agent'}`}</p>
                  {booking.message && <p className="booking-message">{booking.message}</p>}
                </div>
                <span className={`property-status property-status-${booking.status}`}>{booking.status}</span>
              </div>
              <div className="booking-actions">
                {isAgent && booking.status === 'pending' && (
                  <>
                    <button className="btn btn-sm btn-primary" disabled={actionLoading} onClick={() => updateStatus(booking._id, 'confirmed')}>Confirm visit</button>
                    <button className="btn btn-sm btn-danger" disabled={actionLoading} onClick={() => updateStatus(booking._id, 'rejected')}>Decline</button>
                  </>
                )}
                {isAgent && booking.status === 'confirmed' && (
                  <button className="btn btn-sm btn-outline" disabled={actionLoading} onClick={() => updateStatus(booking._id, 'visited')}>Mark visited</button>
                )}
                {!isAgent && ['pending', 'confirmed'].includes(booking.status) && (
                  <button className="btn btn-sm btn-danger" disabled={actionLoading} onClick={() => updateStatus(booking._id, 'cancelled')}>Cancel visit</button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="property-empty-state card">
          <div className="property-empty-icon">📅</div>
          <h2>No visit requests yet</h2>
          <p>{isAgent ? 'New visit requests for your properties will appear here.' : 'Request a property visit from a listing detail page.'}</p>
          {!isAgent && <Link to="/properties" className="btn btn-primary">Browse properties</Link>}
        </section>
      )}
    </main>
  );
};

export default BookingsPage;
