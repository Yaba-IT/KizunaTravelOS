/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/controllers/booking.js - Booking management controller
* Handles travel booking operations and management
*
* coded by farid212@Yaba-IT!
*/

const Booking = require('../models/Booking');
const User = require('../models/User');
const Journey = require('../models/Journey');

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings (Agent/Manager only)
 * @access  Private/Agent/Manager
 */
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerId, journeyId, date } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { 'meta.isDeleted': false };
    
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    if (journeyId) query.journeyId = journeyId;
    if (date) query.date = date;

    // Execute query
    const bookings = await Booking.find(query)
      .populate('customerId', 'email role status')
      .populate('journeyId', 'name price duration')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'meta.created_at': -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID (Agent/Manager only)
 * @access  Private/Agent/Manager
 */
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'email role status')
      .populate('journeyId', 'name price duration category')
      .populate('guideId', 'firstname lastname');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.meta.isDeleted) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/customer/bookings
 * @desc    Get current user's bookings
 * @access  Private/Customer
 */
exports.getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query for current user
    const query = { 
      customerId: req.user._id,
      'meta.isDeleted': false 
    };
    
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('journeyId', 'name price duration category')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'meta.created_at': -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/customer/bookings/:id
 * @desc    Get current user's specific booking
 * @access  Private/Customer
 */
