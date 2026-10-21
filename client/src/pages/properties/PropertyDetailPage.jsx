import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPropertyById, clearSelectedProperty } from '../../redux/slices/propertySlice';
import {
  FiMapPin, FiEye, FiPhone,
  FiMail, FiArrowLeft, FiShare2, FiHeart, FiCalendar,
} from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  addWishlistProperty, createBooking, createEnquiry, createPropertyReview,
  fetchBookings, fetchPropertyReviews, fetchWishlist, removeWishlistProperty,
} from '../../redux/slices/interactionSlice';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const amenityLabels = {
  parking: '🚗 Parking', gym: '💪 Gym', swimming_pool: '🏊 Pool',
  security: '🔒 Security', lift: '🛗 Lift', power_backup: '⚡ Power Backup',
  garden: '🌳 Garden', clubhouse: '🏛️ Clubhouse', wifi: '📶 WiFi',
  ac: '❄️ AC', furnished: '🛋️ Furnished', semi_furnished: '🪑 Semi-Furnished',
  pet_friendly: '🐾 Pet Friendly', balcony: '🏗️ Balcony',
};

const formatPrice = (price) => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProperty: property, loading } = useSelector((s) => s.properties);
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const {
    wishlist, bookings, propertyReviews, reviewSummary, reviewsPropertyId,
    actionLoading, error: interactionError,
  } = useSelector((s) => s.interactions);
  const [activeImg, setActiveImg] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [interactionMessage, setInteractionMessage] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [earliestVisitTime] = useState(
    () => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    dispatch(fetchPropertyById(id));
    return () => dispatch(clearSelectedProperty());
  }, [id, dispatch]);

  useEffect(() => {
    dispatch(fetchPropertyReviews(id));
    if (user?.role === 'user') dispatch(fetchBookings());
  }, [dispatch, id, user?.role]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
    </div>
  );

  if (!property) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <h2>Property not found</h2>
      <Link to="/properties" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Listings</Link>
    </div>
  );

  const hasCoords = Number.isFinite(property.location?.coordinates?.lat)
    && Number.isFinite(property.location?.coordinates?.lng);
  const coords = [property.location.coordinates.lat, property.location.coordinates.lng];
  const isOwner = property.agent?._id === user?._id;
  const isWishlisted = wishlist.some((item) => item._id === property._id);
  const reviewsAreCurrent = reviewsPropertyId === property._id;
  const propertyReviewsList = reviewsAreCurrent ? propertyReviews : [];
  const hasVisited = bookings.some((booking) =>
    booking.property?._id === property._id && booking.status === 'visited'
  );
  const alreadyReviewed = propertyReviewsList.some((review) => review.user?._id === user?._id);

  const toggleWishlist = async () => {
    if (!isAuthenticated) return navigate('/login');
    setInteractionMessage('');
    try {
      await dispatch(isWishlisted
        ? removeWishlistProperty(property._id)
        : addWishlistProperty(property._id)).unwrap();
    } catch {
      // The Redux error is rendered with the interaction controls.
    }
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setInteractionMessage('');
    try {
      await dispatch(createBooking({
        propertyId: property._id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        message: bookingMessage,
      })).unwrap();
      setInteractionMessage('Visit request sent. You can track it from My Bookings.');
      setBookingOpen(false);
      setScheduledAt('');
      setBookingMessage('');
    } catch {
      // The Redux error is rendered with the interaction controls.
    }
  };

  const submitEnquiry = async (event) => {
    event.preventDefault();
    setInteractionMessage('');
    try {
      await dispatch(createEnquiry({ propertyId: property._id, message: enquiryMessage })).unwrap();
      setInteractionMessage('Your enquiry was sent to the agent.');
      setEnquiryOpen(false);
      setEnquiryMessage('');
    } catch {
      // The Redux error is rendered with the interaction controls.
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setInteractionMessage('');
    try {
      await dispatch(createPropertyReview({
        propertyId: property._id,
        rating: Number(reviewRating),
        comment: reviewComment,
      })).unwrap();
      setReviewComment('');
      setInteractionMessage('Your review has been published.');
    } catch {
      // The Redux error is rendered with the interaction controls.
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Back */}
      <button className="btn btn-sm btn-outline" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>

      {/* Image Gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 32 }}>
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', aspectRatio: '16/9', background: 'var(--bg-card)', position: 'relative' }}>
          {property.images?.length > 0 ? (
            <img src={property.images[activeImg]?.url} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '5rem' }}>🏠</div>
          )}
          <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 8 }}>
            <button className="btn btn-sm glass" style={{ padding: '8px 12px' }}><FiShare2 /></button>
            <button className="btn btn-sm glass" style={{ padding: '8px 12px' }}><FiHeart /></button>
          </div>
          {property.images?.length > 1 && (
            <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '4px 10px', fontSize: '0.8rem' }}>
              {activeImg + 1} / {property.images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {property.images?.length > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 380 }}>
            {property.images.map((img, i) => (
              <div key={i} onClick={() => setActiveImg(i)} style={{
                borderRadius: 10, overflow: 'hidden', cursor: 'pointer', aspectRatio: '16/9',
                border: activeImg === i ? '2px solid var(--primary)' : '2px solid transparent',
                opacity: activeImg === i ? 1 : 0.7, transition: 'all 0.2s', flexShrink: 0,
              }}>
                <img src={img.url} alt={`img-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
        {/* Left */}
        <div>
          {/* Title & Price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span className={`prop-badge ${property.listingType === 'rent' ? 'badge-rent' : 'badge-sale'}`}>
                  For {property.listingType === 'rent' ? 'Rent' : 'Sale'}
                </span>
                <span className="prop-badge" style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--primary)' }}>
                  {property.type}
                </span>
              </div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>{property.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                <FiMapPin size={14} />
                <span>{property.location?.address}, {property.location?.city}, {property.location?.state}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit,sans-serif', color: 'var(--primary)' }}>
                {formatPrice(property.price)}
              </div>
              {property.listingType === 'rent' && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>per month</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 4 }}>
                <FiEye size={12} /> {property.views} views
              </div>
            </div>
          </div>

          {/* Specs */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: 28 }}>
            {property.bedrooms > 0 && (
              <div style={{ textAlign: 'center', padding: '0 16px', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🛏️</div>
                <div style={{ fontWeight: 700 }}>{property.bedrooms}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bedrooms</div>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div style={{ textAlign: 'center', padding: '0 16px', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🛁</div>
                <div style={{ fontWeight: 700 }}>{property.bathrooms}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bathrooms</div>
              </div>
            )}
            <div style={{ textAlign: 'center', padding: '0 16px', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>📐</div>
              <div style={{ fontWeight: 700 }}>{property.area} {property.areaUnit}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Area</div>
            </div>
            {property.floors > 0 && (
              <div style={{ textAlign: 'center', padding: '0 16px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🏢</div>
                <div style={{ fontWeight: 700 }}>{property.floors}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Floors</div>
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 12 }}>About this Property</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{property.description}</p>
          </div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>✨ Amenities</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {property.amenities.map((a) => (
                  <span key={a} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 20,
                    background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)',
                    fontSize: '0.85rem', color: 'var(--text-primary)',
                  }}>
                    {amenityLabels[a] || a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <section className="property-reviews">
            <div className="property-reviews-header">
              <div>
                <h2>Buyer reviews</h2>
                <p>
                  {reviewsAreCurrent && reviewSummary.reviewCount
                    ? `★ ${reviewSummary.averageRating} · ${reviewSummary.reviewCount} ${reviewSummary.reviewCount === 1 ? 'review' : 'reviews'}`
                    : 'No reviews yet'}
                </p>
              </div>
            </div>
            {user?.role === 'user' && hasVisited && !alreadyReviewed && (
              <form className="review-form card" onSubmit={submitReview}>
                <h3>Share your experience</h3>
                <div className="property-form-grid">
                  <label className="form-group">
                    <span className="form-label">Rating</span>
                    <select className="form-input" value={reviewRating} onChange={(event) => setReviewRating(event.target.value)}>
                      {[5, 4, 3, 2, 1].map((rating) => <option value={rating} key={rating}>{rating} out of 5 stars</option>)}
                    </select>
                  </label>
                  <label className="form-group property-form-span">
                    <span className="form-label">Review</span>
                    <textarea className="form-input" required maxLength="1000" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} />
                  </label>
                </div>
                <button className="btn btn-primary btn-sm" disabled={actionLoading}>Submit Review</button>
              </form>
            )}
            {user?.role === 'user' && alreadyReviewed && <p className="review-hint">You have already reviewed this property.</p>}
            {user?.role === 'user' && !hasVisited && <p className="review-hint">Reviews are available to buyers after a visit is marked completed.</p>}
            {propertyReviewsList.length > 0 ? (
              <div className="review-list">
                {propertyReviewsList.map((review) => (
                  <article className="review-card card" key={review._id}>
                    <div className="review-card-heading">
                      <strong>{review.user?.name || 'Buyer'}</strong>
                      <span className="review-rating" aria-label={`${review.rating} out of 5 stars`}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                      <time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString()}</time>
                    </div>
                    <p>{review.comment}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          {/* Map */}
          {hasCoords && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>📍 Location on Map</h2>
              <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', height: 340, border: '1px solid var(--border)' }}>
                <MapContainer center={coords} zoom={14} style={{ width: '100%', height: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={coords}>
                    <Popup>{property.title}<br />{property.location.address}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right — Agent Card */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 88 }}>
            <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>🏢 Listed by</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.3rem', color: 'white', overflow: 'hidden', flexShrink: 0 }}>
                {property.agent?.avatar?.url ? <img src={property.agent.avatar.url} alt={property.agent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : property.agent?.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{property.agent?.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Real Estate Agent</div>
                {property.agent?.bio && <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 4 }}>{property.agent.bio}</div>}
              </div>
            </div>

            {property.agent?.phone && (
              <a href={`tel:${property.agent.phone}`} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
                <FiPhone /> {property.agent.phone}
              </a>
            )}
            <a href={`mailto:${property.agent?.email}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
              <FiMail /> Email Agent
            </a>
            {interactionMessage && <div className="alert alert-success" role="status">{interactionMessage}</div>}
            {interactionError && <div className="alert alert-error" role="alert">{interactionError}</div>}
            {user?.role === 'user' && !isOwner && (
              <>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={toggleWishlist}
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}
                >
                  <FiHeart /> {isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => isAuthenticated ? setBookingOpen(!bookingOpen) : navigate('/login')}
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}
                >
                  <FiCalendar /> Request a Visit
                </button>
                {bookingOpen && (
                  <form className="interaction-form" onSubmit={submitBooking}>
                    <label className="form-group">
                      <span className="form-label">Preferred date and time</span>
                      <input
                        className="form-input"
                        type="datetime-local"
                        required
                        min={earliestVisitTime}
                        value={scheduledAt}
                        onChange={(event) => setScheduledAt(event.target.value)}
                      />
                    </label>
                    <label className="form-group">
                      <span className="form-label">Message (optional)</span>
                      <textarea className="form-input" maxLength="1000" value={bookingMessage} onChange={(event) => setBookingMessage(event.target.value)} />
                    </label>
                    <button className="btn btn-primary btn-sm" type="submit" disabled={actionLoading}>
                      {actionLoading ? 'Sending…' : 'Send Visit Request'}
                    </button>
                  </form>
                )}
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setEnquiryOpen(!enquiryOpen)}
                  style={{ width: '100%', justifyContent: 'center', background: 'rgba(108,99,255,0.1)', color: 'var(--primary)', border: '1px solid rgba(108,99,255,0.3)' }}
                >
                  <FiMail /> Contact Agent
                </button>
                {enquiryOpen && (
                  <form className="interaction-form" onSubmit={submitEnquiry}>
                    <label className="form-group">
                      <span className="form-label">Your message</span>
                      <textarea className="form-input" required minLength="1" maxLength="2000" value={enquiryMessage} onChange={(event) => setEnquiryMessage(event.target.value)} />
                    </label>
                    <button className="btn btn-primary btn-sm" type="submit" disabled={actionLoading}>
                      {actionLoading ? 'Sending…' : 'Send Enquiry'}
                    </button>
                  </form>
                )}
              </>
            )}
            {isOwner && <p className="interaction-owner-note">This is your listing. Buyer visit and enquiry actions are not available to the listing owner.</p>}

            {/* Price Breakdown */}
            <div style={{ marginTop: 24, padding: '16px', background: 'rgba(108,99,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Price Details</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Base Price</span>
                <span style={{ fontWeight: 600 }}>{formatPrice(property.price)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Per sqft</span>
                <span style={{ fontWeight: 600 }}>₹{Math.round(property.price / property.area).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
