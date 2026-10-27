const Project = require('../models/Project');
const Task = require('../models/Task');

// ─────────────────────────────────────────────
// @desc    Get all projects for logged-in user
// @route   GET /api/projects
// @access  Private
// ─────────────────────────────────────────────
exports.getProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { createdBy: req.user._id };

    if (status) query.status = status;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(query).sort('-createdAt').lean();

    // Get task counts for each project
    const projectIds = projects.map((p) => p._id);
    const taskCounts = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$project',
          total: { $sum: 1 },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        },
      },
    ]);

    const countMap = new Map(taskCounts.map((c) => [c._id.toString(), c]));

    const projectsWithCounts = projects.map((project) => {
      const counts = countMap.get(project._id.toString());
      return {
        ...project,
        taskCounts: {
          total: counts?.total || 0,
          todo: counts?.todo || 0,
          inProgress: counts?.inProgress || 0,
          done: counts?.done || 0,
        },
      };
    });

    res.status(200).json({ success: true, projects: projectsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
// ─────────────────────────────────────────────
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, project, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
// ─────────────────────────────────────────────
exports.createProject = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;

    const project = await Project.create({
      title,
      description,
      deadline,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully!',
      project,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
// ─────────────────────────────────────────────
exports.updateProject = async (req, res) => {
  try {
    const { title, description, status, deadline } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { title, description, status, deadline },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully!',
      project,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// @desc    Delete project and all its tasks
// @route   DELETE /api/projects/:id
// @access  Private
// ─────────────────────────────────────────────
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Delete all tasks belonging to this project
    await Task.deleteMany({ project: project._id });

    res.status(200).json({
      success: true,
      message: 'Project and all its tasks deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
