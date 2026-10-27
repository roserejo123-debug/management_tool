const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { getTasks, createTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// All project routes require authentication
router.use(protect);

// Validation rules
const projectRules = [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required (max 100 chars)'),
];

const taskRules = [
  body('title').trim().isLength({ min: 1, max: 150 }).withMessage('Task title is required (max 150 chars)'),
];

// Project CRUD
router.get('/', getProjects);
router.post('/', projectRules, validate, createProject);
router.get('/:id', getProject);
router.put('/:id', projectRules, validate, updateProject);
router.delete('/:id', deleteProject);

// Tasks nested under projects
router.get('/:projectId/tasks', getTasks);
router.post('/:projectId/tasks', taskRules, validate, createTask);

module.exports = router;
