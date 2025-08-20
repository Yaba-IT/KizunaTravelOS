/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/models/Provider.js - Provider model
* Defines the provider/partner schema for service providers
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  // Basic information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true
  },

  legalName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },

  // Business information
  type: {
    type: String,
    enum: ['hotel', 'transport', 'activity', 'restaurant', 'guide', 'agency', 'supplier', 'other'],
    required: true,
    index: true
  },

  category: {
    type: String,
    enum: ['premium', 'standard', 'budget', 'luxury', 'boutique'],
    default: 'standard'
  },

  // Contact information
  contact: {
    primaryContact: {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      },
      position: {
        type: String,
        trim: true,
        maxlength: 100
      }
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        maxlength: 100
      },
      phone: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
    },
    website: {
      type: String,
      trim: true
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String
    }
  },

  // Address information
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    state: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Business details
  business: {
    registrationNumber: {
      type: String,
      trim: true
    },
    taxId: {
      type: String,
      trim: true
    },
    licenseNumber: {
      type: String,
      trim: true
    },
    insuranceNumber: {
      type: String,
      trim: true
    },
    foundingDate: {
      type: Date
    },
    employeeCount: {
      type: Number,
      min: 1
    }
  },

  // Services and capabilities
  services: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    priceRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],

  // Specializations
  specializations: [{
    type: String,
    trim: true
  }],

  // Operating hours
  operatingHours: {
    monday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    },
    sunday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true }
    }
  },

  // Capacity and availability
  capacity: {
    maxGuests: {
      type: Number,
      min: 1
    },
    maxGroups: {
      type: Number,
      min: 1
    },
    currentBookings: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Quality and ratings
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    breakdown: {
      one: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      five: { type: Number, default: 0 }
    }
  },

  // Certifications and awards
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      trim: true
    },
    issueDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    certificateNumber: {
      type: String,
      trim: true
    }
  }],

  // Financial information
  financial: {
    paymentTerms: {
      type: String,
      enum: ['immediate', 'net_15', 'net_30', 'net_60', 'custom'],
      default: 'net_30'
    },
    preferredPaymentMethods: [{
      type: String,
      enum: ['bank_transfer', 'credit_card', 'paypal', 'check', 'cash']
    }],
    commissionRate: {
      type: Number,
      min: 0,
      max: 100
    },
    creditLimit: {
      type: Number,
      min: 0
    }
  },

  // Contract and agreement
  contract: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    terms: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    isActive: {
      type: Boolean,
      default: true
    },
    autoRenew: {
      type: Boolean,
      default: false
    }
  },

  // Images and media
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // Status and visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending', 'archived'],
    default: 'pending',
    index: true
  },

  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  // Notes and comments
  notes: {
    internal: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    public: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },

  // Metadata
  meta: {
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deleted_at: {
      type: Date
    },
    deleted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    version: {
      type: Number,
      default: 1
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
providerSchema.index({ type: 1, status: 1 });
providerSchema.index({ 'address.city': 1, 'address.country': 1 });
providerSchema.index({ rating: -1 });
providerSchema.index({ isVerified: 1, status: 1 });
providerSchema.index({ 'meta.created_at': -1 });

// Virtual for full address
providerSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state || ''} ${addr.postalCode || ''}, ${addr.country}`.replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '');
});

// Virtual for average rating
providerSchema.virtual('averageRatingFormatted').get(function() {
  return this.rating.average.toFixed(1);
});

// Virtual for availability
providerSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.contract.isActive;
});

// Pre-save middleware
providerSchema.pre('save', function(next) {
  this.meta.updated_at = new Date();
  this.meta.version += 1;
  
  // Calculate average rating
  if (this.rating.count > 0) {
    const total = this.rating.breakdown.one + 
                  this.rating.breakdown.two * 2 + 
                  this.rating.breakdown.three * 3 + 
                  this.rating.breakdown.four * 4 + 
                  this.rating.breakdown.five * 5;
    this.rating.average = total / this.rating.count;
  }
  
  next();
});

// Pre-find middleware to exclude deleted records
providerSchema.pre(/^find/, function(next) {
  if (this.getQuery().includeDeleted !== true) {
    this.where({ 'meta.isDeleted': { $ne: true } });
  }
  next();
});

// Static method to get verified providers
providerSchema.statics.getVerified = function() {
  return this.find({ 
    isVerified: true, 
    status: 'active',
    'meta.isDeleted': { $ne: true }
  }).sort({ rating: -1 });
};

// Static method to get providers by type
providerSchema.statics.getByType = function(type) {
  return this.find({ 
    type, 
    status: 'active',
    'meta.isDeleted': { $ne: true }
  }).sort({ rating: -1 });
};

// Instance method to add rating
providerSchema.methods.addRating = function(rating) {
  if (rating >= 1 && rating <= 5) {
    this.rating.count += 1;
    this.rating.breakdown[rating === 1 ? 'one' : 
                         rating === 2 ? 'two' : 
                         rating === 3 ? 'three' : 
                         rating === 4 ? 'four' : 'five'] += 1;
    return this.save();
  }
  throw new Error('Rating must be between 1 and 5');
};

// Instance method to update capacity
providerSchema.methods.updateCapacity = function(change) {
  this.capacity.currentBookings += change;
  if (this.capacity.currentBookings < 0) {
    this.capacity.currentBookings = 0;
  }
  return this.save();
};

module.exports = mongoose.model('Provider', providerSchema);
