const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const {
  createBooking,
  getBookings,
  updateBookingStatus,
  createEnquiry,
  getEnquiries,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/interactionController');

const router = express.Router();

router.post(
  '/bookings',
  protect,
  authorize('user'),
  [
    body('propertyId').isMongoId().withMessage('Invalid property.'),
    body('scheduledAt').isISO8601().withMessage('A valid visit date and time are required.'),
    body('message').optional().isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters.'),
  ],
  validate,
  createBooking
);
router.get('/bookings', protect, getBookings);
router.patch(
  '/bookings/:id/status',
  protect,
  [
    body('status').isIn(['confirmed', 'visited', 'cancelled', 'rejected']).withMessage('Invalid booking status.'),
  ],
  validate,
  updateBookingStatus
);

router.post(
  '/enquiries',
  protect,
  authorize('user'),
  [
    body('propertyId').isMongoId().withMessage('Invalid property.'),
    body('message').trim().notEmpty().isLength({ max: 2000 }).withMessage('Message is required and must be 2000 characters or fewer.'),
    body('name').optional().trim().isLength({ max: 80 }),
    body('email').optional().isEmail(),
    body('phone').optional().trim().isLength({ max: 30 }),
  ],
  validate,
  createEnquiry
);
router.get('/enquiries', protect, getEnquiries);

router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:propertyId', protect, addToWishlist);
router.delete('/wishlist/:propertyId', protect, removeFromWishlist);

module.exports = router;
