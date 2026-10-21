const Property = require('../models/Property');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// ─── Helpers ───────────────────────────────────
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'realestate/properties',
      transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }],
    });
    return { public_id: result.public_id, url: result.secure_url };
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};

const deleteFromCloudinary = async (public_id) => {
  if (public_id) await cloudinary.uploader.destroy(public_id);
};

// ─────────────────────────────────────────────────
// @desc    Create a new property
// @route   POST /api/properties
// @access  Private (Agent/Admin)
// ─────────────────────────────────────────────────
exports.createProperty = async (req, res) => {
  try {
    const {
      title, description, type, listingType, price, area, areaUnit,
      bedrooms, bathrooms, floors, address, city, state, pincode,
      lat, lng, amenities,
    } = req.body;

    // Upload images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.path);
        images.push(uploaded);
      }
    }

    const property = await Property.create({
      title, description, type, listingType, price,
      area, areaUnit: areaUnit || 'sqft',
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      floors: floors || 1,
      location: { address, city, state, pincode, coordinates: { lat: lat ? Number(lat) : null, lng: lng ? Number(lng) : null } },
      amenities: amenities ? (Array.isArray(amenities) ? amenities : JSON.parse(amenities)) : [],
      images,
      agent: req.user._id,
      // Admin-created properties are auto-approved
      isApproved: req.user.role === 'admin',
      approvedAt: req.user.role === 'admin' ? Date.now() : null,
      approvedBy: req.user.role === 'admin' ? req.user._id : null,
    });

    await property.populate('agent', 'name email phone avatar');
    res.status(201).json({ success: true, message: 'Property created successfully!', property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// @desc    Get all properties with filtering, sorting, pagination
// @route   GET /api/properties
// @access  Public
// ─────────────────────────────────────────────────
exports.getAllProperties = async (req, res) => {
  try {
    const {
      search, type, listingType, city, state,
      minPrice, maxPrice, minArea, maxArea,
      bedrooms, bathrooms, amenities,
      sort = '-createdAt', page = 1, limit = 9,
      featured,
    } = req.query;

    const query = { isApproved: true, status: { $nin: ['sold', 'rented'] } };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (type) query.type = type;
    if (listingType) query.listingType = listingType;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (state) query['location.state'] = { $regex: state, $options: 'i' };
    if (featured === 'true') query.isFeatured = true;

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Area range
    if (minArea || maxArea) {
      query.area = {};
      if (minArea) query.area.$gte = Number(minArea);
      if (maxArea) query.area.$lte = Number(maxArea);
    }

    // Bedrooms / Bathrooms
    if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };
    if (bathrooms) query.bathrooms = { $gte: Number(bathrooms) };

    // Amenities (array filter)
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $all: amenitiesList };
    }

    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 9));
    const skip = (pageNumber - 1) * pageSize;
    const total = await Property.countDocuments(query);

    const allowedSorts = ['-createdAt', 'createdAt', 'price', '-price', '-views'];
    const sortOrder = allowedSorts.includes(sort) ? sort : '-createdAt';
    const properties = await Property.find(query)
      .populate('agent', 'name email phone avatar')
      .sort(sortOrder)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / pageSize),
      properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
// ─────────────────────────────────────────────────
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('agent', 'name email phone avatar bio');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    if (!property.isApproved || ['sold', 'rented'].includes(property.status)) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.status(200).json({ success: true, property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner Agent / Admin)
// ─────────────────────────────────────────────────
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });

    // Only agent owner or admin can update
    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this property.' });
    }

    const {
      title, description, type, listingType, price, area, areaUnit,
      bedrooms, bathrooms, floors, address, city, state, pincode,
      lat, lng, amenities, status, isFeatured,
    } = req.body;

    // Upload new images
    const newImages = [...property.images];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(file.path);
        newImages.push(uploaded);
      }
    }

    const updateData = {
      title, description, type, listingType, price, area,
      areaUnit: areaUnit || property.areaUnit,
      bedrooms, bathrooms, floors,
      'location.address': address,
      'location.city': city,
      'location.state': state,
      'location.pincode': pincode,
      'location.coordinates.lat': lat ? Number(lat) : property.location.coordinates.lat,
      'location.coordinates.lng': lng ? Number(lng) : property.location.coordinates.lng,
      amenities: amenities ? (Array.isArray(amenities) ? amenities : JSON.parse(amenities)) : property.amenities,
      images: newImages,
      status: status || property.status,
    };

    if (req.user.role !== 'admin' && !property.isApproved) {
      updateData.status = 'pending';
      updateData.isApproved = false;
      updateData.approvedAt = null;
      updateData.approvedBy = null;
    }

    // Only admin can toggle featured / approval
    if (req.user.role === 'admin') {
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    property = await Property.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true })
      .populate('agent', 'name email phone avatar');

    res.status(200).json({ success: true, message: 'Property updated!', property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// @desc    Delete property image
// @route   DELETE /api/properties/:id/images/:public_id
// @access  Private (Owner / Admin)
// ─────────────────────────────────────────────────
exports.deletePropertyImage = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const publicId = decodeURIComponent(req.params.public_id);
    await deleteFromCloudinary(publicId);
    property.images = property.images.filter((img) => img.public_id !== publicId);
    await property.save();

    res.status(200).json({ success: true, message: 'Image deleted.', images: property.images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner Agent / Admin)
// ─────────────────────────────────────────────────
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });

    if (property.agent.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // Delete all images from cloudinary
    for (const img of property.images) {
      await deleteFromCloudinary(img.public_id);
    }

    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Property deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// @desc    Get agent's own properties
// @route   GET /api/properties/my-properties
// @access  Private (Agent/Admin)
// ─────────────────────────────────────────────────
exports.getMyProperties = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { agent: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)), properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// @desc    Approve / Reject property (Admin)
// @route   PUT /api/properties/:id/approve
// @access  Private (Admin)
// ─────────────────────────────────────────────────
exports.approveProperty = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        isApproved,
        approvedAt: isApproved ? Date.now() : null,
        approvedBy: isApproved ? req.user._id : null,
        status: isApproved ? 'available' : 'rejected',
      },
      { new: true }
    ).populate('agent', 'name email phone avatar');

    if (!property) return res.status(404).json({ success: false, message: 'Property not found.' });

    res.status(200).json({
      success: true,
      message: `Property ${isApproved ? 'approved' : 'rejected'} successfully.`,
      property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// @desc    Get ALL properties for Admin (including unapproved)
// @route   GET /api/properties/admin/all
// @access  Private (Admin)
// ─────────────────────────────────────────────────
exports.adminGetAllProperties = async (req, res) => {
  try {
    const { status, isApproved, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('agent', 'name email avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)), properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────
// @desc    Get distinct cities (for search suggestions)
// @route   GET /api/properties/cities
// @access  Public
// ─────────────────────────────────────────────────
exports.getCities = async (req, res) => {
  try {
    const cities = await Property.distinct('location.city', { isApproved: true });
    res.status(200).json({ success: true, cities: cities.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
