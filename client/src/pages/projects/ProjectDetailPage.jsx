import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProject, updateProject, deleteProject } from '../../redux/slices/projectSlice';
import { fetchTasks, createTask, updateTask, deleteTask } from '../../redux/slices/taskSlice';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX, FiCalendar, FiUser, FiFlag, FiMoreVertical } from 'react-icons/fi';
import { toast } from 'react-toastify';

const STATUSES = [
  { key: 'todo', label: 'To Do', color: '#FF6584', emoji: '📋' },
  { key: 'in-progress', label: 'In Progress', color: '#FFBE0B', emoji: '🔄' },
  { key: 'done', label: 'Done', color: '#43D9AD', emoji: '✅' },
];

const ProjectDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProject, loading: projectLoading } = useSelector((state) => state.projects);
  const { tasks, loading: taskLoading } = useSelector((state) => state.tasks);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '',
  });

  useEffect(() => {
    dispatch(fetchProject(id));
    dispatch(fetchTasks(id));
  }, [dispatch, id]);

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' });
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      assignedTo: task.assignedTo?._id || '',
    });
    setShowTaskModal(true);
    setOpenMenu(null);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error('Task title is required');

    const payload = {
      ...taskForm,
      dueDate: taskForm.dueDate || undefined,
      assignedTo: taskForm.assignedTo || undefined,
    };

    if (editingTask) {
      const result = await dispatch(updateTask({ id: editingTask._id, ...payload }));
      if (updateTask.fulfilled.match(result)) {
        toast.success('Task updated!');
        setShowTaskModal(false);
      } else {
        toast.error(result.payload);
      }
    } else {
      const result = await dispatch(createTask({ projectId: id, ...payload }));
      if (createTask.fulfilled.match(result)) {
        toast.success('Task created! ✨');
        setShowTaskModal(false);
      } else {
        toast.error(result.payload);
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const result = await dispatch(updateTask({ id: taskId, status: newStatus }));
    if (updateTask.fulfilled.match(result)) {
      toast.success(`Moved to ${STATUSES.find(s => s.key === newStatus)?.label}`);
    }
    setOpenMenu(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    const result = await dispatch(deleteTask(taskId));
    if (deleteTask.fulfilled.match(result)) {
      toast.success('Task deleted');
    }
    setOpenMenu(null);
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and ALL its tasks? This cannot be undone.')) return;
    const result = await dispatch(deleteProject(id));
    if (deleteProject.fulfilled.match(result)) {
      toast.success('Project deleted');
      navigate('/projects');
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = { high: '#FF6584', medium: '#FFBE0B', low: '#43D9AD' };
    return (
      <span className="priority-badge" style={{ '--priority-color': colors[priority] || 'var(--text-secondary)' }}>
        <FiFlag style={{ fontSize: '0.7rem' }} /> {priority}
      </span>
    );
  };

  if (projectLoading && !currentProject) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: 24 }}>
        <h2>Project not found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 20px' }}>This project may have been deleted or you don't have access.</p>
        <Link to="/projects" className="btn btn-primary">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <Link to="/projects" className="property-back-link" style={{ marginBottom: 16, display: 'inline-flex' }}>
        <FiArrowLeft /> Back to Projects
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', margin: 0 }}>{currentProject.title}</h1>
            <span className={`status-badge status-${currentProject.status}`}>{currentProject.status}</span>
          </div>
          {currentProject.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>{currentProject.description}</p>
          )}
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            {currentProject.deadline && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiCalendar /> Deadline: {new Date(currentProject.deadline).toLocaleDateString()}
              </span>
            )}
            <span>Created: {new Date(currentProject.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={openCreateTask}>
            <FiPlus /> Add Task
          </button>
          <button className="btn btn-outline btn-sm icon-btn-danger" onClick={handleDeleteProject} title="Delete project">
            <FiTrash2 />
          </button>
        </div>
      </div>

      {/* Task Board */}
      <div className="task-board">
        {STATUSES.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status.key);
          return (
            <div className="task-column" key={status.key}>
              <div className="task-column-header" style={{ '--column-color': status.color }}>
                <span>{status.emoji} {status.label}</span>
                <span className="task-column-count">{columnTasks.length}</span>
              </div>
              <div className="task-column-body">
                {taskLoading && tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading...</div>
                ) : columnTasks.length === 0 ? (
                  <div className="task-column-empty">
                    No tasks
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div className="task-card" key={task._id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, flex: 1, minWidth: 0 }}>{task.title}</h4>
                        <div style={{ position: 'relative' }}>
                          <button
                            className="icon-btn"
                            style={{ width: 28, height: 28, fontSize: '0.85rem' }}
                            onClick={() => setOpenMenu(openMenu === task._id ? null : task._id)}
                          >
                            <FiMoreVertical />
                          </button>
                          {openMenu === task._id && (
                            <div className="dropdown" style={{ top: '100%', right: 0, minWidth: 160 }} onClick={() => setOpenMenu(null)}>
                              <button className="dropdown-item" onClick={() => openEditTask(task)}>
                                <FiEdit2 /> Edit
                              </button>
                              {status.key !== 'todo' && (
                                <button className="dropdown-item" onClick={() => handleStatusChange(task._id, 'todo')}>
                                  📋 Move to To Do
                                </button>
                              )}
                              {status.key !== 'in-progress' && (
                                <button className="dropdown-item" onClick={() => handleStatusChange(task._id, 'in-progress')}>
                                  🔄 Move to In Progress
                                </button>
                              )}
                              {status.key !== 'done' && (
                                <button className="dropdown-item" onClick={() => handleStatusChange(task._id, 'done')}>
                                  ✅ Move to Done
                                </button>
                              )}
                              <div className="dropdown-divider" />
                              <button className="dropdown-item" style={{ color: '#ff6b6b' }} onClick={() => handleDeleteTask(task._id)}>
                                <FiTrash2 /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {task.description && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 6, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {task.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                        {getPriorityBadge(task.priority)}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {task.dueDate && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <FiCalendar /> {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {task.assignedTo && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <FiUser /> {task.assignedTo.name?.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.3rem' }}>{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="icon-btn" onClick={() => setShowTaskModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  className="form-input"
                  placeholder="What needs to be done?"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Add more details..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-input"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={taskLoading}>
                  {taskLoading ? <><div className="spinner" /> Saving...</> : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
