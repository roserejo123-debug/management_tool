const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  deletePropertyImage,
  getMyProperties,
  approveProperty,
  adminGetAllProperties,
  getCities,
} = require('../controllers/propertyController');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Only image files can be uploaded.'));
    }
    callback(null, true);
  },
});

const propertyRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(['apartment', 'villa', 'house', 'plot', 'commercial', 'pg']).withMessage('Invalid type'),
  body('listingType').isIn(['sale', 'rent']).withMessage('Must be sale or rent'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('area').isNumeric().withMessage('Area must be a number'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
];

// ── Public Routes ────────────────────────────────
router.get('/', getAllProperties);
router.get('/cities', getCities);

// ── Private Routes ────────────────────────────────
router.get('/my-properties', protect, authorize('agent', 'admin'), getMyProperties);
router.get('/admin/all', protect, authorize('admin'), adminGetAllProperties);
router.post('/', protect, authorize('agent', 'admin'), upload.array('images', 10), propertyRules, validate, createProperty);
router.put('/:id', protect, authorize('agent', 'admin'), upload.array('images', 10), propertyRules, validate, updateProperty);

// ── Dynamic ID Routes (keep last) ──────────────────
router.get('/:id', getPropertyById);
router.delete('/:id', protect, authorize('agent', 'admin'), deleteProperty);
router.delete('/:id/images/:public_id', protect, authorize('agent', 'admin'), deletePropertyImage);
router.put(
  '/:id/approve',
  protect,
  authorize('admin'),
  body('isApproved').isBoolean().withMessage('Approval must be true or false.'),
  validate,
  approveProperty
);

module.exports = router;
