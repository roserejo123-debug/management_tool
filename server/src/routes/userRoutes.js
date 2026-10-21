const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAllAgents,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public
router.get('/agents', getAllAgents);

// Admin only
router.use(protect, authorize('admin'));
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.put('/:id/toggle-status', toggleUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
