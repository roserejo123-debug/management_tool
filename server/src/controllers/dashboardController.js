const Project = require('../models/Project');
const Task = require('../models/Task');

// ─────────────────────────────────────────────
// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
// ─────────────────────────────────────────────
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      tasksByStatus,
      recentProjects,
      recentTasks,
    ] = await Promise.all([
      Project.countDocuments({ createdBy: userId }),
      Project.countDocuments({ createdBy: userId, status: 'active' }),
      Project.countDocuments({ createdBy: userId, status: 'completed' }),
      Task.countDocuments({ createdBy: userId }),
      Task.aggregate([
        { $lookup: { from: 'projects', localField: 'project', foreignField: '_id', as: 'proj' } },
        { $unwind: '$proj' },
        { $match: { 'proj.createdBy': userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Project.find({ createdBy: userId }).sort('-createdAt').limit(5).lean(),
      Task.find({ createdBy: userId })
        .populate('project', 'title')
        .populate('assignedTo', 'name')
        .sort('-createdAt')
        .limit(5)
        .lean(),
    ]);

    const statusMap = Object.fromEntries(tasksByStatus.map(({ _id, count }) => [_id, count]));

    res.status(200).json({
      success: true,
      summary: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        todoTasks: statusMap['todo'] || 0,
        inProgressTasks: statusMap['in-progress'] || 0,
        doneTasks: statusMap['done'] || 0,
      },
      recentProjects,
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
