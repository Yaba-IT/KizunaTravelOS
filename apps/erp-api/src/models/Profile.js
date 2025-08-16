/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/models/Profile.js - User profile data model
* Defines profile schema with role-specific fields
*
* coded by farid212@Yaba-IT!
*/

const { Schema, model } = require('mongoose');
const metaSchema = require('./Meta');

const profileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // Remove unique constraint to avoid circular reference issues
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    default: '',
  },
  sexe: {
    type: String,
    default: 'X',
    enum: ['F', 'M', 'X'],
  },
  // Add role-specific fields for better profile management
  role: {
    type: String,
    enum: ['customer', 'guide', 'manager', 'agent', 'admin'],
    required: true
  },
  // Add contact information
  phone: {
    type: String,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    postalCode: { type: String, default: '' }
  },
  // Add availability for guides
  availability: {
    isAvailable: { type: Boolean, default: true },
    availableDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    availableHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    }
  },
  meta: {
    type: metaSchema,
    default: () => ({})
  }
}, {
  timestamps: false // We handle timestamps through Meta schema
});

// Pre-save middleware to ensure meta exists
profileSchema.pre('save', function(next) {
  if (!this.meta) {
    this.meta = {};
  }
  next();
});

// Virtual for full name
profileSchema.virtual('fullName').get(function() {
  return `${this.firstname} ${this.lastname}`.trim();
});

// Indexes
profileSchema.index({ userId: 1 });
profileSchema.index({ role: 1 });
profileSchema.index({ 'meta.isActive': 1 });
profileSchema.index({ 'meta.isDeleted': 1 });

module.exports = model('Profile', profileSchema);
