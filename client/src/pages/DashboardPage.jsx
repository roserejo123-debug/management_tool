import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../utils/axiosInstance';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    API.get('/dashboard/summary', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setSummary(data.summary);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError.response?.data?.message || 'Unable to load dashboard data.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';
  const stats = isAdmin ? [
    { icon: '👥', label: 'Registered Users', value: summary?.users, color: '#6C63FF', bg: 'rgba(108,99,255,0.15)' },
    { icon: '🏠', label: 'Property Listings', value: summary?.properties, color: '#43D9AD', bg: 'rgba(67,217,173,0.15)' },
    { icon: '✅', label: 'Awaiting Approval', value: summary?.pendingProperties, color: '#FFBE0B', bg: 'rgba(255,190,11,0.15)' },
    { icon: '📅', label: 'Visits Booked', value: summary?.bookings, color: '#FF6584', bg: 'rgba(255,101,132,0.15)' },
  ] : isAgent ? [
    { icon: '🏠', label: 'My Listings', value: summary?.listings, color: '#6C63FF', bg: 'rgba(108,99,255,0.15)' },
    { icon: '👁️', label: 'Listing Views', value: summary?.views, color: '#43D9AD', bg: 'rgba(67,217,173,0.15)' },
    { icon: '📅', label: 'Visit Requests', value: summary?.bookings, color: '#FFBE0B', bg: 'rgba(255,190,11,0.15)' },
    { icon: '💬', label: 'Enquiries', value: summary?.enquiries, color: '#FF6584', bg: 'rgba(255,101,132,0.15)' },
  ] : [
    { icon: '🏠', label: 'Saved Properties', value: summary?.savedProperties, color: '#6C63FF', bg: 'rgba(108,99,255,0.15)' },
    { icon: '📅', label: 'Visits Booked', value: summary?.bookings, color: '#43D9AD', bg: 'rgba(67,217,173,0.15)' },
    { icon: '💬', label: 'Enquiries Sent', value: summary?.enquiries, color: '#FF6584', bg: 'rgba(255,101,132,0.15)' },
    { icon: '⭐', label: 'Reviews Given', value: summary?.reviews, color: '#FFBE0B', bg: 'rgba(255,190,11,0.15)' },
  ];

  const quickActions = isAdmin ? [
    { icon: '👥', title: 'Manage Users', desc: 'Update user roles and account status', link: '/admin/users', color: '#6C63FF' },
    { icon: '✅', title: 'Moderate Listings', desc: 'Approve or reject property submissions', link: '/admin/properties', color: '#43D9AD' },
    { icon: '📊', title: 'Analytics & Reports', desc: 'Review platform activity and download reports', link: '/admin/analytics', color: '#FFBE0B' },
  ] : isAgent ? [
    { icon: '🏠', title: 'My Properties', desc: 'Manage your listings and approval status', link: '/my-properties', color: '#6C63FF' },
    { icon: '📅', title: 'Visit Requests', desc: 'Confirm or update property visits', link: '/bookings', color: '#43D9AD' },
    { icon: '💬', title: 'Enquiries', desc: 'Read messages from prospective buyers', link: '/enquiries', color: '#FF6584' },
  ] : [
    { icon: '🏠', title: 'Browse Properties', desc: 'Explore available listings by location, type, and budget', link: '/properties', color: '#6C63FF' },
    { icon: '❤️', title: 'My Wishlist', desc: 'View and manage your saved favorite properties', link: '/wishlist', color: '#FF6584' },
    { icon: '📅', title: 'My Bookings', desc: 'Track your property visit bookings and status', link: '/bookings', color: '#43D9AD' },
    { icon: '👤', title: 'Edit Profile', desc: 'Update your personal info, avatar, and password', link: '/profile', color: '#FFBE0B' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(255,101,132,0.1))',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '32px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isAdmin ? 'Platform oversight and listing moderation.' : isAgent ? 'Track listing performance and respond to customers.' : "Here's what's happening with your real estate journey."}
          </p>
        </div>
        <Link to="/properties" className="btn btn-primary">
          🔍 Browse Properties
        </Link>
      </div>

      {/* Stats Grid */}
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bg }}>
              {stat.icon}
            </div>
            <div className="stat-value" style={{ color: stat.color }}>{loading ? '…' : stat.value ?? 0}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {quickActions.map((action, i) => (
          <Link to={action.link} key={i} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, fontSize: '1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${action.color}22`, marginBottom: '16px'
              }}>
                {action.icon}
              </div>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>{action.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
