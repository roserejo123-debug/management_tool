const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Review = require('../models/Review');

exports.getPropertyReviews = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.propertyId)) {
      return res.status(400).json({ success: false, message: 'Invalid property.' });
    }
    const property = await Property.findOne({
      _id: req.params.propertyId,
      isApproved: true,
      status: { $nin: ['sold', 'rented'] },
    }).select('_id');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });

    const [reviews, summary] = await Promise.all([
      Review.find({ property: property._id })
        .populate('user', 'name avatar')
        .sort('-createdAt'),
      Review.aggregate([
        { $match: { property: property._id } },
        { $group: { _id: '$property', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
      ]),
    ]);
    const stats = summary[0] || { averageRating: 0, reviewCount: 0 };
    return res.status(200).json({
      success: true,
      reviews,
      averageRating: Math.round(stats.averageRating * 10) / 10,
      reviewCount: stats.reviewCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPropertyReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const propertyId = req.params.propertyId;
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ success: false, message: 'Invalid property.' });
    }
    const property = await Property.findOne({
      _id: propertyId,
      isApproved: true,
      status: { $nin: ['sold', 'rented'] },
    }).select('_id agent');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });
    if (property.agent.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot review your own listing.' });
    }

    const booking = await Booking.findOne({
      property: property._id,
      customer: req.user._id,
      status: 'visited',
    }).select('_id');
    if (!booking) {
      return res.status(403).json({ success: false, message: 'Only buyers who completed a property visit can leave a review.' });
    }

    const review = await Review.create({
      property: property._id,
      user: req.user._id,
      booking: booking._id,
      rating,
      comment,
    });
    await review.populate('user', 'name avatar');
    return res.status(201).json({ success: true, message: 'Review submitted.', review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this property.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
