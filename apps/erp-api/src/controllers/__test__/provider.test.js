/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/controllers/__test__/provider.test.js - Provider controller tests
* Tests provider management and partner relationship functionality
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const express = require('express');

// Import the controller
const providerController = require('../provider');

// Import models
const Provider = require('../../models/Provider');
const Journey = require('../../models/Journey');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 'testUserId', role: 'agent' };
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
app.get('/providers', mockAuth, mockAuthorize(['agent', 'manager']), providerController.getAllProviders);
app.get('/providers/:id', mockAuth, mockAuthorize(['agent', 'manager']), providerController.getProviderById);
app.get('/public/providers', providerController.getPublicProviders);
app.get('/public/providers/:id', providerController.getPublicProviderDetails);
app.post('/manager/providers', mockAuth, mockAuthorize(['manager']), providerController.createProvider);
app.put('/manager/providers/:id', mockAuth, mockAuthorize(['manager']), providerController.updateProvider);
app.put('/agent/providers/:id', mockAuth, mockAuthorize(['agent']), providerController.updateProviderLimited);
app.delete('/manager/providers/:id', mockAuth, mockAuthorize(['manager']), providerController.deleteProvider);
app.post('/manager/providers/:id/restore', mockAuth, mockAuthorize(['manager']), providerController.restoreProvider);
app.get('/manager/providers/stats', mockAuth, mockAuthorize(['manager']), providerController.getProviderStats);
app.get('/manager/providers/search', mockAuth, mockAuthorize(['manager']), providerController.searchProviders);

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
  await Provider.deleteMany({});
  await Journey.deleteMany({});
});

