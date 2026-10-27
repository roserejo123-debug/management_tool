const Task = require('../models/Task');
const Project = require('../models/Project');

// ─────────────────────────────────────────────
// @desc    Get all tasks for a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
// ─────────────────────────────────────────────
exports.getTasks = async (req, res) => {
  try {
    // Verify project ownership
    const project = await Project.findOne({
      _id: req.params.projectId,
      createdBy: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Create a task in a project
// @route   POST /api/projects/:projectId/tasks
// @access  Private
// ─────────────────────────────────────────────
exports.createTask = async (req, res) => {
  try {
    // Verify project ownership
    const project = await Project.findOne({
      _id: req.params.projectId,
      createdBy: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const { title, description, assignedTo, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      project: project._id,
      assignedTo: assignedTo || undefined,
      createdBy: req.user._id,
      priority,
      dueDate,
    });

    const populated = await task.populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully!',
      task: populated,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Update a task (status, assignee, etc.)
// @route   PUT /api/tasks/:id
// @access  Private
// ─────────────────────────────────────────────
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Verify project ownership
    const project = await Project.findOne({
      _id: task.project,
      createdBy: req.user._id,
    });

    if (!project) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const { title, description, status, assignedTo, priority, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || undefined;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    const populated = await task.populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully!',
      task: populated,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
// ─────────────────────────────────────────────
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Verify project ownership
    const project = await Project.findOne({
      _id: task.project,
      createdBy: req.user._id,
    });

    if (!project) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
