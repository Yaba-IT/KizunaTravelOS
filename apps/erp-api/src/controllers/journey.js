/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/controllers/journey.js - Journey management controller
* Manages travel journeys and itinerary operations
*
* coded by farid212@Yaba-IT!
*/

const Journey = require('../models/Journey');
const User = require('../models/User');
const Booking = require('../models/Booking');

/**
 * @route   GET /api/journeys
 * @desc    Get all journeys (Agent/Manager only)
 * @access  Private/Agent/Manager
 */
exports.getAllJourneys = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, minPrice, maxPrice } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { 'meta.isDeleted': false };
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Execute query
    const journeys = await Journey.find(query)
      .populate('guideId', 'firstname lastname')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'meta.created_at': -1 });

    const total = await Journey.countDocuments(query);

    res.json({
      journeys,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all journeys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/journeys/:id
 * @desc    Get journey by ID (Agent/Manager only)
 * @access  Private/Agent/Manager
 */
exports.getJourneyById = async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id)
      .populate('guideId', 'firstname lastname email')
      .populate('providerId', 'name type contact');

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    if (journey.meta.isDeleted) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    res.json({ journey });

  } catch (error) {
    console.error('Get journey by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/customer/journeys
 * @desc    Get available journeys for customers
 * @access  Private/Customer
 */
exports.getAvailableJourneys = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, minPrice, maxPrice, duration } = req.query;
    const skip = (page - 1) * limit;

    // Build query for available journeys
    const query = { 
      'meta.isDeleted': false,
      status: 'active'
    };
    
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (duration) query.duration = duration;

    const journeys = await Journey.find(query)
      .select('name description price duration category images')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'meta.created_at': -1 });

    const total = await Journey.countDocuments(query);

    res.json({
      journeys,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get available journeys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/public/journeys
 * @desc    Get public journeys (no auth required)
 * @access  Public
 */
exports.getPublicJourneys = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, minPrice, maxPrice, duration } = req.query;
    const skip = (page - 1) * limit;

    // Build query for public journeys
    const query = { 
      'meta.isDeleted': false,
      status: 'active'
    };
    
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (duration) query.duration = duration;

    const journeys = await Journey.find(query)
      .select('name description price duration category images')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'meta.created_at': -1 });

    const total = await Journey.countDocuments(query);

    res.json({
      journeys,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get public journeys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/customer/journeys/:id
 * @desc    Get journey details for customers
 * @access  Private/Customer
 */
exports.getJourneyDetails = async (req, res) => {
  try {
    const journey = await Journey.findOne({
      _id: req.params.journeyId,
      'meta.isDeleted': false,
      status: 'active'
    }).select('name description pricing duration category destinations');

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found or inactive' });
    }

    res.json({ journey });

  } catch (error) {
    console.error('Get journey details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/guide/journeys
 * @desc    Get journeys assigned to current guide
 * @access  Private/Guide
 */
exports.getMyAssignedJourneys = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query for assigned journeys
    const query = { 
      guideId: req.user.id,
      'meta.isDeleted': false 
    };
    
    if (status) query.status = status;

    const journeys = await Journey.find(query)
      .select('name description price duration category status date')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'meta.created_at': -1 });

    const total = await Journey.countDocuments(query);

    res.json({
      journeys,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get my assigned journeys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/guide/journeys/:id
 * @desc    Get assigned journey details for guide
 * @access  Private/Guide
 */
exports.getMyJourneyDetails = async (req, res) => {
  try {
    const journey = await Journey.findOne({
      _id: req.params.id,
      guideId: req.user.id,
      'meta.isDeleted': false
    }).populate('providerId', 'name contact address');

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found or not assigned to you' });
    }

    res.json({ journey });

  } catch (error) {
    console.error('Get my journey details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/guide/schedule
 * @desc    Get guide's personal schedule
 * @access  Private/Guide
 */
exports.getMySchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date range query
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);

    // Get assigned journeys within date range
    const query = { 
      guideId: req.user.id,
      'meta.isDeleted': false 
    };
    
    if (Object.keys(dateQuery).length > 0) {
      query.date = dateQuery;
    }

    const journeys = await Journey.find(query)
      .select('name date duration status')
      .sort({ date: 1 });

    // Get bookings for these journeys
    const journeyIds = journeys.map(j => j._id);
    const bookings = await Booking.find({
      journeyId: { $in: journeyIds },
      'meta.isDeleted': false
    }).populate('customerId', 'email');

    // Combine journey and booking information
    const schedule = journeys.map(journey => {
      const journeyBookings = bookings.filter(b => b.journeyId.toString() === journey._id.toString());
      return {
        journey: {
          id: journey._id,
          name: journey.name,
          date: journey.date,
          duration: journey.duration,
          status: journey.status
        },
        bookings: journeyBookings.map(b => ({
          id: b._id,
          customerEmail: b.customerId.email,
          participants: b.participants,
          status: b.status
        }))
      };
    });

    res.json({ schedule });

  } catch (error) {
    console.error('Get my schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/journeys/search
 * @desc    Search journeys (Public)
 * @access  Public
 */
exports.searchPublicJourneys = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, duration, rating } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const query = { 
      'meta.isDeleted': false,
      status: 'active'
    };
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (duration) query.duration = duration;
    if (rating) query.rating = { $gte: parseFloat(rating) };

    const journeys = await Journey.find(query)
      .select('name description price duration category images rating')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1, 'meta.created_at': -1 });

    const total = await Journey.countDocuments(query);

    res.json({
      journeys,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Search journeys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/journeys/:id
 * @desc    Get public journey details
 * @access  Public
 */
exports.getPublicJourneyDetails = async (req, res) => {
  try {
    const journey = await Journey.findOne({
      _id: req.params.id,
      'meta.isDeleted': false,
      status: 'active'
    }).select('name description price duration category itinerary included excluded images rating');

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found or inactive' });
    }

    res.json({ journey });

  } catch (error) {
    console.error('Get public journey details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   POST /api/manager/journeys
 * @desc    Create new journey (Manager only)
 * @access  Private/Manager
 */
exports.createJourney = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      duration, 
      category, 
      itinerary, 
      included, 
      excluded, 
      images,
      guideId,
      providerId,
      maxParticipants,
      status = 'active'
    } = req.body;

    // Validation
    if (!name || !description || !price || !duration) {
      return res.status(400).json({ 
        error: 'Name, description, price, and duration are required' 
      });
    }

    if (price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    // Check if guide exists (if provided)
    if (guideId) {
      const guide = await User.findOne({ 
        _id: guideId, 
        role: 'guide',
        'meta.isDeleted': false 
      });
      
      if (!guide) {
        return res.status(404).json({ error: 'Guide not found' });
      }
    }

    // Create journey
    const journey = new Journey({
      name,
      description,
      price: parseFloat(price),
      duration,
      category,
      itinerary: itinerary || [],
      included: included || [],
      excluded: excluded || [],
      images: images || [],
      guideId,
      providerId,
      maxParticipants: maxParticipants || 20,
      status,
      meta: {
        created_by: req.user.id
      }
    });

    await journey.save();

    // Populate guide details for response
    if (guideId) {
      await journey.populate('guideId', 'firstname lastname email');
    }

    res.status(201).json({
      message: 'Journey created successfully',
      journey
    });

  } catch (error) {
    console.error('Create journey error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   PUT /api/manager/journeys/:id
 * @desc    Update journey (Manager only)
 * @access  Private/Manager
 */
exports.updateJourney = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      duration, 
      category, 
      itinerary, 
      included, 
      excluded, 
      images,
      guideId,
      providerId,
      maxParticipants,
      status
    } = req.body;

    const journey = await Journey.findById(req.params.id);

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    if (journey.meta.isDeleted) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    // Update fields
    if (name !== undefined) journey.name = name;
    if (description !== undefined) journey.description = description;
    if (price !== undefined) {
      if (price <= 0) {
        return res.status(400).json({ error: 'Price must be greater than 0' });
      }
      journey.price = parseFloat(price);
    }
    if (duration !== undefined) journey.duration = duration;
    if (category !== undefined) journey.category = category;
    if (itinerary !== undefined) journey.itinerary = itinerary;
    if (included !== undefined) journey.included = included;
    if (excluded !== undefined) journey.excluded = excluded;
    if (images !== undefined) journey.images = images;
    if (providerId !== undefined) journey.providerId = providerId;
    if (maxParticipants !== undefined) journey.maxParticipants = maxParticipants;
    if (status !== undefined) journey.status = status;

    // Check if guide exists (if provided)
    if (guideId !== undefined) {
      if (guideId) {
        const guide = await User.findOne({ 
          _id: guideId, 
          role: 'guide',
          'meta.isDeleted': false 
        });
        
        if (!guide) {
          return res.status(404).json({ error: 'Guide not found' });
        }
      }
      journey.guideId = guideId;
    }

    // Update meta
    journey.meta.updated_by = req.user.id;
    await journey.save();

    // Populate guide details for response
    if (journey.guideId) {
      await journey.populate('guideId', 'firstname lastname email');
    }

    res.json({
      message: 'Journey updated successfully',
      journey
    });

  } catch (error) {
    console.error('Update journey error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   DELETE /api/manager/journeys/:id
 * @desc    Delete journey (Manager only)
 * @access  Private/Manager
 */
exports.deleteJourney = async (req, res) => {
  try {
    const journey = await Journey.findById(req.params.id);

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    if (journey.meta.isDeleted) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    // Check if journey has active bookings
    const activeBookings = await Booking.countDocuments({
      journeyId: journey._id,
      status: { $in: ['pending', 'confirmed', 'in_progress'] },
      'meta.isDeleted': false
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete journey with active bookings' 
      });
    }

    // Soft delete
    journey.meta.delete();
    journey.meta.updated_by = req.user.id;
    await journey.save();

    res.json({
      message: 'Journey deleted successfully'
    });

  } catch (error) {
    console.error('Delete journey error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   POST /api/journeys/:id/assign-guide
 * @desc    Assign guide to journey (Agent/Manager only)
 * @access  Private/Agent/Manager
 */
exports.assignGuide = async (req, res) => {
  try {
    const { guideId, notes } = req.body;

    if (!guideId) {
      return res.status(400).json({ error: 'Guide ID is required' });
    }

    const journey = await Journey.findById(req.params.id);

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    if (journey.meta.isDeleted) {
      return res.status(404).json({ error: 'Journey not found' });
    }

    // Check if guide exists and has guide role
    const guide = await User.findOne({ 
      _id: guideId, 
      role: 'guide',
      'meta.isDeleted': false 
    });
    
    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    // Check if guide is available for the journey date
    if (journey.date) {
      const conflictingJourneys = await Journey.find({
        guideId: guideId,
        date: journey.date,
        'meta.isDeleted': false,
        _id: { $ne: journey._id }
      });

      if (conflictingJourneys.length > 0) {
        return res.status(400).json({ 
          error: 'Guide is already assigned to another journey on this date' 
        });
      }
    }

    // Assign guide
    journey.guideId = guideId;
    if (notes) {
      journey.assignmentNotes = notes;
    }

    // Update meta
    journey.meta.updated_by = req.user.id;
    await journey.save();

    // Populate guide details for response
    await journey.populate('guideId', 'firstname lastname email');

    res.json({
      message: 'Guide assigned successfully',
      journey: {
        id: journey._id,
        name: journey.name,
        guideId: journey.guideId,
        assignmentNotes: journey.assignmentNotes
      }
    });

  } catch (error) {
    console.error('Assign guide error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   PUT /api/guide/journeys/:id/status
 * @desc    Update journey status (Guide only)
 * @access  Private/Guide
 */
exports.updateJourneyStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['active', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const journey = await Journey.findOne({
      _id: req.params.id,
      guideId: req.user.id,
      'meta.isDeleted': false
    });

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found or not assigned to you' });
    }

    // Update status
    journey.status = status;
    if (notes) {
      journey.guideNotes = notes;
    }

    // Update meta
    journey.meta.updated_by = req.user.id;
    await journey.save();

    res.json({
      message: 'Journey status updated successfully',
      journey: {
        id: journey._id,
        name: journey.name,
        status: journey.status,
        guideNotes: journey.guideNotes
      }
    });

  } catch (error) {
    console.error('Update journey status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   POST /api/guide/journeys/:id/notes
 * @desc    Add notes to journey (Guide only)
 * @access  Private/Guide
 */
exports.addJourneyNotes = async (req, res) => {
  try {
    const { notes, type = 'general' } = req.body;

    if (!notes) {
      return res.status(400).json({ error: 'Notes are required' });
    }

    const journey = await Journey.findOne({
      _id: req.params.id,
      guideId: req.user.id,
      'meta.isDeleted': false
    });

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found or not assigned to you' });
    }

    // Add note to journey
    if (!journey.guideNotes) {
      journey.guideNotes = [];
    }

    journey.guideNotes.push({
      content: notes,
      type: type,
      timestamp: new Date(),
      guideId: req.user.id
    });

    // Update meta
    journey.meta.updated_by = req.user.id;
    await journey.save();

    res.json({
      message: 'Notes added successfully',
      notes: journey.guideNotes[journey.guideNotes.length - 1]
    });

  } catch (error) {
    console.error('Add journey notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/manager/journeys/stats
 * @desc    Get journey statistics (Manager only)
 * @access  Private/Manager
 */
exports.getJourneyStats = async (req, res) => {
  try {
    const totalJourneys = await Journey.countDocuments({ 'meta.isDeleted': false });
    const deletedJourneys = await Journey.countDocuments({ 'meta.isDeleted': true });
    
    const journeysByStatus = await Journey.aggregate([
      { $match: { 'meta.isDeleted': false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const journeysByCategory = await Journey.aggregate([
      { $match: { 'meta.isDeleted': false } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const recentJourneys = await Journey.countDocuments({
      'meta.created_at': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      'meta.isDeleted': false
    });

    const totalRevenue = await Journey.aggregate([
      { $match: { 'meta.isDeleted': false } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    res.json({
      stats: {
        total: totalJourneys,
        deleted: deletedJourneys,
        recent: recentJourneys,
        byStatus: journeysByStatus,
        byCategory: journeysByCategory,
        totalValue: totalRevenue[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Get journey stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/admin/export/journeys
 * @desc    Export journeys data (Admin only)
 * @access  Private/Admin
 */
exports.exportJourneys = async (req, res) => {
  try {
    const journeys = await Journey.find({ 'meta.isDeleted': false })
      .populate('guideId', 'firstname lastname email')
      .sort({ 'meta.created_at': -1 });

    res.json({ journeys });

  } catch (error) {
    console.error('Export journeys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
