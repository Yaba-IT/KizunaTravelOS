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

// Mock middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 'testUserId', role: 'customer' };
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
app.get('/bookings', mockAuth, mockAuthorize(['agent', 'manager']), bookingController.getAllBookings);
app.get('/bookings/:id', mockAuth, mockAuthorize(['agent', 'manager']), bookingController.getBookingById);
app.get('/my-bookings', mockAuth, mockAuthorize(['customer']), bookingController.getMyBookings);
app.get('/my-booking/:id', mockAuth, mockAuthorize(['customer']), bookingController.getMyBooking);
app.post('/bookings', mockAuth, mockAuthorize(['customer']), bookingController.createBooking);
app.post('/agent-bookings', mockAuth, mockAuthorize(['agent']), bookingController.createBookingForCustomer);
app.put('/my-booking/:id', mockAuth, mockAuthorize(['customer']), bookingController.updateMyBooking);
app.put('/bookings/:id', mockAuth, mockAuthorize(['agent', 'manager']), bookingController.updateBooking);
app.post('/bookings/:id/status', mockAuth, mockAuthorize(['agent', 'manager', 'guide']), bookingController.updateBookingStatus);
app.delete('/my-booking/:id', mockAuth, mockAuthorize(['customer']), bookingController.cancelMyBooking);
app.delete('/bookings/:id', mockAuth, mockAuthorize(['manager']), bookingController.deleteBooking);
app.get('/guide-bookings', mockAuth, mockAuthorize(['guide']), bookingController.getMyAssignedBookings);
app.get('/guide-booking/:id', mockAuth, mockAuthorize(['guide']), bookingController.getMyAssignedBooking);
app.get('/booking-stats', mockAuth, mockAuthorize(['manager']), bookingController.getBookingStats);

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
    // Create test user
    testUser = new User({
      email: 'test@example.com',
      password: 'Password123!',
      role: 'customer',
      status: 'active'
    });
    await testUser.save();

    // Create test customer
    testCustomer = new User({
      email: 'customer@example.com',
      password: 'Password123!',
      role: 'customer',
      status: 'active'
    });
    await testCustomer.save();

    // Create test guide
    testGuide = new User({
      email: 'guide@example.com',
      password: 'Password123!',
      role: 'guide',
      status: 'active'
    });
    await testGuide.save();

    // Create test journey
    testJourney = new Journey({
      name: 'Test Journey',
      description: 'A test journey',
      price: 100.00,
      duration: '2 days',
      category: 'culture',
      status: 'active'
    });
    await testJourney.save();

    // Create test booking
    testBooking = new Booking({
      customerId: testCustomer._id,
      journeyId: testJourney._id,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      participants: 2,
      totalPrice: 200.00,
      status: 'pending'
    });
    await testBooking.save();
  });

  describe('getAllBookings', () => {
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

  describe('getBookingById', () => {
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

  describe('getMyBookings', () => {
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

  describe('createBooking', () => {
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

  describe('createBookingForCustomer', () => {
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

  describe('updateMyBooking', () => {
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

  describe('updateBooking', () => {
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

  describe('updateBookingStatus', () => {
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

  describe('cancelMyBooking', () => {
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

  describe('deleteBooking', () => {
    it('should delete booking (manager only)', async () => {
      const res = await request(app)
        .delete(`/bookings/${testBooking._id}`)
        .expect(200);

      expect(res.body.message).toBe('Booking deleted successfully');
    });
  });

  describe('getMyAssignedBookings', () => {
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

  describe('getMyAssignedBooking', () => {
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

  describe('getBookingStats', () => {
    it('should get booking statistics', async () => {
      const res = await request(app)
        .get('/booking-stats')
        .expect(200);

      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.total).toBeDefined();
      expect(res.body.stats.byStatus).toBeDefined();
    });
  });

  describe('Error Handling', () => {
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

  describe('Data Validation', () => {
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

  describe('Business Logic', () => {
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
