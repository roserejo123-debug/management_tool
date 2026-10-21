const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: Number.isInteger,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters.'],
    },
  },
  { timestamps: true }
);

reviewSchema.index({ property: 1, user: 1 }, { unique: true });
reviewSchema.index({ property: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
