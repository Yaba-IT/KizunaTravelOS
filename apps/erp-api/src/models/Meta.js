/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/models/Meta.js - Metadata schema for tracking and auditing
* Provides audit trail and data lifecycle management
*
* coded by farid212@Yaba-IT!
*/

const { Schema } = require('mongoose');

const metaSchema = new Schema({
  // Timestamps
  created_at: {
    type: Date,
    default: Date.now,
    required: true
  },
  updated_at: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // User tracking
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  updated_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  // Login and security tracking
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  
  // Status and flags
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deleted_at: {
    type: Date,
    default: null
  },
  deleted_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  _id: false, // Don't create _id for embedded documents
  timestamps: false // We handle timestamps manually
});

// Pre-save middleware to update timestamps
metaSchema.pre('save', function(next) {
  if (this.isNew) {
    this.created_at = new Date();
  }
  this.updated_at = new Date();
  next();
});

// Instance method to soft delete
metaSchema.methods.softDelete = function(userId) {
  this.isDeleted = true;
  this.deleted_at = new Date();
  this.deleted_by = userId;
  this.isActive = false;
};

// Instance method to restore
metaSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deleted_at = null;
  this.deleted_by = null;
  this.isActive = true;
};

// Instance method to check if account is locked
metaSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Instance method to increment login attempts
metaSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.lockUntil = null;
    this.loginAttempts = 1;
  } else {
    this.loginAttempts += 1;
  }
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts >= 5 && !this.isLocked()) {
    this.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  }
};

module.exports = metaSchema;
