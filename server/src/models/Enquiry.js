const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Your name is required.'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Your email is required.'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address.'],
    },
    phone: { type: String, trim: true, maxlength: 30 },
    message: {
      type: String,
      required: [true, 'A message is required.'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters.'],
    },
  },
  { timestamps: true }
);

enquirySchema.index({ property: 1, createdAt: -1 });
enquirySchema.index({ sender: 1, createdAt: -1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
