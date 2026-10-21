const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { createPropertyReview, getPropertyReviews } = require('../controllers/reviewController');

const router = express.Router();

router.get('/:propertyId/reviews', getPropertyReviews);
router.post(
  '/:propertyId/reviews',
  protect,
  authorize('user'),
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
    body('comment').trim().notEmpty().isLength({ max: 1000 }).withMessage('A review is required and must be 1000 characters or fewer.'),
  ],
  validate,
  createPropertyReview
);

module.exports = router;
