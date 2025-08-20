/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/models/Journey.js - Journey model
* Defines the journey/tour schema for travel packages
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');

const journeySchema = new mongoose.Schema({
  // Basic information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true
  },

  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },

  shortDescription: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Category and type
  category: {
    type: String,
    enum: ['adventure', 'cultural', 'relaxation', 'business', 'family', 'romantic', 'educational', 'luxury'],
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: ['guided', 'self-guided', 'custom', 'group', 'private'],
    required: true
  },

  // Duration and schedule
  duration: {
    days: {
      type: Number,
      required: true,
      min: 1
    },
    nights: {
      type: Number,
      required: true,
      min: 0
    }
  },

  // Location information
  destinations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  }],

  // Pricing information
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
    },
    pricePerPerson: {
      type: Boolean,
      default: true
    },
    discounts: [{
      type: {
        type: String,
        enum: ['early_bird', 'group', 'seasonal', 'loyalty', 'promo']
      },
      percentage: {
        type: Number,
        min: 0,
        max: 100
      },
      validFrom: Date,
      validTo: Date,
      conditions: String
    }],
    includes: [{
      type: String,
      trim: true
    }],
    excludes: [{
      type: String,
      trim: true
    }]
  },

  // Capacity and availability
  capacity: {
    minParticipants: {
      type: Number,
      default: 1,
      min: 1
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 1
    },
    currentBookings: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Schedule and availability
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    availableDates: [{
      startDate: Date,
      endDate: Date,
      availableSpots: Number
    }],
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurrencePattern: {
      type: String,
      enum: ['weekly', 'monthly', 'seasonal', 'custom']
    }
  },

  // Itinerary
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    activities: [{
      time: String,
      activity: String,
      location: String,
      duration: String,
      description: String
    }],
    meals: {
      breakfast: { type: Boolean, default: false },
      lunch: { type: Boolean, default: false },
      dinner: { type: Boolean, default: false }
    },
    accommodation: {
      type: String,
      trim: true
    },
    transportation: {
      type: String,
      trim: true
    }
  }],

  // Requirements and restrictions
  requirements: {
    minimumAge: {
      type: Number,
      min: 0
    },
    maximumAge: {
      type: Number,
      min: 0
    },
    fitnessLevel: {
      type: String,
      enum: ['easy', 'moderate', 'challenging', 'difficult', 'expert']
    },
    specialRequirements: [{
      type: String,
      trim: true
    }],
    restrictions: [{
      type: String,
      trim: true
    }],
    requiredDocuments: [{
      type: String,
      trim: true
    }]
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

  // Reviews and ratings
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    date: {
      type: Date,
      default: Date.now
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  }],

  // Status and visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived', 'suspended'],
    default: 'draft',
    index: true
  },

  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },

  isPopular: {
    type: Boolean,
    default: false
  },

  // SEO and marketing
  seo: {
    title: {
      type: String,
      trim: true,
      maxlength: 60
    },
    description: {
      type: String,
      trim: true,
      maxlength: 160
    },
    keywords: [{
      type: String,
      trim: true
    }],
    slug: {
      type: String,
      trim: true,
      unique: true,
      index: true
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
journeySchema.index({ category: 1, status: 1 });
journeySchema.index({ 'pricing.basePrice': 1 });
journeySchema.index({ 'schedule.startDate': 1 });
journeySchema.index({ isFeatured: 1, status: 1 });
journeySchema.index({ 'meta.created_at': -1 });

// Virtual for average rating
journeySchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Virtual for review count
journeySchema.virtual('reviewCount').get(function() {
  return this.reviews ? this.reviews.length : 0;
});

// Virtual for availability
journeySchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.capacity.currentBookings < this.capacity.maxParticipants;
});

// Virtual for remaining spots
journeySchema.virtual('remainingSpots').get(function() {
  return this.capacity.maxParticipants - this.capacity.currentBookings;
});

// Pre-save middleware
journeySchema.pre('save', function(next) {
  this.meta.updated_at = new Date();
  this.meta.version += 1;
  
  // Generate slug if not provided
  if (!this.seo.slug && this.name) {
    this.seo.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  next();
});

// Pre-find middleware to exclude deleted records
journeySchema.pre(/^find/, function(next) {
  const query = this.getQuery();
  const options = this.getOptions();
  
  if (query.includeDeleted !== true && options?.includeDeleted !== true) {
    this.where({ 'meta.isDeleted': { $ne: true } });
  }
  next();
});

// Static method to get featured journeys
journeySchema.statics.getFeatured = function() {
  return this.find({ 
    isFeatured: true, 
    status: 'active',
    'meta.isDeleted': { $ne: true }
  }).sort({ 'meta.created_at': -1 });
};

// Static method to get popular journeys
journeySchema.statics.getPopular = function(limit = 10) {
  return this.find({ 
    isPopular: true, 
    status: 'active',
    'meta.isDeleted': { $ne: true }
  })
  .sort({ 'reviews.length': -1, averageRating: -1 })
  .limit(limit);
};

// Instance method to add review
journeySchema.methods.addReview = function(userId, rating, comment) {
  this.reviews.push({
    userId,
    rating,
    comment,
    date: new Date()
  });
  return this.save();
};

// Instance method to update capacity
journeySchema.methods.updateCapacity = function(change) {
  this.capacity.currentBookings += change;
  if (this.capacity.currentBookings < 0) {
    this.capacity.currentBookings = 0;
  }
  return this.save();
};

module.exports = mongoose.model('Journey', journeySchema);
