/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/models/User.js - User data model
* Defines user schema and authentication methods
*
* coded by farid212@Yaba-IT!
*/

const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const metaSchema = require('./Meta');

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(password) {
        // At least one uppercase, one lowercase, one number, one special character 
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        return passwordRegex.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  role: {
    type: String,
    required: [true, 'User role is required'],
    enum: {
      values: ['customer', 'guide', 'manager', 'agent', 'admin'],
      message: 'Role must be one of: customer, guide, manager, agent, admin'
    },
    default: 'customer'
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'suspended', 'pending'],
      message: 'Status must be one of: active, inactive, suspended, pending'
    },
    default: 'pending'
  },
  profileId: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: [true, 'Profile reference is required']
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  meta: {
    type: metaSchema,
    default: () => ({})
  }
}, {
  timestamps: false, // We handle timestamps through Meta schema
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name (if you want to access profile data)
userSchema.virtual('fullName').get(function() {
  // This would need to be populated or you could use aggregation
  return this.profileId ? `${this.profileId.firstname} ${this.profileId.lastname}` : '';
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ profileId: 1 });
userSchema.index({ 'meta.isActive': 1 });
userSchema.index({ 'meta.isDeleted': 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Remove the problematic profile creation middleware - profiles should be created explicitly
// Pre-save middleware to ensure meta exists
userSchema.pre('save', function(next) {
  if (!this.meta) {
    this.meta = {};
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if account is locked (delegated to meta)
userSchema.methods.isLocked = function() {
  return this.meta ? this.meta.isLocked() : false;
};

// Instance method to increment login attempts (delegated to meta)
userSchema.methods.incLoginAttempts = function() {
  if (this.meta) {
    this.meta.incLoginAttempts();
  }
};

// Instance method to soft delete (delegated to meta)
userSchema.methods.softDelete = function(userId) {
  if (this.meta) {
    this.meta.softDelete(userId);
  }
  this.status = 'inactive';
};

// Instance method to restore (delegated to meta)
userSchema.methods.restore = function() {
  if (this.meta) {
    this.meta.restore();
  }
  this.status = 'pending';
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ 
    status: 'active',
    'meta.isActive': true,
    'meta.isDeleted': false
  });
};

// Static method to find non-deleted users
userSchema.statics.findNonDeleted = function() {
  return this.find({ 'meta.isDeleted': false });
};

module.exports = model('User', userSchema);