const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Property type is required'],
      enum: ['apartment', 'villa', 'house', 'plot', 'commercial', 'pg'],
    },
    listingType: {
      type: String,
      required: [true, 'Listing type is required'],
      enum: ['sale', 'rent'],
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'rented', 'pending', 'rejected'],
      default: 'pending',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [0, 'Area cannot be negative'],
    },
    areaUnit: {
      type: String,
      enum: ['sqft', 'sqm', 'acres'],
      default: 'sqft',
    },
    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    floors: { type: Number, default: 1 },

    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    amenities: [
      {
        type: String,
        enum: [
          'parking', 'gym', 'swimming_pool', 'security', 'lift',
          'power_backup', 'garden', 'clubhouse', 'wifi', 'ac',
          'furnished', 'semi_furnished', 'pet_friendly', 'balcony',
        ],
      },
    ],

    images: [
      {
        public_id: { type: String },
        url: { type: String, required: true },
        caption: { type: String },
      },
    ],

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },

    // Approval flow
    isApproved: { type: Boolean, default: false },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text search index
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'location.address': 'text',
});

// Compound index for filters
propertySchema.index({ 'location.city': 1, type: 1, listingType: 1, price: 1 });

module.exports = mongoose.model('Property', propertySchema);
