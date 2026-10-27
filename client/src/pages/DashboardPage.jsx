import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../utils/axiosInstance';
import { FiFolder, FiCheckCircle, FiClock, FiList, FiPlus, FiArrowRight } from 'react-icons/fi';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    API.get('/dashboard/summary', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setSummary(data.summary);
          setRecentProjects(data.recentProjects || []);
          setRecentTasks(data.recentTasks || []);
        }
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

  const stats = [
    { icon: <FiFolder />, label: 'Total Projects', value: summary?.totalProjects, color: '#6C63FF', bg: 'rgba(108,99,255,0.15)' },
    { icon: <FiList />, label: 'Total Tasks', value: summary?.totalTasks, color: '#43D9AD', bg: 'rgba(67,217,173,0.15)' },
    { icon: <FiCheckCircle />, label: 'Completed Tasks', value: summary?.doneTasks, color: '#FFBE0B', bg: 'rgba(255,190,11,0.15)' },
    { icon: <FiClock />, label: 'Pending Tasks', value: (summary?.todoTasks || 0) + (summary?.inProgressTasks || 0), color: '#FF6584', bg: 'rgba(255,101,132,0.15)' },
  ];

  const quickActions = [
    { icon: '📁', title: 'My Projects', desc: 'View and manage all your projects', link: '/projects', color: '#6C63FF' },
    { icon: '➕', title: 'New Project', desc: 'Create a new project to organize tasks', link: '/projects?new=1', color: '#43D9AD' },
    { icon: '👤', title: 'Edit Profile', desc: 'Update your personal info and password', link: '/profile', color: '#FFBE0B' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF6584';
      case 'medium': return '#FFBE0B';
      case 'low': return '#43D9AD';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in-progress': return 'In Progress';
      case 'done': return 'Done';
      default: return status;
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(67,217,173,0.1))',
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
            Here's an overview of your projects and tasks.
          </p>
        </div>
        <Link to="/projects?new=1" className="btn btn-primary">
          <FiPlus /> New Project
        </Link>
      </div>

      {/* Stats Grid */}
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color, fontSize: '1.4rem' }}>
              {stat.icon}
            </div>
            <div className="stat-value" style={{ color: stat.color }}>{loading ? '…' : stat.value ?? 0}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom Grid: Recent Projects + Recent Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginTop: '8px' }}>
        {/* Recent Projects */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem' }}>Recent Projects</h2>
            <Link to="/projects" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <FiArrowRight />
            </Link>
          </div>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          ) : recentProjects.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No projects yet. Create your first one!</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {recentProjects.map((project) => (
                <Link to={`/projects/${project._id}`} key={project._id} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '14px 16px',
                    background: 'var(--bg-card2)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'var(--transition)',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`status-badge status-${project.status}`}>{project.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Recent Tasks</h2>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          ) : recentTasks.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No tasks yet. Add tasks to your projects!</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {recentTasks.map((task) => (
                <div key={task._id} style={{
                  padding: '14px 16px',
                  background: 'var(--bg-card2)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        {task.project?.title || 'Unknown project'}
                      </div>
                    </div>
                    <span className={`status-badge status-${task.status}`}>{getStatusLabel(task.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: '1.1rem', margin: '32px 0 16px' }}>Quick Actions</h2>
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
