const express = require('express');
const router = express.Router();
const { updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// All task routes require authentication
router.use(protect);

// Task update and delete (by task ID)
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
