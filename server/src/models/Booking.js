const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'A visit date and time are required.'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters.'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'visited', 'cancelled', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

bookingSchema.index({ property: 1, customer: 1, scheduledAt: 1 });
bookingSchema.index({ agent: 1, scheduledAt: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
