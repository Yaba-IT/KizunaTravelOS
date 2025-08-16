/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/controllers/user.js - User management controller
* Handles user authentication, registration, and account management
*
* coded by farid212@Yaba-IT!
*/

const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Helper function to validate password strength
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Helper function to sanitize user data for response
const sanitizeUser = (user) => {
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.emailVerificationToken;
  delete userObj.passwordResetToken;
  delete userObj.twoFactorSecret;
  return userObj;
};

/**
 * @route   POST /api/users/register
 * @desc    Register a new user with profile
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { email, password, role, firstname, lastname, sexe } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      role: role || 'customer',
      meta: {
        created_by: req.user?.id || null
      }
    });

    await user.save();

    // Create profile
    const profile = new Profile({
      userId: user._id,
      firstname: firstname || '',
      lastname: lastname || '',
      sexe: sexe || 'X',
      role: role || 'customer',
      meta: {
        created_by: req.user?.id || null
      }
    });

    await profile.save();

    // Update user with profile reference
    user.profileId = profile._id;
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Return sanitized user data with profile
    const userResponse = sanitizeUser(user);
    userResponse.profile = profile;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error during registration' 
    });
  }
};

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({ 
        error: 'Account is temporarily locked due to multiple failed login attempts' 
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        error: 'Account is not active' 
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      await user.save();

      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Reset login attempts on successful login
    user.meta.loginAttempts = 0;
    user.meta.lockUntil = null;
    user.meta.lastLogin = new Date();
    user.meta.updated_by = user._id;
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Get profile
    const profile = await Profile.findById(user.profileId);

    // Return sanitized user data
    const userResponse = sanitizeUser(user);
    userResponse.profile = profile;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error during login' 
    });
  }
};

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile with complete information
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('profileId')
      .select('-password -emailVerificationToken -passwordResetToken -twoFactorSecret');

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile and user information
 * @access  Private
 */
