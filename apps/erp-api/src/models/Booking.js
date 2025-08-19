/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/models/Booking.js - Booking model
* Defines the booking schema for travel bookings
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Customer information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Journey information
  journeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Journey',
    required: true,
    index: true
  },

  // Guide information (optional)
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },

  // Booking details
  bookingDate: {
    type: Date,
    required: true,
    default: Date.now
  },

  travelDate: {
    type: Date,
    required: true
  },

  returnDate: {
    type: Date
  },

  // Passenger information
  passengers: [{
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    passportNumber: {
      type: String,
      trim: true,
      maxlength: 20
    },
    nationality: {
      type: String,
      trim: true,
      maxlength: 50
    },
    specialRequirements: {
      type: String,
      trim: true,
      maxlength: 500
    }
  }],

  // Pricing information
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },

  discount: {
    type: Number,
    default: 0,
    min: 0
  },

  tax: {
    type: Number,
    default: 0,
    min: 0
  },

  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },

  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },

  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'cash'],
    required: true
  },

  paymentDate: {
    type: Date
  },

  transactionId: {
    type: String,
    trim: true
  },

  // Booking status
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed', 'no_show'],
    default: 'pending',
    index: true
  },

  // Cancellation information
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: 500
  },

  cancellationDate: {
    type: Date
  },

  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Contact information
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },

  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
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
    relationship: {
      type: String,
      trim: true,
      maxlength: 50
    }
  },

  // Notes and comments
  customerNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  internalNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  // GDPR and compliance
  consentGiven: {
    type: Boolean,
    default: false,
    required: true
  },

  consentDate: {
    type: Date
  },

  dataRetentionDate: {
    type: Date
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
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ journeyId: 1, travelDate: 1 });
bookingSchema.index({ paymentStatus: 1, status: 1 });
bookingSchema.index({ 'meta.created_at': -1 });
bookingSchema.index({ travelDate: 1 });

// Virtual for booking duration
bookingSchema.virtual('duration').get(function() {
  if (this.returnDate && this.travelDate) {
    return Math.ceil((this.returnDate - this.travelDate) / (1000 * 60 * 60 * 24));
  }
  return 1; // Default to 1 day if no return date
});

// Virtual for passenger count
bookingSchema.virtual('passengerCount').get(function() {
  return this.passengers ? this.passengers.length : 0;
});

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  this.meta.updated_at = new Date();
  this.meta.version += 1;
  
  // Calculate total price if not set
  if (!this.totalPrice && this.basePrice) {
    this.totalPrice = this.basePrice - this.discount + this.tax;
  }
  
  next();
});

// Pre-find middleware to exclude deleted records
bookingSchema.pre(/^find/, function(next) {
  const query = this.getQuery();
  const options = this.getOptions();
  
  if (query.includeDeleted !== true && options?.includeDeleted !== true) {
    this.where({ 'meta.isDeleted': { $ne: true } });
  }
  next();
});

// Static method to get booking statistics
bookingSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      revenue: stat.totalRevenue
    };
    return acc;
  }, {});
};

// Instance method to cancel booking
bookingSchema.methods.cancelBooking = function(reason, userId) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancellationDate = new Date();
  this.meta.updated_by = userId;
  return this.save();
};

// Instance method to process payment
bookingSchema.methods.processPayment = function(paymentMethod, transactionId, userId) {
  this.paymentStatus = 'paid';
  this.paymentMethod = paymentMethod;
  this.transactionId = transactionId;
  this.paymentDate = new Date();
  this.meta.updated_by = userId;
  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);
