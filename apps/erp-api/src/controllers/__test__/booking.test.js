/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/controllers/__test__/booking.test.js - Booking controller tests
* Tests booking management and reservation functionality
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

// Import the controller
const bookingController = require('../booking');

// Import models
const Booking = require('../../models/Booking');
const User = require('../../models/User');
const Journey = require('../../models/Journey');

// Create Express app for testing
const app = express();
app.use(express.json());

// Helper function to create user with profile
const createUserWithProfile = async (userData, profileData = {}) => {
  const Profile = require('../../models/Profile');
  const profile = new Profile({
    userId: new mongoose.Types.ObjectId(),
    firstname: profileData.firstname || 'John',
    lastname: profileData.lastname || 'Doe',
    role: profileData.role || userData.role || 'customer',
    sexe: profileData.sexe || 'M',
    ...profileData
  });
  await profile.save();

  const user = new User({
    ...userData,
    profileId: profile._id
  });
  await user.save();

  // Update profile with actual user ID
  profile.userId = user._id;
  await profile.save();

  return { user, profile };
};

// Mock middleware with different roles
const mockAuth = (req, res, next) => {
  req.user = { 
    id: new mongoose.Types.ObjectId().toString(), 
    _id: new mongoose.Types.ObjectId(),
    role: 'customer' 
  };
  next();
};

const mockAuthAgent = (req, res, next) => {
  req.user = { 
    id: new mongoose.Types.ObjectId().toString(), 
    _id: new mongoose.Types.ObjectId(),
    role: 'agent' 
  };
  next();
};

const mockAuthManager = (req, res, next) => {
  req.user = { 
    id: new mongoose.Types.ObjectId().toString(), 
    _id: new mongoose.Types.ObjectId(),
    role: 'manager' 
  };
  next();
};

const mockAuthGuide = (req, res, next) => {
  req.user = { 
    id: new mongoose.Types.ObjectId().toString(), 
    _id: new mongoose.Types.ObjectId(),
    role: 'guide' 
  };
  next();
};

const mockAuthorize = (roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

// Test routes
app.get('/bookings', mockAuthManager, mockAuthorize(['agent', 'manager']), bookingController.getAllBookings);
app.get('/bookings/:id', mockAuthManager, mockAuthorize(['agent', 'manager']), bookingController.getBookingById);
app.get('/my-bookings', mockAuth, mockAuthorize(['customer']), bookingController.getMyBookings);
app.get('/my-booking/:id', mockAuth, mockAuthorize(['customer']), bookingController.getMyBooking);
app.post('/bookings', mockAuth, mockAuthorize(['customer']), bookingController.createBooking);
app.post('/agent-bookings', mockAuthAgent, mockAuthorize(['agent']), bookingController.createBookingForCustomer);
app.put('/my-booking/:id', mockAuth, mockAuthorize(['customer']), bookingController.updateMyBooking);
app.put('/bookings/:id', mockAuthManager, mockAuthorize(['agent', 'manager']), bookingController.updateBooking);
app.post('/bookings/:id/status', mockAuthManager, mockAuthorize(['agent', 'manager', 'guide']), bookingController.updateBookingStatus);
app.delete('/my-booking/:id', mockAuth, mockAuthorize(['customer']), bookingController.cancelMyBooking);
app.delete('/bookings/:id', mockAuthManager, mockAuthorize(['manager']), bookingController.deleteBooking);
app.get('/guide-bookings', mockAuthGuide, mockAuthorize(['guide']), bookingController.getMyAssignedBookings);
app.get('/guide-booking/:id', mockAuthGuide, mockAuthorize(['guide']), bookingController.getMyAssignedBooking);
app.get('/booking-stats', mockAuthManager, mockAuthorize(['manager']), bookingController.getBookingStats);

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
  await Booking.deleteMany({});
  await User.deleteMany({});
  await Journey.deleteMany({});
});

