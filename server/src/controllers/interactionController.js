const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Enquiry = require('../models/Enquiry');
const Property = require('../models/Property');
const Wishlist = require('../models/Wishlist');
const sendEmail = require('../utils/sendEmail');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));
const populatedBooking = (query) => query
  .populate('property', 'title images location price listingType status isApproved')
  .populate('customer', 'name email phone')
  .populate('agent', 'name email phone');

exports.createBooking = async (req, res) => {
  try {
    const { propertyId, scheduledAt, message } = req.body;
    if (!isValidId(propertyId)) {
      return res.status(400).json({ success: false, message: 'Invalid property.' });
    }

    const visitDate = new Date(scheduledAt);
    if (!scheduledAt || Number.isNaN(visitDate.getTime()) || visitDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'Choose a future visit date and time.' });
    }

    const property = await Property.findOne({
      _id: propertyId,
      isApproved: true,
      status: 'available',
    }).populate('agent', 'name email');
    if (!property?.agent) {
      return res.status(404).json({ success: false, message: 'This property is not available for visits.' });
    }
    if (property.agent._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot book a visit to your own listing.' });
    }

    const booking = await Booking.create({
      property: property._id,
      customer: req.user._id,
      agent: property.agent._id,
      scheduledAt: visitDate,
      message,
    });
    await booking.populate([
      { path: 'property', select: 'title images location price listingType status isApproved' },
      { path: 'customer', select: 'name email phone' },
      { path: 'agent', select: 'name email phone' },
    ]);

    return res.status(201).json({ success: true, message: 'Visit request sent to the agent.', booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = req.user.role === 'admin'
      ? {}
      : req.user.role === 'agent'
        ? { agent: req.user._id }
        : { customer: req.user._id };
    if (status && ['pending', 'confirmed', 'visited', 'cancelled', 'rejected'].includes(status)) {
      query.status = status;
    }

    const bookings = await populatedBooking(Booking.find(query).sort({ scheduledAt: 1 }));
    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'visited', 'cancelled', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status.' });
    }
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking.' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title images location price listingType status isApproved')
      .populate('customer', 'name email phone')
      .populate('agent', 'name email phone');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (!booking.customer || !booking.agent || !booking.property) {
      return res.status(409).json({ success: false, message: 'This booking is missing a related user or property.' });
    }

    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isAgent = booking.agent._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isCustomer && !isAgent && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not allowed to update this booking.' });
    }

    if (status === 'cancelled') {
      if (!isCustomer && !isAgent && !isAdmin) {
        return res.status(403).json({ success: false, message: 'You are not allowed to cancel this booking.' });
      }
      if (!['pending', 'confirmed'].includes(booking.status)) {
        return res.status(409).json({ success: false, message: 'Only pending or confirmed visits can be cancelled.' });
      }
    } else {
      if (!isAgent && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only the listing agent can update the visit status.' });
      }
      const transitions = {
        pending: ['confirmed', 'rejected'],
        confirmed: ['visited', 'rejected'],
      };
      if (!transitions[booking.status]?.includes(status)) {
        return res.status(409).json({ success: false, message: `A ${booking.status} booking cannot be changed to ${status}.` });
      }
    }

    booking.status = status;
    await booking.save();
    await booking.populate([
      { path: 'property', select: 'title images location price listingType status isApproved' },
      { path: 'customer', select: 'name email phone' },
      { path: 'agent', select: 'name email phone' },
    ]);

    let notificationSent = false;
    if (status === 'confirmed') {
      try {
        await sendEmail({
          to: booking.customer.email,
          subject: `Your property visit is confirmed: ${booking.property.title.replace(/[\r\n]+/g, ' ')}`,
          html: `<p>Hi ${escapeHtml(booking.customer.name)},</p><p>Your visit to <strong>${escapeHtml(booking.property.title)}</strong> has been confirmed for ${escapeHtml(booking.scheduledAt.toLocaleString())}.</p><p>Agent: ${escapeHtml(booking.agent.name)}${booking.agent.phone ? ` (${escapeHtml(booking.agent.phone)})` : ''}</p>`,
        });
        notificationSent = true;
      } catch (emailError) {
        console.error('Booking confirmation email could not be sent:', emailError.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Visit ${status}.`,
      booking,
      ...(status === 'confirmed' ? { notificationSent } : {}),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEnquiry = async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;
    if (!isValidId(propertyId)) {
      return res.status(400).json({ success: false, message: 'Invalid property.' });
    }

    const property = await Property.findOne({
      _id: propertyId,
      isApproved: true,
      status: { $nin: ['sold', 'rented'] },
    });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });
    if (property.agent.toString() === req.user?._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot enquire about your own listing.' });
    }

    const enquiry = await Enquiry.create({
      property: property._id,
      sender: req.user?._id,
      name: name || req.user?.name,
      email: email || req.user?.email,
      phone: phone || req.user?.phone,
      message,
    });
    return res.status(201).json({ success: true, message: 'Your enquiry has been sent to the agent.', enquiry });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEnquiries = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : req.user.role === 'agent'
        ? { property: { $in: await Property.find({ agent: req.user._id }).distinct('_id') } }
        : { sender: req.user._id };
    const enquiries = await Enquiry.find(query)
      .populate('property', 'title images location')
      .populate('sender', 'name email phone')
      .sort('-createdAt');
    return res.status(200).json({ success: true, enquiries });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const entries = await Wishlist.find({ user: req.user._id })
      .populate({
        path: 'property',
        match: { isApproved: true, status: { $nin: ['sold', 'rented'] } },
        populate: { path: 'agent', select: 'name email phone avatar' },
      })
      .sort('-createdAt');
    const properties = entries.map((entry) => entry.property).filter(Boolean);
    return res.status(200).json({ success: true, properties });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    if (!isValidId(req.params.propertyId)) {
      return res.status(400).json({ success: false, message: 'Invalid property.' });
    }
    const property = await Property.findOne({
      _id: req.params.propertyId,
      isApproved: true,
      status: { $nin: ['sold', 'rented'] },
    });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });

    await Wishlist.updateOne(
      { user: req.user._id, property: property._id },
      { $setOnInsert: { user: req.user._id, property: property._id } },
      { upsert: true }
    );
    return res.status(200).json({ success: true, message: 'Property saved to your wishlist.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ success: true, message: 'Property is already in your wishlist.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    if (!isValidId(req.params.propertyId)) {
      return res.status(400).json({ success: false, message: 'Invalid property.' });
    }
    await Wishlist.deleteOne({ user: req.user._id, property: req.params.propertyId });
    return res.status(200).json({ success: true, message: 'Property removed from your wishlist.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
