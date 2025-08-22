/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/controllers/__test__/journey.test.js - Journey controller tests
* Tests journey management and itinerary functionality
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

// Import the controller
const journeyController = require('../journey');

// Import models
const Journey = require('../../models/Journey');
const User = require('../../models/User');
const Booking = require('../../models/Booking');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 'testUserId', role: 'manager' };
  next();
};

const mockAuthCustomer = (req, res, next) => {
  req.user = { id: 'testUserId', role: 'customer' };
  next();
};

const mockAuthGuide = (req, res, next) => {
  req.user = { id: 'testUserId', role: 'guide' };
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
app.get('/journeys', mockAuth, mockAuthorize(['agent', 'manager']), journeyController.getAllJourneys);
app.get('/journeys/:id', mockAuth, mockAuthorize(['agent', 'manager']), journeyController.getJourneyById);
app.get('/customer/journeys', mockAuthCustomer, mockAuthorize(['customer']), journeyController.getAvailableJourneys);
app.get('/customer/journeys/:id', mockAuthCustomer, mockAuthorize(['customer']), journeyController.getJourneyDetails);
app.get('/guide/journeys', mockAuthGuide, mockAuthorize(['guide']), journeyController.getMyAssignedJourneys);
app.get('/guide/journeys/:id', mockAuthGuide, mockAuthorize(['guide']), journeyController.getMyJourneyDetails);
app.get('/guide/schedule', mockAuthGuide, mockAuthorize(['guide']), journeyController.getMySchedule);
app.get('/public/journeys/search', journeyController.searchPublicJourneys);
app.get('/public/journeys/:id', journeyController.getPublicJourneyDetails);
app.post('/manager/journeys', mockAuth, mockAuthorize(['manager']), journeyController.createJourney);
app.put('/manager/journeys/:id', mockAuth, mockAuthorize(['manager']), journeyController.updateJourney);
app.delete('/manager/journeys/:id', mockAuth, mockAuthorize(['manager']), journeyController.deleteJourney);
app.post('/journeys/:id/assign-guide', mockAuth, mockAuthorize(['agent', 'manager']), journeyController.assignGuide);
app.put('/guide/journeys/:id/status', mockAuthGuide, mockAuthorize(['guide']), journeyController.updateJourneyStatus);
app.post('/guide/journeys/:id/notes', mockAuthGuide, mockAuthorize(['guide']), journeyController.addJourneyNotes);
app.get('/manager/journeys/stats', mockAuth, mockAuthorize(['manager']), journeyController.getJourneyStats);

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
  await Journey.deleteMany({});
  await User.deleteMany({});
  await Booking.deleteMany({});
});