describe('Booking Controller', () => {
  let testUser, testCustomer, testGuide, testJourney, testBooking;

  beforeEach(async () => {
    // Create test users with profiles
    const { user: user1 } = await createUserWithProfile({
      email: 'test@example.com',
      password: 'Password123!',
      role: 'customer',
      status: 'active'
    });
    testUser = user1;

    const { user: user2 } = await createUserWithProfile({
      email: 'customer@example.com',
      password: 'Password123!',
      role: 'customer',
      status: 'active'
    });
    testCustomer = user2;

    const { user: user3 } = await createUserWithProfile({
      email: 'guide@example.com',
      password: 'Password123!',
      role: 'guide',
      status: 'active'
    });
    testGuide = user3;

    // Create test journey
    testJourney = new Journey({
      name: 'Test Journey',
      description: 'A test journey',
      category: 'cultural',
      type: 'guided',
      duration: {
        days: 2,
        nights: 1
      },
      schedule: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-03')
      },
      capacity: {
        maxParticipants: 10,
        minParticipants: 1
      },
      pricing: {
        basePrice: 100.00,
        currency: 'USD'
      },
      destinations: [{
        name: 'Test City',
        country: 'Test Country',
        city: 'Test City'
      }],
      status: 'active'
    });
    await testJourney.save();

    // Create test booking
    testBooking = new Booking({
      customerId: testCustomer._id,
      journeyId: testJourney._id,
      travelDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      basePrice: 100.00,
      totalPrice: 200.00,
      contactEmail: 'customer@example.com',
      contactPhone: '+1234567890',
      paymentMethod: 'credit_card',
      participants: 2,
      status: 'pending',
      meta: {
        isDeleted: false,
        created_by: testCustomer._id
      }
    });
    await testBooking.save();
  });

  describe.skip('getAllBookings', () => {
    it('should get all bookings for agents/managers', async () => {
      const res = await request(app)
        .get('/bookings')
        .expect(200);

      expect(res.body.bookings).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(Array.isArray(res.body.bookings)).toBe(true);
    });

    it('should filter bookings by status', async () => {
      const res = await request(app)
        .get('/bookings?status=pending')
        .expect(200);

      expect(res.body.bookings.every(b => b.status === 'pending')).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/bookings?page=1&limit=5')
        .expect(200);

      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe.skip('getBookingById', () => {
    it('should get booking by ID', async () => {
      const res = await request(app)
        .get(`/bookings/${testBooking._id}`)
        .expect(200);

      expect(res.body.booking).toBeDefined();
      expect(res.body.booking._id).toBe(testBooking._id.toString());
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/bookings/${fakeId}`)
        .expect(404);
    });
  });

  describe.skip('getMyBookings', () => {
    it('should get current user bookings', async () => {
      // Update mock auth to use test user
      app.use('/my-bookings', (req, res, next) => {
        req.user = { id: testUser._id.toString(), role: 'customer' };
        next();
      }, mockAuthorize(['customer']), bookingController.getMyBookings);

      const res = await request(app)
        .get('/my-bookings')
        .expect(200);

      expect(res.body.bookings).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe.skip('createBooking', () => {
    it('should create new booking for customer', async () => {
      const bookingData = {
        journeyId: testJourney._id.toString(),
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        participants: 3,
        specialRequests: 'Vegetarian meals'
      };

      const res = await request(app)
        .post('/bookings')
        .send(bookingData)
        .expect(201);

      expect(res.body.message).toBe('Booking created successfully');
      expect(res.body.booking).toBeDefined();
      expect(res.body.booking.participants).toBe(3);
      expect(res.body.booking.totalPrice).toBe(300.00); // 100 * 3
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/bookings')
        .send({})
        .expect(400);

      expect(res.body.error).toBe('Journey ID and date are required');
    });

    it('should validate future date', async () => {
      const bookingData = {
        journeyId: testJourney._id.toString(),
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        participants: 2
      };

      const res = await request(app)
        .post('/bookings')
        .send(bookingData)
        .expect(400);

      expect(res.body.error).toBe('Booking date must be in the future');
    });
  });

  describe.skip('createBookingForCustomer', () => {
    it('should create booking for customer (agent)', async () => {
      const bookingData = {
        customerId: testCustomer._id.toString(),
        journeyId: testJourney._id.toString(),
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        participants: 2
      };

      const res = await request(app)
        .post('/agent-bookings')
        .send(bookingData)
        .expect(201);

      expect(res.body.message).toBe('Booking created successfully for customer');
      expect(res.body.booking).toBeDefined();
    });

    it('should validate customer exists', async () => {
      const fakeCustomerId = new mongoose.Types.ObjectId();
      const bookingData = {
        customerId: fakeCustomerId.toString(),
        journeyId: testJourney._id.toString(),
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        participants: 2
      };

      const res = await request(app)
        .post('/agent-bookings')
        .send(bookingData)
        .expect(404);

      expect(res.body.error).toBe('Customer not found');
    });
  });

  describe.skip('updateMyBooking', () => {
    it('should update customer own booking', async () => {
      const updateData = {
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        participants: 4
      };

      const res = await request(app)
        .put(`/my-booking/${testBooking._id}`)
        .send(updateData)
        .expect(200);

      expect(res.body.message).toBe('Booking updated successfully');
      expect(res.body.booking.participants).toBe(4);
      expect(res.body.booking.totalPrice).toBe(400.00); // 100 * 4
    });

    it('should not allow updating confirmed bookings', async () => {
      testBooking.status = 'confirmed';
      await testBooking.save();

      const updateData = { participants: 5 };

      const res = await request(app)
        .put(`/my-booking/${testBooking._id}`)
        .send(updateData)
        .expect(400);

      expect(res.body.error).toBe('Cannot update booking in current status');
    });
  });

  describe.skip('updateBooking', () => {
    it('should update booking (agent/manager)', async () => {
      const updateData = {
        status: 'confirmed',
        participants: 3
      };

      const res = await request(app)
        .put(`/bookings/${testBooking._id}`)
        .send(updateData)
        .expect(200);

      expect(res.body.message).toBe('Booking updated successfully');
      expect(res.body.booking.status).toBe('confirmed');
    });
  });

  describe.skip('updateBookingStatus', () => {
    it('should update booking status', async () => {
      const statusData = {
        status: 'confirmed',
        notes: 'Payment received'
      };

      const res = await request(app)
        .post(`/bookings/${testBooking._id}/status`)
        .send(statusData)
        .expect(200);

      expect(res.body.message).toBe('Booking status updated successfully');
      expect(res.body.booking.status).toBe('confirmed');
    });

    it('should validate status', async () => {
      const statusData = {
        status: 'invalid_status'
      };

      const res = await request(app)
        .post(`/bookings/${testBooking._id}/status`)
        .send(statusData)
        .expect(400);

      expect(res.body.error).toBe('Invalid status');
    });
  });

  describe.skip('cancelMyBooking', () => {
    it('should cancel customer own booking', async () => {
      const res = await request(app)
        .delete(`/my-booking/${testBooking._id}`)
        .expect(200);

      expect(res.body.message).toBe('Booking cancelled successfully');
      expect(res.body.booking.status).toBe('cancelled');
    });

    it('should not allow cancelling completed bookings', async () => {
      testBooking.status = 'completed';
      await testBooking.save();

      const res = await request(app)
        .delete(`/my-booking/${testBooking._id}`)
        .expect(400);

      expect(res.body.error).toBe('Cannot cancel booking in current status');
    });
  });

  describe.skip('deleteBooking', () => {
    it('should delete booking (manager only)', async () => {
      const res = await request(app)
        .delete(`/bookings/${testBooking._id}`)
        .expect(200);

      expect(res.body.message).toBe('Booking deleted successfully');
    });
  });

  describe.skip('getMyAssignedBookings', () => {
    it('should get guide assigned bookings', async () => {
      // Assign journey to guide
      testJourney.guideId = testGuide._id;
      await testJourney.save();

      const res = await request(app)
        .get('/guide-bookings')
        .expect(200);

      expect(res.body.bookings).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe.skip('getMyAssignedBooking', () => {
    it('should get specific guide assigned booking', async () => {
      // Assign journey to guide
      testJourney.guideId = testGuide._id;
      await testJourney.save();

      const res = await request(app)
        .get(`/guide-booking/${testBooking._id}`)
        .expect(200);

      expect(res.body.booking).toBeDefined();
    });

    it('should not allow access to unassigned journey', async () => {
      const res = await request(app)
        .get(`/guide-booking/${testBooking._id}`)
        .expect(403);

      expect(res.body.error).toBe('Not authorized to view this booking');
    });
  });

  describe.skip('getBookingStats', () => {
    it('should get booking statistics', async () => {
      const res = await request(app)
        .get('/booking-stats')
        .expect(200);

      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.total).toBeDefined();
      expect(res.body.stats.byStatus).toBeDefined();
    });
  });

  describe.skip('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock a database error
      jest.spyOn(Booking, 'find').mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      const res = await request(app)
        .get('/bookings')
        .expect(500);

      expect(res.body.error).toBe('Internal server error');
    });

    it('should validate ObjectId format', async () => {
      const res = await request(app)
        .get('/bookings/invalid-id')
        .expect(500);

      expect(res.body.error).toBe('Internal server error');
    });
  });

  describe.skip('Data Validation', () => {
    it('should validate participants is positive', async () => {
      const bookingData = {
        journeyId: testJourney._id.toString(),
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        participants: 0
      };

      const res = await request(app)
        .post('/bookings')
        .send(bookingData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should validate special requests length', async () => {
      const longRequest = 'a'.repeat(1001); // Exceeds 1000 character limit
      const bookingData = {
        journeyId: testJourney._id.toString(),
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        participants: 2,
        specialRequests: longRequest
      };

      const res = await request(app)
        .post('/bookings')
        .send(bookingData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe.skip('Business Logic', () => {
    it('should calculate total price correctly', async () => {
      const bookingData = {
        journeyId: testJourney._id.toString(),
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        participants: 5
      };

      const res = await request(app)
        .post('/bookings')
        .send(bookingData)
        .expect(201);

      expect(res.body.booking.totalPrice).toBe(500.00); // 100 * 5
    });

    it('should prevent double booking on same date', async () => {
      // Create first booking
      const firstBooking = new Booking({
        customerId: testUser._id,
        journeyId: testJourney._id,
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        participants: 2,
        totalPrice: 200.00,
        status: 'confirmed'
      });
      await firstBooking.save();

      // Try to create second booking on same date
      const secondBookingData = {
        journeyId: testJourney._id.toString(),
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        participants: 3
      };

      const res = await request(app)
        .post('/bookings')
        .send(secondBookingData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });
});
