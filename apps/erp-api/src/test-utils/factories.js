/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/test-utils/factories.js - Test data factories
* Provides reusable test data creation utilities
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');

/**
 * Create test user data
 * @param {Object} overrides - Override default values
 * @returns {Object} User data object
 */
const createTestUserData = (overrides = {}) => ({
  email: 'test@example.com',
  password: 'SecurePass123!',
  role: 'customer',
  status: 'active',
  ...overrides
});

/**
 * Create test profile data
 * @param {Object} overrides - Override default values
 * @returns {Object} Profile data object
 */
const createTestProfileData = (overrides = {}) => ({
  firstname: 'John',
  lastname: 'Doe',
  role: 'customer',
  sexe: 'M',
  ...overrides
});

/**
 * Create test journey data
 * @param {Object} overrides - Override default values
 * @returns {Object} Journey data object
 */
const createTestJourneyData = (overrides = {}) => ({
  name: 'Test Journey',
  description: 'A test journey description',
  category: 'cultural',
  type: 'guided',
  duration: {
    days: 3,
    nights: 2
  },
  schedule: {
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-03')
  },
  capacity: {
    maxParticipants: 20,
    minParticipants: 1
  },
  pricing: {
    basePrice: 150.00,
    currency: 'USD'
  },
  destinations: [{
    name: 'Test City',
    country: 'Test Country',
    city: 'Test City'
  }],
  status: 'active',
  ...overrides
});

/**
 * Create test booking data
 * @param {Object} overrides - Override default values
 * @returns {Object} Booking data object
 */
const createTestBookingData = (overrides = {}) => ({
  travelDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  basePrice: 100.00,
  totalPrice: 200.00,
  contactEmail: 'customer@example.com',
  contactPhone: '+1234567890',
  paymentMethod: 'credit_card',
  participants: 2,
  status: 'pending',
  meta: {
    isDeleted: false
  },
  ...overrides
});

/**
 * Create test provider data
 * @param {Object} overrides - Override default values
 * @returns {Object} Provider data object
 */
const createTestProviderData = (overrides = {}) => ({
  name: 'Test Hotel',
  type: 'hotel',
  legalName: 'Test Hotel LLC',
  description: 'A test hotel provider',
  address: {
    street: '123 Test Street',
    city: 'Test City',
    country: 'Test Country',
    postalCode: '12345'
  },
  contact: {
    primaryContact: {
      name: 'John Doe',
      email: 'john@testhotel.com',
      phone: '+1234567890'
    }
  },
  rating: 4.5,
  status: 'active',
  ...overrides
});

/**
 * Create a user with profile (helper function)
 * @param {Object} userData - User data
 * @param {Object} profileData - Profile data
 * @returns {Promise<{user: Object, profile: Object}>}
 */
const createUserWithProfile = async (userData = {}, profileData = {}) => {
  const Profile = require('../models/Profile');
  const User = require('../models/User');

  const profile = new Profile({
    userId: new mongoose.Types.ObjectId(),
    ...createTestProfileData(profileData)
  });
  await profile.save();

  const user = new User({
    ...createTestUserData(userData),
    profileId: profile._id
  });
  await user.save();

  // Update profile with actual user ID
  profile.userId = user._id;
  await profile.save();

  return { user, profile };
};

/**
 * Create mock request object
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock request object
 */
const createMockRequest = (overrides = {}) => ({
  user: {
    id: new mongoose.Types.ObjectId().toString(),
    _id: new mongoose.Types.ObjectId(),
    email: 'test@example.com',
    role: 'customer'
  },
  body: {},
  params: {},
  query: {},
  ...overrides
});

/**
 * Create mock response object
 * @param {Object} overrides - Override default values
 * @returns {Object} Mock response object
 */
const createMockResponse = (overrides = {}) => {
  const res = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    ...overrides
  };
  return res;
};

/**
 * Create mock next function
 * @returns {Function} Mock next function
 */
const createMockNext = () => jest.fn();

module.exports = {
  createTestUserData,
  createTestProfileData,
  createTestJourneyData,
  createTestBookingData,
  createTestProviderData,
  createUserWithProfile,
  createMockRequest,
  createMockResponse,
  createMockNext
};