exports.updateMe = async (req, res) => {
  try {
    const { email, password, currentPassword, firstname, lastname, sexe, ...updateData } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Update email if provided
    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          error: 'Email already in use' 
        });
      }
      user.email = email;
      user.emailVerified = false; // Reset email verification
    }

    // Update password if provided
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ 
          error: 'Current password is required to change password' 
        });
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ 
          error: 'Current password is incorrect' 
        });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({
          error: 'New password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
        });
      }

      user.password = password;
    }

    // Update other user fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'password' && key !== 'email' && user[key] !== undefined) {
        user[key] = updateData[key];
      }
    });

    user.meta.updated_by = req.user.id;
    await user.save();

    // Update profile if profile data is provided
    if (firstname || lastname || sexe) {
      const profile = await Profile.findById(user.profileId);
      if (profile) {
        if (firstname !== undefined) profile.firstname = firstname;
        if (lastname !== undefined) profile.lastname = lastname;
        if (sexe !== undefined) profile.sexe = sexe;
        profile.meta.updated_by = req.user.id;
        await profile.save();
      }
    }

    // Get updated user with profile
    const updatedUser = await User.findById(req.user.id)
      .populate('profileId')
      .select('-password -emailVerificationToken -passwordResetToken -twoFactorSecret');

    res.json({
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser)
    });

  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * @route   GET /api/users/me/profile
 * @desc    Get current user's profile only
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
 * @route   PUT /api/users/me/profile
 * @desc    Update current user's profile only
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
 * @route   POST /api/users/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent' 
      });
    }

    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    user.meta.updated_by = user._id;
    await user.save();

    // TODO: Send email with reset link
    // For now, just return the token (in production, send email)
    res.json({
      message: 'Password reset link sent to your email',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * @route   POST /api/users/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        error: 'Token and new password are required' 
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.meta.updated_by = user._id;
    await user.save();

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * @route   POST /api/users/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Verification token is required' 
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid verification token' 
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.meta.updated_by = user._id;
    await user.save();

    res.json({
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination (Admin only)
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { 'meta.isDeleted': false };
    
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query
    const users = await User.find(query)
      .populate('profileId')
      .select('-password -emailVerificationToken -passwordResetToken -twoFactorSecret')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'meta.created_at': -1 });

    const total = await User.countDocuments(query);

    res.json({
      users: users.map(user => sanitizeUser(user)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID with profile (Admin only)
 * @access  Private/Admin
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('profileId')
      .select('-password -emailVerificationToken -passwordResetToken -twoFactorSecret');

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    if (user.meta.isDeleted) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID with profile (Admin only)
 * @access  Private/Admin
 */
exports.updateUserById = async (req, res) => {
  try {
    const { password, firstname, lastname, sexe, ...updateData } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    if (user.meta.isDeleted) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Update password if provided
    if (password) {
      if (!validatePassword(password)) {
        return res.status(400).json({
          error: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
        });
      }
      user.password = password;
    }

    // Update other user fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'password' && user[key] !== undefined) {
        user[key] = updateData[key];
      }
    });

    user.meta.updated_by = req.user.id;
    await user.save();

    // Update profile if profile data is provided
    if (firstname || lastname || sexe) {
      const profile = await Profile.findById(user.profileId);
      if (profile) {
        if (firstname !== undefined) profile.firstname = firstname;
        if (lastname !== undefined) profile.lastname = lastname;
        if (sexe !== undefined) profile.sexe = sexe;
        profile.meta.updated_by = req.user.id;
        await profile.save();
      }
    }

    // Get updated user
    const updatedUser = await User.findById(req.params.id)
      .populate('profileId')
      .select('-password -emailVerificationToken -passwordResetToken -twoFactorSecret');

    res.json({
      message: 'User updated successfully',
      user: sanitizeUser(updatedUser)
    });

  } catch (error) {
    console.error('Update user by ID error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID (Admin only)
 * @access  Private/Admin
 */
exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    if (user.meta.isDeleted) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Soft delete user
    user.softDelete(req.user.id);
    await user.save();

    // Soft delete profile
    const profile = await Profile.findById(user.profileId);
    if (profile) {
      profile.meta.softDelete(req.user.id);
      await profile.save();
    }

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user by ID error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * @route   POST /api/users/:id/activate
 * @desc    Activate user account (Admin only)
 * @access  Private/Admin
 */
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    if (user.meta.isDeleted) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    user.status = 'active';
    user.meta.updated_by = req.user.id;
    await user.save();

    res.json({
      message: 'User activated successfully',
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * @route   POST /api/users/:id/deactivate
 * @desc    Deactivate user account (Admin only)
 * @access  Private/Admin
 */
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    if (user.meta.isDeleted) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    user.status = 'inactive';
    user.meta.updated_by = req.user.id;
    await user.save();

    res.json({
      message: 'User deactivated successfully',
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * @route   POST /api/users/:id/unlock
 * @desc    Unlock user account (Admin only)
 * @access  Private/Admin
 */
exports.unlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    if (user.meta.isDeleted) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Unlock account
    user.meta.loginAttempts = 0;
    user.meta.lockUntil = null;
    user.meta.updated_by = req.user.id;
    await user.save();

    res.json({
      message: 'User account unlocked successfully',
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error('Unlock user error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * @route   POST /api/users/logout
 * @desc    Logout user (invalidate token)
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    // In a real application, you might want to add the token to a blacklist
    // For now, we'll just return a success message
    res.json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (Admin only)
 * @access  Private/Admin
 */
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ 'meta.isDeleted': false });
    const activeUsers = await User.countDocuments({ 
      status: 'active', 
      'meta.isDeleted': false 
    });
    const pendingUsers = await User.countDocuments({ 
      status: 'pending', 
      'meta.isDeleted': false 
    });
    const suspendedUsers = await User.countDocuments({ 
      status: 'suspended', 
      'meta.isDeleted': false 
    });

    const roleStats = await User.aggregate([
      { $match: { 'meta.isDeleted': false } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const recentUsers = await User.countDocuments({
      'meta.created_at': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      'meta.isDeleted': false
    });

    res.json({
      stats: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
        suspended: suspendedUsers,
        recent: recentUsers,
        byRole: roleStats
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};
