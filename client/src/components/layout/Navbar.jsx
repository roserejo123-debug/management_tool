import { useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { FiHome, FiUser, FiLogOut, FiSettings, FiLayout, FiHeart, FiCalendar, FiMessageSquare, FiBarChart2 } from 'react-icons/fi';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getInitial = (name) => name?.charAt(0).toUpperCase() || 'U';

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          🏠 PropEstate
        </Link>

        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/properties" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Properties
          </NavLink>
          <NavLink to="/agents" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Agents
          </NavLink>
        </div>

        <div>
          {isAuthenticated && user ? (
            <div className="nav-user">
              <div
                className="nav-avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  getInitial(user.name)
                )}
              </div>

              {dropdownOpen && (
                <div className="dropdown" onClick={() => setDropdownOpen(false)}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                  </div>
                  <Link to="/profile" className="dropdown-item">
                    <FiUser /> My Profile
                  </Link>
                  <Link to="/dashboard" className="dropdown-item">
                    <FiLayout /> Dashboard
                  </Link>
                  <Link to="/wishlist" className="dropdown-item">
                    <FiHeart /> Wishlist
                  </Link>
                  <Link to="/bookings" className="dropdown-item">
                    <FiCalendar /> {user.role === 'agent' || user.role === 'admin' ? 'Visit Requests' : 'My Bookings'}
                  </Link>
                  <Link to="/enquiries" className="dropdown-item">
                    <FiMessageSquare /> Enquiries
                  </Link>
                  {['agent', 'admin'].includes(user.role) && (
                    <Link to="/my-properties" className="dropdown-item">
                      <FiHome /> My Properties
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <Link to="/admin" className="dropdown-item">
                        <FiSettings /> User Management
                      </Link>
                      <Link to="/admin/properties" className="dropdown-item">
                        <FiHome /> Property Moderation
                      </Link>
                      <Link to="/admin/analytics" className="dropdown-item">
                        <FiBarChart2 /> Analytics &amp; Reports
                      </Link>
                    </>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" style={{ color: '#ff6b6b' }} onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