exports.getMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customerId: req.user._id,
      'meta.isDeleted': false
    }).populate('journeyId', 'name price duration category itinerary');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking });

  } catch (error) {
    console.error('Get my booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   POST /api/customer/bookings
 * @desc    Create new booking (Customer)
 * @access  Private/Customer
 */
exports.createBooking = async (req, res) => {
  try {
    const { journeyId, date, participants = 1, specialRequests } = req.body;

    // Validation
    if (!journeyId || !date) {
      return res.status(400).json({ 
        error: 'Journey ID and date are required' 
      });
    }

    // Check if journey exists and is active
    const journey = await Journey.findOne({ 
      _id: journeyId, 
      'meta.isDeleted': false,
      status: 'active'
    });

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found or inactive' });
    }

    // Check if date is in the future
    const bookingDate = new Date(date);
    if (bookingDate <= new Date()) {
      return res.status(400).json({ error: 'Booking date must be in the future' });
    }

    // Calculate total price
    const totalPrice = journey.pricing.basePrice * participants;

    // Create booking
    const booking = new Booking({
      customerId: req.user._id,
      journeyId,
      travelDate: bookingDate,
      basePrice: journey.pricing.basePrice,
      totalPrice,
      contactEmail: req.user.email,
      contactPhone: req.user.phone || '+1234567890', // Default if not available
      paymentMethod: 'credit_card', // Default payment method
      status: 'pending',
      meta: {
        created_by: req.user._id
      }
    });

    await booking.save();

    // Populate journey details for response
    await booking.populate('journeyId', 'name price duration');

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   POST /api/agent/bookings
 * @desc    Create booking for customer (Agent)
 * @access  Private/Agent
 */
exports.createBookingForCustomer = async (req, res) => {
  try {
    const { customerId, journeyId, date, participants = 1, specialRequests } = req.body;

    // Validation
    if (!customerId || !journeyId || !date) {
      return res.status(400).json({ 
        error: 'Customer ID, journey ID, and date are required' 
      });
    }

    // Check if customer exists
    const customer = await User.findOne({ 
      _id: customerId, 
      'meta.isDeleted': false 
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if journey exists and is active
    const journey = await Journey.findOne({ 
      _id: journeyId, 
      'meta.isDeleted': false,
      status: 'active'
    });

    if (!journey) {
      return res.status(404).json({ error: 'Journey not found or inactive' });
    }

    // Check if date is in the future
    const bookingDate = new Date(date);
    if (bookingDate <= new Date()) {
      return res.status(400).json({ error: 'Booking date must be in the future' });
    }

    // Calculate total price
    const totalPrice = journey.price * participants;

    // Create booking
    const booking = new Booking({
      customerId,
      journeyId,
      date: bookingDate,
      participants,
      totalPrice,
      specialRequests,
      status: 'pending',
      meta: {
        created_by: req.user._id
      }
    });

    await booking.save();

    // Populate details for response
    await booking.populate('customerId', 'email role');
    await booking.populate('journeyId', 'name price duration');

    res.status(201).json({
      message: 'Booking created successfully for customer',
      booking
    });

  } catch (error) {
    console.error('Create booking for customer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   PUT /api/customer/bookings/:id
 * @desc    Update current user's booking
 * @access  Private/Customer
 */
exports.updateMyBooking = async (req, res) => {
  try {
    const { date, participants, specialRequests } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customerId: req.user._id,
      'meta.isDeleted': false
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if booking can be updated (not confirmed or completed)
    if (['confirmed', 'completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ 
        error: 'Cannot update booking in current status' 
      });
    }

    // Update fields
    if (date) {
      const bookingDate = new Date(date);
      if (bookingDate <= new Date()) {
        return res.status(400).json({ error: 'Booking date must be in the future' });
      }
      booking.date = bookingDate;
    }

    if (participants) {
      booking.participants = participants;
      // Recalculate total price
      const journey = await Journey.findById(booking.journeyId);
      if (journey) {
        booking.totalPrice = journey.pricing.basePrice * participants;
      }
    }

    if (specialRequests !== undefined) {
      booking.specialRequests = specialRequests;
    }

    // Update meta
    booking.meta.updated_by = req.user._id;
    await booking.save();

    // Populate journey details for response
    await booking.populate('journeyId', 'name pricing duration');

    res.json({
      message: 'Booking updated successfully',
      booking
    });

  } catch (error) {
    console.error('Update my booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update booking (Agent/Manager only)
 * @access  Private/Agent/Manager
 */
exports.updateBooking = async (req, res) => {
  try {
    const { date, participants, specialRequests, status } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.meta.isDeleted) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update fields
    if (date) {
      const bookingDate = new Date(date);
      if (bookingDate <= new Date()) {
        return res.status(400).json({ error: 'Booking date must be in the future' });
      }
      booking.date = bookingDate;
    }

    if (participants) {
      booking.participants = participants;
      // Recalculate total price
      const journey = await Journey.findById(booking.journeyId);
      if (journey) {
        booking.totalPrice = journey.pricing.basePrice * participants;
      }
    }

    if (specialRequests !== undefined) {
      booking.specialRequests = specialRequests;
    }

    if (status) {
      booking.status = status;
    }

    // Update meta
    booking.meta.updated_by = req.user._id;
    await booking.save();

    // Populate details for response
    await booking.populate('customerId', 'email role');
    await booking.populate('journeyId', 'name pricing duration');

    res.json({
      message: 'Booking updated successfully',
      booking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   POST /api/bookings/:id/status
 * @desc    Update booking status (Agent/Manager/Guide)
 * @access  Private/Agent/Manager/Guide
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.meta.isDeleted) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update status
    booking.status = status;
    if (notes) {
      booking.notes = notes;
    }

    // Update meta
    booking.meta.updated_by = req.user.id;
    await booking.save();

    res.json({
      message: 'Booking status updated successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        notes: booking.notes
      }
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   DELETE /api/customer/bookings/:id
 * @desc    Cancel current user's booking
 * @access  Private/Customer
 */
exports.cancelMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customerId: req.user._id,
      'meta.isDeleted': false
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ 
        error: 'Cannot cancel booking in current status' 
      });
    }

    // Update status to cancelled
    booking.status = 'cancelled';
    booking.meta.updated_by = req.user._id;
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking: {
        id: booking._id,
        status: booking.status
      }
    });

  } catch (error) {
    console.error('Cancel my booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   DELETE /api/manager/bookings/:id
 * @desc    Delete booking (Manager only)
 * @access  Private/Manager
 */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.meta.isDeleted) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Soft delete
    booking.meta.delete();
    booking.meta.updated_by = req.user._id;
    await booking.save();

    res.json({
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/guide/bookings
 * @desc    Get bookings assigned to current guide
 * @access  Private/Guide
 */
exports.getMyAssignedBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Get journeys assigned to this guide
    const assignedJourneys = await Journey.find({
      guideId: req.user._id,
      'meta.isDeleted': false
    }).select('_id');

    const journeyIds = assignedJourneys.map(j => j._id);

    // Build query for bookings on assigned journeys
    const query = { 
      journeyId: { $in: journeyIds },
      'meta.isDeleted': false 
    };
    
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('customerId', 'email')
      .populate('journeyId', 'name date')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'meta.created_at': -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get my assigned bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/guide/bookings/:id
 * @desc    Get specific booking assigned to current guide
 * @access  Private/Guide
 */
exports.getMyAssignedBooking = async (req, res) => {
  try {
    // Check if guide is assigned to this journey
    const booking = await Booking.findById(req.params.id)
      .populate('journeyId', 'guideId name date');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.meta.isDeleted) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify guide assignment
    if (booking.journeyId.guideId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to view this booking' });
    }

    // Populate customer details
    await booking.populate('customerId', 'email');

    res.json({ booking });

  } catch (error) {
    console.error('Get my assigned booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/manager/bookings/stats
 * @desc    Get booking statistics (Manager only)
 * @access  Private/Manager
 */
exports.getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ 'meta.isDeleted': false });
    const deletedBookings = await Booking.countDocuments({ 'meta.isDeleted': true });
    
    const bookingsByStatus = await Booking.aggregate([
      { $match: { 'meta.isDeleted': false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentBookings = await Booking.countDocuments({
      'meta.created_at': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      'meta.isDeleted': false
    });

    const totalRevenue = await Booking.aggregate([
      { $match: { 'meta.isDeleted': false, status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      stats: {
        total: totalBookings,
        deleted: deletedBookings,
        recent: recentBookings,
        byStatus: bookingsByStatus,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/admin/export/bookings
 * @desc    Export bookings data (Admin only)
 * @access  Private/Admin
 */
exports.exportBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ 'meta.isDeleted': false })
      .populate('customerId', 'email firstname lastname')
      .populate('journeyId', 'name category')
      .populate('guideId', 'firstname lastname')
      .sort({ 'meta.created_at': -1 });

    res.json({ bookings });

  } catch (error) {
    console.error('Export bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
