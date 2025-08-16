/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/controllers/profile.js - Profile management controller
* Manages user profile data and personal information
*
* coded by farid212@Yaba-IT!
*/

const Profile = require('../models/Profile');
const User = require('../models/User');

/**
 * @route   GET /api/profiles/me
 * @desc    Get current user's profile
 * @access  Private
 */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('profileId');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.profileId) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      profile: user.profileId,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });

  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   PUT /api/profiles/me
 * @desc    Update current user's profile
 * @access  Private
 */
exports.updateMyProfile = async (req, res) => {
  try {
    const { firstname, lastname, sexe } = req.body;

    const user = await User.findById(req.user.id).populate('profileId');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.profileId) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Update profile fields
    const profile = user.profileId;
    if (firstname !== undefined) profile.firstname = firstname;
    if (lastname !== undefined) profile.lastname = lastname;
    if (sexe !== undefined) profile.sexe = sexe;

    // Update meta
    profile.meta.updated_by = req.user.id;
    await profile.save();

    // Update user meta
    user.meta.updated_by = req.user.id;
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      profile: profile
    });

  } catch (error) {
    console.error('Update my profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/profiles/:id
 * @desc    Get profile by ID (Admin only)
 * @access  Private/Admin
 */
exports.getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (profile.meta.isDeleted) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get associated user info
    const user = await User.findOne({ profileId: profile._id })
      .select('email role status emailVerified twoFactorEnabled');

    res.json({
      profile: profile,
      user: user
    });

  } catch (error) {
    console.error('Get profile by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   PUT /api/profiles/:id
 * @desc    Update profile by ID (Admin only)
 * @access  Private/Admin
 */
exports.updateProfileById = async (req, res) => {
  try {
    const { firstname, lastname, sexe } = req.body;

    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (profile.meta.isDeleted) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Update profile fields
    if (firstname !== undefined) profile.firstname = firstname;
    if (lastname !== undefined) profile.lastname = lastname;
    if (sexe !== undefined) profile.sexe = sexe;

    // Update meta
    profile.meta.updated_by = req.user.id;
    await profile.save();

    res.json({
      message: 'Profile updated successfully',
      profile: profile
    });

  } catch (error) {
    console.error('Update profile by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/profiles
 * @desc    Get all profiles with pagination (Admin only)
 * @access  Private/Admin
 */
exports.getAllProfiles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { 'meta.isDeleted': false };
    
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query
    const profiles = await Profile.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'meta.created_at': -1 });

    const total = await Profile.countDocuments(query);

    // Get associated user info for each profile
    const profilesWithUsers = await Promise.all(
      profiles.map(async (profile) => {
        const user = await User.findOne({ profileId: profile._id })
          .select('email role status emailVerified');
        return {
          profile: profile,
          user: user
        };
      })
    );

    res.json({
      profiles: profilesWithUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   POST /api/profiles/:id/restore
 * @desc    Restore deleted profile (Admin only)
 * @access  Private/Admin
 */
exports.restoreProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (!profile.meta.isDeleted) {
      return res.status(400).json({ error: 'Profile is not deleted' });
    }

    // Restore profile
    profile.meta.restore();
    profile.meta.updated_by = req.user.id;
    await profile.save();

    // Restore associated user if it exists
    const user = await User.findOne({ profileId: profile._id });
    if (user) {
      user.meta.restore();
      user.meta.updated_by = req.user.id;
      await user.save();
    }

    res.json({
      message: 'Profile restored successfully',
      profile: profile
    });

  } catch (error) {
    console.error('Restore profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * @route   GET /api/profiles/stats
 * @desc    Get profile statistics (Admin only)
 * @access  Private/Admin
 */
exports.getProfileStats = async (req, res) => {
  try {
    const totalProfiles = await Profile.countDocuments({ 'meta.isDeleted': false });
    const deletedProfiles = await Profile.countDocuments({ 'meta.isDeleted': true });
    
    const profilesBySexe = await Profile.aggregate([
      { $match: { 'meta.isDeleted': false } },
      { $group: { _id: '$sexe', count: { $sum: 1 } } }
    ]);

    const recentProfiles = await Profile.countDocuments({
      'meta.created_at': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      'meta.isDeleted': false
    });

    res.json({
      stats: {
        total: totalProfiles,
        deleted: deletedProfiles,
        recent: recentProfiles,
        bySexe: profilesBySexe
      }
    });

  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
