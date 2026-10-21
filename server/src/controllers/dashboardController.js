const Booking = require('../models/Booking');
const Enquiry = require('../models/Enquiry');
const Property = require('../models/Property');
const Review = require('../models/Review');
const User = require('../models/User');
const Wishlist = require('../models/Wishlist');

exports.getDashboardSummary = async (req, res) => {
  try {
    if (req.user.role === 'agent') {
      const propertyIds = await Property.find({ agent: req.user._id }).distinct('_id');
      const [listings, views, bookings, enquiries] = await Promise.all([
        Property.countDocuments({ agent: req.user._id }),
        Property.aggregate([
          { $match: { agent: req.user._id } },
          { $group: { _id: null, total: { $sum: '$views' } } },
        ]),
        Booking.countDocuments({ agent: req.user._id }),
        Enquiry.countDocuments({ property: { $in: propertyIds } }),
      ]);
      return res.status(200).json({
        success: true,
        summary: {
          listings,
          views: views[0]?.total || 0,
          bookings,
          enquiries,
        },
      });
    }

    if (req.user.role === 'admin') {
      const [
        users, agents, properties, pendingProperties, bookings, enquiries, reviews,
        bookingStatuses, listingStatuses, recentProperties,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'agent' }),
        Property.countDocuments(),
        Property.countDocuments({ isApproved: false, status: 'pending' }),
        Booking.countDocuments(),
        Enquiry.countDocuments(),
        Review.countDocuments(),
        Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Property.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Property.find().populate('agent', 'name email').sort('-createdAt').limit(10),
      ]);
      return res.status(200).json({
        success: true,
        summary: {
          users, agents, properties, pendingProperties, bookings, enquiries, reviews,
          bookingStatuses: Object.fromEntries(bookingStatuses.map(({ _id, count }) => [_id, count])),
          listingStatuses: Object.fromEntries(listingStatuses.map(({ _id, count }) => [_id, count])),
        },
        recentProperties,
      });
    }

    const [savedProperties, bookings, enquiries, reviews] = await Promise.all([
      Wishlist.countDocuments({ user: req.user._id }),
      Booking.countDocuments({ customer: req.user._id }),
      Enquiry.countDocuments({ sender: req.user._id }),
      Review.countDocuments({ user: req.user._id }),
    ]);
    return res.status(200).json({
      success: true,
      summary: { savedProperties, bookings, enquiries, reviews },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
