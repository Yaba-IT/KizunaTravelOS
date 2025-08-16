/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/controllers/provider.js - Provider management controller
* Manages service providers and partner relationships
*
* coded by farid212@Yaba-IT!
*/

const Provider = require('../models/Provider');
const Journey = require('../models/Journey');

/**
 * @route   GET /api/providers
 * @desc    Get all providers (Agent/Manager only)
 * @access  Private/Agent/Manager
 */
exports.getAllProviders = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, rating, location } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { 'meta.isDeleted': false };
    
    if (type) query.type = type;
    if (rating) query.rating = { $gte: parseFloat(rating) };
    if (location) {
      query.$or = [
        { 'address.city': { $regex: location, $options: 'i' } },
        { 'address.country': { $regex: location, $options: 'i' } }
      ];
    }

    // Execute query
    const providers = await Provider.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'meta.created_at': -1 });

    const total = await Provider.countDocuments(query);

    res.json({
      providers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all providers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/providers/:id
 * @desc    Get provider by ID (Agent/Manager only)
 * @access  Private/Agent/Manager
 */
exports.getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    if (provider.meta.isDeleted) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json({ provider });

  } catch (error) {
    console.error('Get provider by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/public/providers
 * @desc    Get public provider information
 * @access  Public
 */
exports.getPublicProviders = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, rating, location } = req.query;
    const skip = (page - 1) * limit;

    // Build query for public providers
    const query = { 
      'meta.isDeleted': false,
      status: 'active'
    };
    
    if (type) query.type = type;
    if (rating) query.rating = { $gte: parseFloat(rating) };
    if (location) {
      query.$or = [
        { 'address.city': { $regex: location, $options: 'i' } },
        { 'address.country': { $regex: location, $options: 'i' } }
      ];
    }

    const providers = await Provider.find(query)
      .select('name type description rating address images')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1, 'meta.created_at': -1 });

    const total = await Provider.countDocuments(query);

    res.json({
      providers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get public providers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/public/providers/:id
 * @desc    Get public provider details
 * @access  Public
 */
exports.getPublicProviderDetails = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      _id: req.params.id,
      'meta.isDeleted': false,
      status: 'active'
    }).select('name type description rating address images contact website');

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found or inactive' });
    }

    res.json({ provider });

  } catch (error) {
    console.error('Get public provider details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   POST /api/manager/providers
 * @desc    Create new provider (Manager only)
 * @access  Private/Manager
 */
exports.createProvider = async (req, res) => {
  try {
    const { 
      name, 
      type, 
      description, 
      contact, 
      address, 
      website, 
      rating = 0,
      status = 'active',
      images = []
    } = req.body;

    // Validation
    if (!name || !type) {
      return res.status(400).json({ 
        error: 'Name and type are required' 
      });
    }

    // Validate provider type
    const validTypes = ['hotel', 'restaurant', 'transport', 'activity', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid provider type' 
      });
    }

    // Validate rating
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 0 and 5' 
      });
    }

    // Check if provider with same name already exists
    const existingProvider = await Provider.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      'meta.isDeleted': false
    });

    if (existingProvider) {
      return res.status(409).json({ 
        error: 'Provider with this name already exists' 
      });
    }

    // Create provider
    const provider = new Provider({
      name,
      type,
      description,
      contact,
      address,
      website,
      rating: parseFloat(rating),
      status,
      images,
      meta: {
        created_by: req.user.id
      }
    });

    await provider.save();

    res.status(201).json({
      message: 'Provider created successfully',
      provider
    });

  } catch (error) {
    console.error('Create provider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   PUT /api/manager/providers/:id
 * @desc    Update provider (Manager only)
 * @access  Private/Manager
 */
exports.updateProvider = async (req, res) => {
  try {
    const { 
      name, 
      type, 
      description, 
      contact, 
      address, 
      website, 
      rating,
      status,
      images
    } = req.body;

    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    if (provider.meta.isDeleted) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Update fields
    if (name !== undefined) {
      // Check if new name conflicts with existing provider
      if (name !== provider.name) {
        const existingProvider = await Provider.findOne({
          name: { $regex: new RegExp(`^${name}$`, 'i') },
          'meta.isDeleted': false,
          _id: { $ne: provider._id }
        });

        if (existingProvider) {
          return res.status(409).json({ 
            error: 'Provider with this name already exists' 
          });
        }
      }
      provider.name = name;
    }

    if (type !== undefined) {
      const validTypes = ['hotel', 'restaurant', 'transport', 'activity', 'other'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid provider type' });
      }
      provider.type = type;
    }

    if (description !== undefined) provider.description = description;
    if (contact !== undefined) provider.contact = contact;
    if (address !== undefined) provider.address = address;
    if (website !== undefined) provider.website = website;
    if (images !== undefined) provider.images = images;
    if (status !== undefined) provider.status = status;

    if (rating !== undefined) {
      if (rating < 0 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 0 and 5' });
      }
      provider.rating = parseFloat(rating);
    }

    // Update meta
    provider.meta.updated_by = req.user.id;
    await provider.save();

    res.json({
      message: 'Provider updated successfully',
      provider
    });

  } catch (error) {
    console.error('Update provider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   PUT /api/agent/providers/:id
 * @desc    Update provider (Agent only - limited fields)
 * @access  Private/Agent
 */
exports.updateProviderLimited = async (req, res) => {
  try {
    const { 
      description, 
      contact, 
      address, 
      website, 
      images
    } = req.body;

    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    if (provider.meta.isDeleted) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Update only allowed fields for agents
    if (description !== undefined) provider.description = description;
    if (contact !== undefined) provider.contact = contact;
    if (address !== undefined) provider.address = address;
    if (website !== undefined) provider.website = website;
    if (images !== undefined) provider.images = images;

    // Update meta
    provider.meta.updated_by = req.user.id;
    await provider.save();

    res.json({
      message: 'Provider updated successfully',
      provider
    });

  } catch (error) {
    console.error('Update provider limited error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   DELETE /api/manager/providers/:id
 * @desc    Delete provider (Manager only)
 * @access  Private/Manager
 */
exports.deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    if (provider.meta.isDeleted) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Check if provider is used in any active journeys
    const activeJourneys = await Journey.countDocuments({
      providerId: provider._id,
      'meta.isDeleted': false,
      status: 'active'
    });

    if (activeJourneys > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete provider with active journeys' 
      });
    }

    // Soft delete
    provider.meta.delete();
    provider.meta.updated_by = req.user.id;
    await provider.save();

    res.json({
      message: 'Provider deleted successfully'
    });

  } catch (error) {
    console.error('Delete provider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   POST /api/manager/providers/:id/restore
 * @desc    Restore deleted provider (Manager only)
 * @access  Private/Manager
 */
exports.restoreProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    if (!provider.meta.isDeleted) {
      return res.status(400).json({ error: 'Provider is not deleted' });
    }

    // Restore provider
    provider.meta.restore();
    provider.meta.updated_by = req.user.id;
    await provider.save();

    res.json({
      message: 'Provider restored successfully',
      provider
    });

  } catch (error) {
    console.error('Restore provider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/manager/providers/stats
 * @desc    Get provider statistics (Manager only)
 * @access  Private/Manager
 */
exports.getProviderStats = async (req, res) => {
  try {
    const totalProviders = await Provider.countDocuments({ 'meta.isDeleted': false });
    const deletedProviders = await Provider.countDocuments({ 'meta.isDeleted': true });
    
    const providersByType = await Provider.aggregate([
      { $match: { 'meta.isDeleted': false } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const providersByRating = await Provider.aggregate([
      { $match: { 'meta.isDeleted': false } },
      { $group: { _id: { $floor: '$rating' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const recentProviders = await Provider.countDocuments({
      'meta.created_at': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      'meta.isDeleted': false
    });

    const averageRating = await Provider.aggregate([
      { $match: { 'meta.isDeleted': false, rating: { $gt: 0 } } },
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);

    res.json({
      stats: {
        total: totalProviders,
        deleted: deletedProviders,
        recent: recentProviders,
        byType: providersByType,
        byRating: providersByRating,
        averageRating: averageRating[0]?.average || 0
      }
    });

  } catch (error) {
    console.error('Get provider stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/manager/providers/search
 * @desc    Search providers (Manager only)
 * @access  Private/Manager
 */
exports.searchProviders = async (req, res) => {
  try {
    const { q, type, minRating, maxRating, location } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const query = { 'meta.isDeleted': false };
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (type) query.type = type;
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }
    if (location) {
      query.$or = [
        { 'address.city': { $regex: location, $options: 'i' } },
        { 'address.country': { $regex: location, $options: 'i' } }
      ];
    }

    const providers = await Provider.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1, 'meta.created_at': -1 });

    const total = await Provider.countDocuments(query);

    res.json({
      providers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Search providers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
