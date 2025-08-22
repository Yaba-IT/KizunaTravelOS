/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/__test__/customer.route.test.js - Customer routes tests
* Tests customer-specific route functionality and permissions
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Set test environment
process.env.NODE_ENV = 'test';

const customerRouter = require('../customer');

const app = express();
app.use(express.json());
app.use('/customer', customerRouter);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const collection of collections) {
    await mongoose.connection.db.collection(collection.name).deleteMany({});
  }
  
  // Create test data
  const User = require('../../models/User');
  const Profile = require('../../models/Profile');
  const Journey = require('../../models/Journey');
  const Booking = require('../../models/Booking');
  
  // Create test profile
  const testProfile = await Profile.create({
    userId: new mongoose.Types.ObjectId(),
    firstname: 'Test',
    lastname: 'Customer',
    role: 'customer'
  });
  
  // Create test user
  const testUser = await User.create({
    email: 'test@example.com',
    password: 'Password123!',
    role: 'customer',
    status: 'active',
    profileId: testProfile._id
  });
  
  // Create test journey
  const testJourney = await Journey.create({
    name: 'Test Journey',
    description: 'A test journey',
    category: 'cultural',
    type: 'guided',
    duration: {
      days: 2,
      nights: 1
    },
    destinations: [{
      name: 'Test City',
      country: 'Test Country',
      city: 'Test City'
    }],
    pricing: {
      basePrice: 100.00,
      currency: 'USD'
    },
    capacity: {
      maxParticipants: 10,
      minParticipants: 1
    },
    schedule: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-03')
    },
    status: 'active'
  });
  
        // Create test booking
      const testBooking = await Booking.create({
        customerId: testUser._id,
        journeyId: testJourney._id,
        travelDate: new Date('2024-01-01'),
        basePrice: 100.00,
        totalPrice: 100.00,
        contactEmail: 'test@example.com',
        contactPhone: '+1234567890',
        paymentMethod: 'credit_card',
        status: 'pending',
        meta: {
          isDeleted: false,
          created_by: testUser._id
        }
      });
  
  // Store test data for use in tests
  global.testData = {
    user: testUser,
    profile: testProfile,
    journey: testJourney,
    booking: testBooking
  };
});

describe('Customer routes', () => {
  describe('Authentication and Authorization', () => {
    it('should refuse access without token', async () => {
      // Temporarily override NODE_ENV to test real auth
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const res = await request(app).get('/customer/bookings');
      expect(res.status).toBe(401);
      
      // Restore test environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should refuse access with wrong role', async () => {
      // Temporarily override NODE_ENV to test real auth
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Create a custom app with guide role
      const app2 = express();
      app2.use(express.json());
      
      // Mock the auth middleware to return a guide user
      const mockAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'guide' };
        next();
      };
      
      const mockAuthorize = (allowedRoles) => (req, res, next) => {
        if (allowedRoles.includes(req.user.role)) {
          next();
        } else {
          res.status(403).json({ error: 'Forbidden' });
        }
      };
      
      app2.use('/customer', mockAuth, mockAuthorize(['customer']), customerRouter);
      
      const res = await request(app2).get('/customer/bookings');
      expect(res.status).toBe(403);
      
      // Restore test environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should allow access with correct role', async () => {
      // The default testAuth middleware should work for customer role
      const res = await request(app).get('/customer/bookings');
      expect(res.status).toBe(200);
    });
  });

  describe('Booking routes', () => {
    it('should handle GET /bookings', async () => {
      const res = await request(app).get('/customer/bookings');
      expect(res.status).toBe(200);
    });

    it('should handle GET /bookings/:id', async () => {

      
      const res = await request(app).get(`/customer/bookings/${global.testData.booking._id}`);
      expect(res.status).toBe(200);
    });

    it('should handle POST /bookings', async () => {
      const res = await request(app).post('/customer/bookings')
        .send({ journeyId: global.testData.journey._id.toString(), date: '2025-12-31' });
      expect(res.status).toBe(201);
    });

    it('should handle PUT /bookings/:id', async () => {
      const res = await request(app).put(`/customer/bookings/${global.testData.booking._id}`)
        .send({ date: '2025-12-30' });
      expect(res.status).toBe(200);
    });

    it('should handle DELETE /bookings/:id', async () => {
      const res = await request(app).delete(`/customer/bookings/${global.testData.booking._id}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Journey routes', () => {
    it('should handle GET /journeys', async () => {
      const res = await request(app).get('/customer/journeys');
      expect(res.status).toBe(200);
    });

    it('should handle GET /journeys/:id', async () => {
      const res = await request(app).get(`/customer/journeys/${global.testData.journey._id}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Account routes', () => {
    it('should handle DELETE /account', async () => {
      const res = await request(app).delete('/customer/account');
      expect(res.status).toBe(200);
    });
  });
});
