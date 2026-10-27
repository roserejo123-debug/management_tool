import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProject, updateProject, deleteProject } from '../../redux/slices/projectSlice';
import { FiPlus, FiFolder, FiEdit2, FiTrash2, FiCalendar, FiCheckCircle, FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((state) => state.projects);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ title: '', description: '', deadline: '', status: 'active' });

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Open modal if ?new=1 in URL
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openCreate = () => {
    setEditProject(null);
    setForm({ title: '', description: '', deadline: '', status: 'active' });
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditProject(project);
    setForm({
      title: project.title,
      description: project.description || '',
      deadline: project.deadline ? project.deadline.slice(0, 10) : '',
      status: project.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');

    const payload = { ...form, deadline: form.deadline || undefined };

    if (editProject) {
      const result = await dispatch(updateProject({ id: editProject._id, ...payload }));
      if (updateProject.fulfilled.match(result)) {
        toast.success('Project updated!');
        setShowModal(false);
        dispatch(fetchProjects());
      } else {
        toast.error(result.payload);
      }
    } else {
      const result = await dispatch(createProject(payload));
      if (createProject.fulfilled.match(result)) {
        toast.success('Project created! 🎉');
        setShowModal(false);
      } else {
        toast.error(result.payload);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    const result = await dispatch(deleteProject(id));
    if (deleteProject.fulfilled.match(result)) {
      toast.success('Project deleted');
    } else {
      toast.error(result.payload);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#43D9AD';
      case 'completed': return '#6C63FF';
      case 'archived': return 'var(--text-secondary)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">My Projects</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Manage and track all your projects</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> New Project
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="input-wrapper" style={{ flex: 1, minWidth: 220 }}>
          <FiSearch className="input-icon" />
          <input
            className="form-input"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input"
          style={{ width: 160 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Projects Grid */}
      {loading && projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📁</div>
          <h2 style={{ marginBottom: 8 }}>{search || statusFilter ? 'No matching projects' : 'No projects yet'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
            {search || statusFilter ? 'Try different filters' : 'Create your first project to get started!'}
          </p>
          {!search && !statusFilter && (
            <button className="btn btn-primary" onClick={openCreate}>
              <FiPlus /> Create Project
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredProjects.map((project) => (
            <div className="card project-card" key={project._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <Link to={`/projects/${project._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project.title}
                  </h3>
                </Link>
                <span className={`status-badge status-${project.status}`} style={{ flexShrink: 0, marginLeft: 8 }}>
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description}
                </p>
              )}

              {/* Task Progress */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <span>{project.taskCounts?.done || 0} of {project.taskCounts?.total || 0} tasks done</span>
                  <span>{project.taskCounts?.total > 0 ? Math.round(((project.taskCounts?.done || 0) / project.taskCounts.total) * 100) : 0}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${project.taskCounts?.total > 0 ? ((project.taskCounts?.done || 0) / project.taskCounts.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {project.deadline && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiCalendar /> {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiCheckCircle /> {project.taskCounts?.total || 0} tasks
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="icon-btn" title="Edit" onClick={() => openEdit(project)}>
                    <FiEdit2 />
                  </button>
                  <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => handleDelete(project._id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.3rem' }}>{editProject ? 'Edit Project' : 'New Project'}</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input
                  className="form-input"
                  placeholder="Enter project title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Brief description of the project..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
                {editProject && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-input"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                  {loading ? <><div className="spinner" /> Saving...</> : editProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
