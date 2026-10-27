import { useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { FiUser, FiLogOut, FiLayout, FiFolder, FiChevronDown } from 'react-icons/fi';

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
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="nav-logo">
          📋 TaskFlow
        </Link>

        {isAuthenticated && (
          <div className="nav-links">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FiLayout style={{ marginRight: 4 }} /> Dashboard
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FiFolder style={{ marginRight: 4 }} /> Projects
            </NavLink>
          </div>
        )}

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
                  <Link to="/dashboard" className="dropdown-item">
                    <FiLayout /> Dashboard
                  </Link>
                  <Link to="/projects" className="dropdown-item">
                    <FiFolder /> My Projects
                  </Link>
                  <Link to="/profile" className="dropdown-item">
                    <FiUser /> My Profile
                  </Link>
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