describe('Provider Controller', () => {
  let testProvider, testJourney;

  beforeEach(async () => {
    // Create test provider
    testProvider = new Provider({
      name: 'Test Hotel',
      type: 'hotel',
      description: 'A luxury hotel in the city center',
      contact: {
        email: 'contact@testhotel.com',
        phone: '+1234567890'
      },
      address: {
        street: '123 Main Street',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        zipCode: '12345'
      },
      website: 'https://testhotel.com',
      rating: 4.5,
      status: 'active',
      images: ['hotel1.jpg', 'hotel2.jpg']
    });
    await testProvider.save();

    // Create test journey
    testJourney = new Journey({
      name: 'Test Journey',
      description: 'A test journey',
      price: 100.00,
      duration: '2 days',
      category: 'culture',
      status: 'active',
      providerId: testProvider._id
    });
    await testJourney.save();
  });

  describe('getAllProviders', () => {
    it('should get all providers for agents/managers', async () => {
      const res = await request(app)
        .get('/providers')
        .expect(200);

      expect(res.body.providers).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(Array.isArray(res.body.providers)).toBe(true);
    });

    it('should filter providers by type', async () => {
      const res = await request(app)
        .get('/providers?type=hotel')
        .expect(200);

      expect(res.body.providers.every(p => p.type === 'hotel')).toBe(true);
    });

    it('should filter providers by rating', async () => {
      const res = await request(app)
        .get('/providers?rating=4.0')
        .expect(200);

      expect(res.body.providers.every(p => p.rating >= 4.0)).toBe(true);
    });

    it('should filter providers by location', async () => {
      const res = await request(app)
        .get('/providers?location=Test City')
        .expect(200);

      expect(res.body.providers.every(p => 
        p.address.city === 'Test City' || p.address.country === 'Test City'
      )).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/providers?page=1&limit=5')
        .expect(200);

      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe('getProviderById', () => {
    it('should get provider by ID', async () => {
      const res = await request(app)
        .get(`/providers/${testProvider._id}`)
        .expect(200);

      expect(res.body.provider).toBeDefined();
      expect(res.body.provider._id).toBe(testProvider._id.toString());
    });

    it('should return 404 for non-existent provider', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/providers/${fakeId}`)
        .expect(404);
    });
  });

  describe('getPublicProviders', () => {
    it('should get public provider information', async () => {
      const res = await request(app)
        .get('/public/providers')
        .expect(200);

      expect(res.body.providers).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(res.body.providers.every(p => p.status === 'active')).toBe(true);
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/public/providers?type=hotel')
        .expect(200);

      expect(res.body.providers.every(p => p.type === 'hotel')).toBe(true);
    });

    it('should filter by rating', async () => {
      const res = await request(app)
        .get('/public/providers?rating=4.0')
        .expect(200);

      expect(res.body.providers.every(p => p.rating >= 4.0)).toBe(true);
    });

    it('should filter by location', async () => {
      const res = await request(app)
        .get('/public/providers?location=Test City')
        .expect(200);

      expect(res.body.providers.every(p => 
        p.address.city === 'Test City' || p.address.country === 'Test City'
      )).toBe(true);
    });
  });

  describe('getPublicProviderDetails', () => {
    it('should get public provider details', async () => {
      const res = await request(app)
        .get(`/public/providers/${testProvider._id}`)
        .expect(200);

      expect(res.body.provider).toBeDefined();
      expect(res.body.provider.name).toBe('Test Hotel');
      expect(res.body.provider.contact).toBeDefined();
      expect(res.body.provider.website).toBeDefined();
    });

    it('should return 404 for inactive provider', async () => {
      testProvider.status = 'inactive';
      await testProvider.save();

      await request(app)
        .get(`/public/providers/${testProvider._id}`)
        .expect(404);
    });
  });

  describe('createProvider', () => {
    it('should create new provider (manager only)', async () => {
      const providerData = {
        name: 'New Restaurant',
        type: 'restaurant',
        description: 'A fine dining restaurant',
        contact: {
          email: 'contact@newrestaurant.com',
          phone: '+1987654321'
        },
        address: {
          street: '456 Food Street',
          city: 'Food City',
          state: 'Food State',
          country: 'Food Country',
          zipCode: '54321'
        },
        website: 'https://newrestaurant.com',
        rating: 4.8
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(providerData)
        .expect(201);

      expect(res.body.message).toBe('Provider created successfully');
      expect(res.body.provider).toBeDefined();
      expect(res.body.provider.name).toBe('New Restaurant');
      expect(res.body.provider.type).toBe('restaurant');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/manager/providers')
        .send({})
        .expect(400);

      expect(res.body.error).toBe('Name and type are required');
    });

    it('should validate provider type', async () => {
      const providerData = {
        name: 'Test Provider',
        type: 'invalid_type'
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(providerData)
        .expect(400);

      expect(res.body.error).toBe('Invalid provider type');
    });

    it('should validate rating range', async () => {
      const providerData = {
        name: 'Test Provider',
        type: 'hotel',
        rating: 6.0
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(providerData)
        .expect(400);

      expect(res.body.error).toBe('Rating must be between 0 and 5');
    });

    it('should prevent duplicate provider names', async () => {
      const providerData = {
        name: 'Test Hotel', // Same name as existing provider
        type: 'hotel'
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(providerData)
        .expect(409);

      expect(res.body.error).toBe('Provider with this name already exists');
    });
  });

  describe('updateProvider', () => {
    it('should update provider (manager only)', async () => {
      const updateData = {
        name: 'Updated Hotel Name',
        rating: 4.8,
        description: 'Updated description'
      };

      const res = await request(app)
        .put(`/manager/providers/${testProvider._id}`)
        .send(updateData)
        .expect(200);

      expect(res.body.message).toBe('Provider updated successfully');
      expect(res.body.provider.name).toBe('Updated Hotel Name');
      expect(res.body.provider.rating).toBe(4.8);
      expect(res.body.provider.description).toBe('Updated description');
    });

    it('should validate provider type', async () => {
      const updateData = {
        type: 'invalid_type'
      };

      const res = await request(app)
        .put(`/manager/providers/${testProvider._id}`)
        .send(updateData)
        .expect(400);

      expect(res.body.error).toBe('Invalid provider type');
    });

    it('should validate rating range', async () => {
      const updateData = {
        rating: -1
      };

      const res = await request(app)
        .put(`/manager/providers/${testProvider._id}`)
        .send(updateData)
        .expect(400);

      expect(res.body.error).toBe('Rating must be between 0 and 5');
    });

    it('should prevent duplicate names on update', async () => {
      // Create another provider
      const anotherProvider = new Provider({
        name: 'Another Hotel',
        type: 'hotel'
      });
      await anotherProvider.save();

      const updateData = {
        name: 'Another Hotel' // Try to use existing name
      };

      const res = await request(app)
        .put(`/manager/providers/${testProvider._id}`)
        .send(updateData)
        .expect(409);

      expect(res.body.error).toBe('Provider with this name already exists');
    });
  });

  describe('updateProviderLimited', () => {
    it('should update limited provider fields (agent only)', async () => {
      const updateData = {
        description: 'Updated description by agent',
        contact: {
          email: 'newcontact@testhotel.com',
          phone: '+1987654321'
        }
      };

      const res = await request(app)
        .put(`/agent/providers/${testProvider._id}`)
        .send(updateData)
        .expect(200);

      expect(res.body.message).toBe('Provider updated successfully');
      expect(res.body.provider.description).toBe('Updated description by agent');
      expect(res.body.provider.contact.email).toBe('newcontact@testhotel.com');
    });

    it('should not allow updating restricted fields', async () => {
      const updateData = {
        name: 'Unauthorized Name Change',
        type: 'restaurant',
        rating: 5.0,
        status: 'inactive'
      };

      const res = await request(app)
        .put(`/agent/providers/${testProvider._id}`)
        .send(updateData)
        .expect(200);

      // These fields should not be updated
      expect(res.body.provider.name).toBe('Test Hotel');
      expect(res.body.provider.type).toBe('hotel');
      expect(res.body.provider.rating).toBe(4.5);
      expect(res.body.provider.status).toBe('active');
    });
  });

  describe('deleteProvider', () => {
    it('should delete provider (manager only)', async () => {
      const res = await request(app)
        .delete(`/manager/providers/${testProvider._id}`)
        .expect(200);

      expect(res.body.message).toBe('Provider deleted successfully');
    });

    it('should not delete provider with active journeys', async () => {
      const res = await request(app)
        .delete(`/manager/providers/${testProvider._id}`)
        .expect(400);

      expect(res.body.error).toBe('Cannot delete provider with active journeys');
    });
  });

  describe('restoreProvider', () => {
    it('should restore deleted provider (manager only)', async () => {
      // First delete the provider
      testProvider.meta.delete();
      await testProvider.save();

      const res = await request(app)
        .post(`/manager/providers/${testProvider._id}/restore`)
        .expect(200);

      expect(res.body.message).toBe('Provider restored successfully');
      expect(res.body.provider).toBeDefined();
    });

    it('should not restore non-deleted provider', async () => {
      const res = await request(app)
        .post(`/manager/providers/${testProvider._id}/restore`)
        .expect(400);

      expect(res.body.error).toBe('Provider is not deleted');
    });
  });

  describe('getProviderStats', () => {
    it('should get provider statistics (manager only)', async () => {
      const res = await request(app)
        .get('/manager/providers/stats')
        .expect(200);

      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.total).toBeDefined();
      expect(res.body.stats.byType).toBeDefined();
      expect(res.body.stats.byRating).toBeDefined();
      expect(res.body.stats.averageRating).toBeDefined();
    });

    it('should calculate correct statistics', async () => {
      // Create additional providers for testing
      const restaurantProvider = new Provider({
        name: 'Test Restaurant',
        type: 'restaurant',
        rating: 4.2
      });
      await restaurantProvider.save();

      const transportProvider = new Provider({
        name: 'Test Transport',
        type: 'transport',
        rating: 3.8
      });
      await transportProvider.save();

      const res = await request(app)
        .get('/manager/providers/stats')
        .expect(200);

      expect(res.body.stats.total).toBe(3);
      expect(res.body.stats.byType).toHaveLength(3);
      expect(res.body.stats.averageRating).toBeGreaterThan(0);
    });
  });

  describe('searchProviders', () => {
    it('should search providers by query', async () => {
      const res = await request(app)
        .get('/manager/providers/search?q=Hotel')
        .expect(200);

      expect(res.body.providers).toBeDefined();
      expect(res.body.providers.some(p => p.name.includes('Hotel'))).toBe(true);
    });

    it('should filter by type and rating', async () => {
      const res = await request(app)
        .get('/manager/providers/search?type=hotel&minRating=4.0')
        .expect(200);

      expect(res.body.providers.every(p => p.type === 'hotel')).toBe(true);
      expect(res.body.providers.every(p => p.rating >= 4.0)).toBe(true);
    });

    it('should filter by location', async () => {
      const res = await request(app)
        .get('/manager/providers/search?location=Test City')
        .expect(200);

      expect(res.body.providers.every(p => 
        p.address.city === 'Test City' || p.address.country === 'Test City'
      )).toBe(true);
    });

    it('should paginate search results', async () => {
      const res = await request(app)
        .get('/manager/providers/search?page=1&limit=5')
        .expect(200);

      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock a database error
      jest.spyOn(Provider, 'find').mockImplementationOnce(() => {
        throw new Error('Database connection failed');
      });

      const res = await request(app)
        .get('/providers')
        .expect(500);

      expect(res.body.error).toBe('Internal server error');
    });

    it('should validate ObjectId format', async () => {
      const res = await request(app)
        .get('/providers/invalid-id')
        .expect(500);

      expect(res.body.error).toBe('Internal server error');
    });
  });

  describe('Data Validation', () => {
    it('should validate email format in contact', async () => {
      const providerData = {
        name: 'Test Provider',
        type: 'hotel',
        contact: {
          email: 'invalid-email',
          phone: '+1234567890'
        }
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(providerData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should validate phone format in contact', async () => {
      const providerData = {
        name: 'Test Provider',
        type: 'hotel',
        contact: {
          email: 'test@example.com',
          phone: 'invalid-phone'
        }
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(providerData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should validate website URL format', async () => {
      const providerData = {
        name: 'Test Provider',
        type: 'hotel',
        website: 'not-a-url'
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(providerData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('Business Logic', () => {
    it('should prevent deletion of providers with active journeys', async () => {
      // Create active journey with this provider
      const activeJourney = new Journey({
        name: 'Active Journey',
        description: 'A journey with active provider',
        price: 100.00,
        duration: '1 day',
        category: 'culture',
        status: 'active',
        providerId: testProvider._id
      });
      await activeJourney.save();

      const res = await request(app)
        .delete(`/manager/providers/${testProvider._id}`)
        .expect(400);

      expect(res.body.error).toBe('Cannot delete provider with active journeys');
    });

    it('should allow deletion of providers with inactive journeys', async () => {
      // Create inactive journey with this provider
      const inactiveJourney = new Journey({
        name: 'Inactive Journey',
        description: 'A journey with inactive provider',
        price: 100.00,
        duration: '1 day',
        category: 'culture',
        status: 'inactive',
        providerId: testProvider._id
      });
      await inactiveJourney.save();

      const res = await request(app)
        .delete(`/manager/providers/${testProvider._id}`)
        .expect(200);

      expect(res.body.message).toBe('Provider deleted successfully');
    });

    it('should calculate average rating correctly', async () => {
      // Create providers with different ratings
      const provider1 = new Provider({
        name: 'Provider 1',
        type: 'hotel',
        rating: 3.0
      });
      await provider1.save();

      const provider2 = new Provider({
        name: 'Provider 2',
        type: 'restaurant',
        rating: 5.0
      });
      await provider2.save();

      const res = await request(app)
        .get('/manager/providers/stats')
        .expect(200);

      // Average should be (4.5 + 3.0 + 5.0) / 3 = 4.17
      expect(res.body.stats.averageRating).toBeCloseTo(4.17, 2);
    });
  });

  describe('Provider Type Validation', () => {
    it('should accept valid provider types', async () => {
      const validTypes = ['hotel', 'restaurant', 'transport', 'activity', 'other'];

      for (const type of validTypes) {
        const providerData = {
          name: `Test ${type}`,
          type: type
        };

        const res = await request(app)
          .post('/manager/providers')
          .send(providerData)
          .expect(201);

        expect(res.body.provider.type).toBe(type);
      }
    });

    it('should reject invalid provider types', async () => {
      const invalidTypes = ['invalid', 'unknown', 'test'];

      for (const type of invalidTypes) {
        const providerData = {
          name: `Test ${type}`,
          type: type
        };

        const res = await request(app)
          .post('/manager/providers')
          .send(providerData)
          .expect(400);

        expect(res.body.error).toBe('Invalid provider type');
      }
    });
  });

  describe('Rating System', () => {
    it('should handle decimal ratings', async () => {
      const providerData = {
        name: 'Test Provider',
        type: 'hotel',
        rating: 4.7
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(providerData)
        .expect(201);

      expect(res.body.provider.rating).toBe(4.7);
    });

    it('should handle zero rating', async () => {
      const providerData = {
        name: 'Test Provider',
        type: 'hotel',
        rating: 0
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(providerData)
        .expect(201);

      expect(res.body.provider.rating).toBe(0);
    });

    it('should reject negative ratings', async () => {
      const providerData = {
        name: 'Test Provider',
        type: 'hotel',
        rating: -1
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(providerData)
        .expect(400);

      expect(res.body.error).toBe('Rating must be between 0 and 5');
    });

    it('should reject ratings above 5', async () => {
      const providerData = {
        name: 'Test Provider',
        type: 'hotel',
        rating: 5.1
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(providerData)
        .expect(400);

      expect(res.body.error).toBe('Rating must be between 0 and 5');
    });
  });
});
