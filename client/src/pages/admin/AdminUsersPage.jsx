import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import API from '../../utils/axiosInstance';
import { FiUsers, FiToggleLeft, FiToggleRight, FiTrash2, FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { user: currentUser } = useSelector((state) => state.auth);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await API.get('/users', { params });
      setUsers(data.users);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await API.put(`/users/${id}/toggle-status`);
      toast.success(data.message);
      fetchUsers();
    } catch { toast.error('Failed to update status'); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await API.put(`/users/${id}/role`, { role });
      toast.success('Role updated!');
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      toast.success('User deleted!');
      fetchUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  const getInitial = (name) => name?.charAt(0).toUpperCase() || 'U';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>User Management</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUsers style={{ color: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>{users.length} users</span>
        </div>
      </div>
      <p className="page-subtitle">Manage all registered users, roles, and account status.</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <select
          className="form-input"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ maxWidth: 160 }}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="agent">Agent</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>No users found.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem', fontWeight: 700, color: 'white', flexShrink: 0,
                          overflow: 'hidden',
                        }}>
                          {u.avatar?.url ? <img src={u.avatar.url} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitial(u.name)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      {u._id !== currentUser?._id ? (
                        <select
                          className="form-input"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          style={{ padding: '6px 10px', fontSize: '0.8rem', width: 'auto', minWidth: 100 }}
                        >
                          <option value="user">User</option>
                          <option value="agent">Agent</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`role-badge role-${u.role}`}>{u.role}</span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                        fontSize: '0.75rem', fontWeight: 600,
                        background: u.isActive ? 'rgba(67,217,173,0.15)' : 'rgba(255,68,68,0.15)',
                        color: u.isActive ? 'var(--accent)' : '#ff6b6b',
                      }}>
                        {u.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {u._id !== currentUser?._id && (
                          <>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleToggleStatus(u._id)}
                              title={u.isActive ? 'Deactivate' : 'Activate'}
                              style={{
                                background: u.isActive ? 'rgba(255,68,68,0.1)' : 'rgba(67,217,173,0.1)',
                                color: u.isActive ? '#ff6b6b' : 'var(--accent)',
                                border: 'none', padding: '7px 12px'
                              }}
                            >
                              {u.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleDelete(u._id)}
                              title="Delete user"
                              style={{ background: 'rgba(255,68,68,0.1)', color: '#ff6b6b', border: 'none', padding: '7px 12px' }}
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