describe('Journey Controller', () => {
  let testUser, testGuide, testJourney, testProvider;

  beforeEach(async () => {
    // Create test profiles first
    const Profile = require('../../models/Profile');
    
    const customerProfile = await Profile.create({
      userId: new mongoose.Types.ObjectId(),
      firstname: 'Test',
      lastname: 'Customer',
      role: 'customer'
    });

    const guideProfile = await Profile.create({
      userId: new mongoose.Types.ObjectId(),
      firstname: 'Test',
      lastname: 'Guide',
      role: 'guide'
    });

    // Create test user
    testUser = new User({
      email: 'test@example.com',
      password: 'Password123!',
      role: 'customer',
      status: 'active',
      profileId: customerProfile._id
    });
    await testUser.save();

    // Create test guide
    testGuide = new User({
      email: 'guide@example.com',
      password: 'Password123!',
      role: 'guide',
      status: 'active',
      profileId: guideProfile._id
    });
    await testGuide.save();

    // Create test provider
    testProvider = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Hotel',
      type: 'hotel'
    };

    // Create test journey
    testJourney = new Journey({
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
      status: 'active'
    });
    await testJourney.save();
  });

  describe.skip('getAllJourneys', () => {
    it('should get all journeys for agents/managers', async () => {
      const res = await request(app)
        .get('/journeys')
        .expect(200);

      expect(res.body.journeys).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(Array.isArray(res.body.journeys)).toBe(true);
    });

    it('should filter journeys by status', async () => {
      const res = await request(app)
        .get('/journeys?status=active')
        .expect(200);

      expect(res.body.journeys.every(j => j.status === 'active')).toBe(true);
    });

    it('should filter journeys by price range', async () => {
      const res = await request(app)
        .get('/journeys?minPrice=100&maxPrice=200')
        .expect(200);

      expect(res.body.journeys.every(j => j.price >= 100 && j.price <= 200)).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/journeys?page=1&limit=5')
        .expect(200);

      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe.skip('getJourneyById', () => {
    it('should get journey by ID', async () => {
      const res = await request(app)
        .get(`/journeys/${testJourney._id}`)
        .expect(200);

      expect(res.body.journey).toBeDefined();
      expect(res.body.journey._id).toBe(testJourney._id.toString());
    });

    it('should return 404 for non-existent journey', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/journeys/${fakeId}`)
        .expect(404);
    });
  });

  describe.skip('getAvailableJourneys', () => {
    it('should get available journeys for customers', async () => {
      const res = await request(app)
        .get('/customer/journeys')
        .expect(200);

      expect(res.body.journeys).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(res.body.journeys.every(j => j.status === 'active')).toBe(true);
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get('/customer/journeys?category=culture')
        .expect(200);

      expect(res.body.journeys.every(j => j.category === 'culture')).toBe(true);
    });

    it('should filter by price range', async () => {
      const res = await request(app)
        .get('/customer/journeys?minPrice=100&maxPrice=200')
        .expect(200);

      expect(res.body.journeys.every(j => j.price >= 100 && j.price <= 200)).toBe(true);
    });
  });

  describe.skip('getJourneyDetails', () => {
    it('should get journey details for customers', async () => {
      const res = await request(app)
        .get(`/customer/journeys/${testJourney._id}`)
        .expect(200);

      expect(res.body.journey).toBeDefined();
      expect(res.body.journey.name).toBe('Test Journey');
      expect(res.body.journey.itinerary).toBeDefined();
      expect(res.body.journey.included).toBeDefined();
      expect(res.body.journey.excluded).toBeDefined();
    });

    it('should return 404 for inactive journey', async () => {
      testJourney.status = 'inactive';
      await testJourney.save();

      await request(app)
        .get(`/customer/journeys/${testJourney._id}`)
        .expect(404);
    });
  });

  describe.skip('getMyAssignedJourneys', () => {
    it('should get journeys assigned to current guide', async () => {
      // Assign journey to guide
      testJourney.guideId = testGuide._id;
      await testJourney.save();

      // Update mock auth to use test guide
      app.use('/guide/journeys', (req, res, next) => {
        req.user = { id: testGuide._id.toString(), role: 'guide' };
        next();
      }, mockAuthorize(['guide']), journeyController.getMyAssignedJourneys);

      const res = await request(app)
        .get('/guide/journeys')
        .expect(200);

      expect(res.body.journeys).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter by status', async () => {
      testJourney.guideId = testGuide._id;
      await testJourney.save();

      app.use('/guide/journeys', (req, res, next) => {
        req.user = { id: testGuide._id.toString(), role: 'guide' };
        next();
      }, mockAuthorize(['guide']), journeyController.getMyAssignedJourneys);

      const res = await request(app)
        .get('/guide/journeys?status=active')
        .expect(200);

      expect(res.body.journeys.every(j => j.status === 'active')).toBe(true);
    });
  });

  describe.skip('getMySchedule', () => {
    it('should get guide schedule with bookings', async () => {
      // Assign journey to guide
      testJourney.guideId = testGuide._id;
      testJourney.date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await testJourney.save();

      // Create test booking
      const testBooking = new Booking({
        customerId: testUser._id,
        journeyId: testJourney._id,
        date: testJourney.date,
        participants: 2,
        totalPrice: 300.00,
        status: 'confirmed'
      });
      await testBooking.save();

      app.use('/guide/schedule', (req, res, next) => {
        req.user = { id: testGuide._id.toString(), role: 'guide' };
        next();
      }, mockAuthorize(['guide']), journeyController.getMySchedule);

      const res = await request(app)
        .get('/guide/schedule')
        .expect(200);

      expect(res.body.schedule).toBeDefined();
      expect(res.body.schedule[0].journey).toBeDefined();
      expect(res.body.schedule[0].bookings).toBeDefined();
    });
  });

  describe.skip('searchPublicJourneys', () => {
    it('should search public journeys', async () => {
      const res = await request(app)
        .get('/public/journeys/search?q=Test')
        .expect(200);

      expect(res.body.journeys).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter by category and price', async () => {
      const res = await request(app)
        .get('/public/journeys/search?category=culture&minPrice=100&maxPrice=200')
        .expect(200);

      expect(res.body.journeys.every(j => j.category === 'culture')).toBe(true);
      expect(res.body.journeys.every(j => j.price >= 100 && j.price <= 200)).toBe(true);
    });
  });

  describe.skip('getPublicJourneyDetails', () => {
    it('should get public journey details', async () => {
      const res = await request(app)
        .get(`/public/journeys/${testJourney._id}`)
        .expect(200);

      expect(res.body.journey).toBeDefined();
      expect(res.body.journey.name).toBe('Test Journey');
    });

    it('should return 404 for inactive journey', async () => {
      testJourney.status = 'inactive';
      await testJourney.save();

      await request(app)
        .get(`/public/journeys/${testJourney._id}`)
        .expect(404);
    });
  });

  describe.skip('createJourney', () => {
    it('should create new journey (manager only)', async () => {
      const journeyData = {
        name: 'New Cultural Journey',
        description: 'Explore cultural heritage sites',
        price: 299.99,
        duration: '4 days',
        category: 'culture',
        itinerary: ['Day 1: Arrival', 'Day 2: City Tour'],
        included: ['Hotel', 'Meals', 'Transport'],
        excluded: ['Flights', 'Personal expenses'],
        maxParticipants: 25
      };

      const res = await request(app)
        .post('/manager/journeys')
        .send(journeyData)
        .expect(201);

      expect(res.body.message).toBe('Journey created successfully');
      expect(res.body.journey).toBeDefined();
      expect(res.body.journey.name).toBe('New Cultural Journey');
      expect(res.body.journey.price).toBe(299.99);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/manager/journeys')
        .send({})
        .expect(400);

      expect(res.body.error).toBe('Name, description, price, and duration are required');
    });

    it('should validate price is positive', async () => {
      const journeyData = {
        name: 'Test Journey',
        description: 'A test journey',
        price: -100,
        duration: '2 days'
      };

      const res = await request(app)
        .post('/manager/journeys')
        .send(journeyData)
        .expect(400);

      expect(res.body.error).toBe('Price must be greater than 0');
    });

    it('should validate guide exists', async () => {
      const fakeGuideId = new mongoose.Types.ObjectId();
      const journeyData = {
        name: 'Test Journey',
        description: 'A test journey',
        price: 100,
        duration: '2 days',
        guideId: fakeGuideId.toString()
      };

      const res = await request(app)
        .post('/manager/journeys')
        .send(journeyData)
        .expect(404);

      expect(res.body.error).toBe('Guide not found');
    });
  });

  describe.skip('updateJourney', () => {
    it('should update journey (manager only)', async () => {
      const updateData = {
        name: 'Updated Journey Name',
        price: 200.00
      };

      const res = await request(app)
        .put(`/manager/journeys/${testJourney._id}`)
        .send(updateData)
        .expect(200);

      expect(res.body.message).toBe('Journey updated successfully');
      expect(res.body.journey.name).toBe('Updated Journey Name');
      expect(res.body.journey.price).toBe(200.00);
    });

    it('should validate price is positive', async () => {
      const updateData = {
        price: -50
      };

      const res = await request(app)
        .put(`/manager/journeys/${testJourney._id}`)
        .send(updateData)
        .expect(400);

      expect(res.body.error).toBe('Price must be greater than 0');
    });
  });

  describe.skip('deleteJourney', () => {
    it('should delete journey (manager only)', async () => {
      const res = await request(app)
        .delete(`/manager/journeys/${testJourney._id}`)
        .expect(200);

      expect(res.body.message).toBe('Journey deleted successfully');
    });

    it('should not delete journey with active bookings', async () => {
      // Create active booking
      const testBooking = new Booking({
        customerId: testUser._id,
        journeyId: testJourney._id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        participants: 2,
        totalPrice: 300.00,
        status: 'confirmed'
      });
      await testBooking.save();

      const res = await request(app)
        .delete(`/manager/journeys/${testJourney._id}`)
        .expect(400);

      expect(res.body.error).toBe('Cannot delete journey with active bookings');
    });
  });

  describe.skip('assignGuide', () => {
    it('should assign guide to journey', async () => {
      const assignData = {
        guideId: testGuide._id.toString(),
        notes: 'Experienced guide with local knowledge'
      };

      const res = await request(app)
        .post(`/journeys/${testJourney._id}/assign-guide`)
        .send(assignData)
        .expect(200);

      expect(res.body.message).toBe('Guide assigned successfully');
      expect(res.body.journey.guideId).toBe(testGuide._id.toString());
    });

    it('should validate guide exists', async () => {
      const fakeGuideId = new mongoose.Types.ObjectId();
      const assignData = {
        guideId: fakeGuideId.toString()
      };

      const res = await request(app)
        .post(`/journeys/${testJourney._id}/assign-guide`)
        .send(assignData)
        .expect(404);

      expect(res.body.error).toBe('Guide not found');
    });

    it('should check guide availability', async () => {
      // Create conflicting journey
      const conflictingJourney = new Journey({
        name: 'Conflicting Journey',
        description: 'Another journey',
        price: 100.00,
        duration: '1 day',
        category: 'culture',
        status: 'active',
        guideId: testGuide._id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await conflictingJourney.save();

      // Set date for test journey
      testJourney.date = conflictingJourney.date;
      await testJourney.save();

      const assignData = {
        guideId: testGuide._id.toString()
      };

      const res = await request(app)
        .post(`/journeys/${testJourney._id}/assign-guide`)
        .send(assignData)
        .expect(400);

      expect(res.body.error).toBe('Guide is already assigned to another journey on this date');
    });
  });

  describe.skip('updateJourneyStatus', () => {
    it('should update journey status (guide only)', async () => {
      // Assign journey to guide
      testJourney.guideId = testGuide._id;
      await testJourney.save();

      const statusData = {
        status: 'in_progress',
        notes: 'Tour started successfully'
      };

      app.use('/guide/journeys/:id/status', (req, res, next) => {
        req.user = { id: testGuide._id.toString(), role: 'guide' };
        next();
      }, mockAuthorize(['guide']), journeyController.updateJourneyStatus);

      const res = await request(app)
        .put(`/guide/journeys/${testJourney._id}/status`)
        .send(statusData)
        .expect(200);

      expect(res.body.message).toBe('Journey status updated successfully');
      expect(res.body.journey.status).toBe('in_progress');
    });

    it('should validate status', async () => {
      testJourney.guideId = testGuide._id;
      await testJourney.save();

      app.use('/guide/journeys/:id/status', (req, res, next) => {
        req.user = { id: testGuide._id.toString(), role: 'guide' };
        next();
      }, mockAuthorize(['guide']), journeyController.updateJourneyStatus);

      const statusData = {
        status: 'invalid_status'
      };

      const res = await request(app)
        .put(`/guide/journeys/${testJourney._id}/status`)
        .send(statusData)
        .expect(400);

      expect(res.body.error).toBe('Invalid status');
    });
  });

  describe.skip('addJourneyNotes', () => {
    it('should add notes to journey (guide only)', async () => {
      // Assign journey to guide
      testJourney.guideId = testGuide._id;
      await testJourney.save();

      const notesData = {
        notes: 'Group was very interested in local history',
        type: 'observation'
      };

      app.use('/guide/journeys/:id/notes', (req, res, next) => {
        req.user = { id: testGuide._id.toString(), role: 'guide' };
        next();
      }, mockAuthorize(['guide']), journeyController.addJourneyNotes);

      const res = await request(app)
        .post(`/guide/journeys/${testJourney._id}/notes`)
        .send(notesData)
        .expect(200);

      expect(res.body.message).toBe('Notes added successfully');
      expect(res.body.notes.content).toBe('Group was very interested in local history');
    });

    it('should validate notes are provided', async () => {
      testJourney.guideId = testGuide._id;
      await testJourney.save();

      app.use('/guide/journeys/:id/notes', (req, res, next) => {
        req.user = { id: testGuide._id.toString(), role: 'guide' };
        next();
      }, mockAuthorize(['guide']), journeyController.addJourneyNotes);

      const res = await request(app)
        .post(`/guide/journeys/${testJourney._id}/notes`)
        .send({})
        .expect(400);

      expect(res.body.error).toBe('Notes are required');
    });
  });

  describe.skip('getJourneyStats', () => {
    it('should get journey statistics (manager only)', async () => {
      const res = await request(app)
        .get('/manager/journeys/stats')
        .expect(200);

      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.total).toBeDefined();
      expect(res.body.stats.byStatus).toBeDefined();
      expect(res.body.stats.byCategory).toBeDefined();
    });
  });

  describe.skip('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock a database error
      jest.spyOn(Journey, 'find').mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      const res = await request(app)
        .get('/journeys')
        .expect(500);

      expect(res.body.error).toBe('Internal server error');
    });

    it('should validate ObjectId format', async () => {
      const res = await request(app)
        .get('/journeys/invalid-id')
        .expect(500);

      expect(res.body.error).toBe('Internal server error');
    });
  });

  describe.skip('Data Validation', () => {
    it('should validate price is numeric', async () => {
      const journeyData = {
        name: 'Test Journey',
        description: 'A test journey',
        price: 'not-a-number',
        duration: '2 days'
      };

      const res = await request(app)
        .post('/manager/journeys')
        .send(journeyData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should validate maxParticipants is positive', async () => {
      const journeyData = {
        name: 'Test Journey',
        description: 'A test journey',
        price: 100,
        duration: '2 days',
        maxParticipants: -5
      };

      const res = await request(app)
        .post('/manager/journeys')
        .send(journeyData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe.skip('Business Logic', () => {
    it('should prevent assigning inactive guide', async () => {
      // Deactivate guide
      testGuide.status = 'inactive';
      await testGuide.save();

      const assignData = {
        guideId: testGuide._id.toString()
      };

      const res = await request(app)
        .post(`/journeys/${testJourney._id}/assign-guide`)
        .send(assignData)
        .expect(404);

      expect(res.body.error).toBe('Guide not found');
    });

    it('should calculate journey capacity correctly', async () => {
      // Create multiple bookings
      for (let i = 0; i < 15; i++) {
        const testUser = new User({
          email: `user${i}@example.com`,
          password: 'Password123!',
          role: 'customer',
          status: 'active'
        });
        await testUser.save();

        const testBooking = new Booking({
          customerId: testUser._id,
          journeyId: testJourney._id,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          participants: 1,
          totalPrice: 150.00,
          status: 'confirmed'
        });
        await testBooking.save();
      }

      // Check if journey is at capacity
      const activeBookings = await Booking.countDocuments({
        journeyId: testJourney._id,
        status: { $in: ['pending', 'confirmed', 'in_progress'] },
        'meta.isDeleted': false
      });

      expect(activeBookings).toBe(15);
      expect(activeBookings).toBeLessThan(testJourney.maxParticipants);
    });
  });
});
