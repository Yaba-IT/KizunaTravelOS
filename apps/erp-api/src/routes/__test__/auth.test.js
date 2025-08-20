/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/__test__/auth.test.js - Authentication and validation tests
* Tests authentication, authorization, and data validation functionality
*
* coded by farid212@Yaba-IT!
*/

const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';

// Import the full app but don't start the server
const app = require('../../index');

// Prevent the server from starting during tests
if (app.listen) {
  const originalListen = app.listen;
  app.listen = function() {
    // Do nothing - prevent server from starting
    return { close: () => {} };
  };
}

describe('Authentication and Validation Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    const testDbUri = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI;
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }
  }, 15000);

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  describe('User Registration Validation', () => {
    it('should register user with valid data', async () => {
      const validUserData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstname: 'John',
        lastname: 'Doe'
      };

      const res = await request(app)
        .post('/auth/register')
        .send(validUserData)
        .expect(200);

      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(validUserData.email);
    }, 15000);

    it('should reject registration with missing email', async () => {
      const invalidUserData = {
        password: 'Password123!',
        firstname: 'John',
        lastname: 'Doe'
      };

      const res = await request(app)
        .post('/auth/register')
        .send(invalidUserData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'email',
          code: 'MISSING_REQUIRED_FIELD'
        })
      );
    }, 15000);

    it('should reject registration with invalid email format', async () => {
      const invalidUserData = {
        email: 'invalid-email',
        password: 'Password123!',
        firstname: 'John',
        lastname: 'Doe'
      };

      const res = await request(app)
        .post('/auth/register')
        .send(invalidUserData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'email',
          code: 'PATTERN_VIOLATION'
        })
      );
    }, 15000);

    it('should reject registration with weak password', async () => {
      const invalidUserData = {
        email: 'test@example.com',
        password: 'weak',
        firstname: 'John',
        lastname: 'Doe'
      };

      const res = await request(app)
        .post('/auth/register')
        .send(invalidUserData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'password',
          code: 'MIN_LENGTH_VIOLATION'
        })
      );
    }, 15000);

    it('should reject registration with invalid firstname', async () => {
      const invalidUserData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstname: 'J', // Too short
        lastname: 'Doe'
      };

      const res = await request(app)
        .post('/auth/register')
        .send(invalidUserData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'firstname',
          code: 'MIN_LENGTH_VIOLATION'
        })
      );
    }, 15000);
  });

  describe('User Login Validation', () => {
    it('should login with valid credentials', async () => {
      const validLoginData = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const res = await request(app)
        .post('/auth/login')
        .send(validLoginData)
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    }, 15000);

    it('should reject login with missing email', async () => {
      const invalidLoginData = {
        password: 'Password123!'
      };

      const res = await request(app)
        .post('/auth/login')
        .send(invalidLoginData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'email',
          code: 'MISSING_REQUIRED_FIELD'
        })
      );
    }, 15000);

    it('should reject login with invalid email format', async () => {
      const invalidLoginData = {
        email: 'invalid-email',
        password: 'Password123!'
      };

      const res = await request(app)
        .post('/auth/login')
        .send(invalidLoginData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'email',
          code: 'PATTERN_VIOLATION'
        })
      );
    }, 15000);
  });

  describe('Protected Route Access', () => {
    it('should allow access to customer routes with customer role', async () => {
      const res = await request(app)
        .get('/customer/bookings')
        .expect(200);

      expect(res.body).toBeDefined();
    }, 15000);

    it('should allow access to manager routes with manager role', async () => {
      const res = await request(app)
        .get('/manager/users')
        .expect(200);

      expect(res.body).toBeDefined();
    }, 15000);

    it('should return 404 for unknown routes', async () => {
      const res = await request(app)
        .get('/unknown/route')
        .expect(404);

      expect(res.body.error).toBe('Not Found');
      expect(res.body.code).toBe('ROUTE_NOT_FOUND');
    }, 15000);
  });

  describe('Provider Creation Validation', () => {
    it('should create provider with valid data', async () => {
      const validProviderData = {
        name: 'Test Hotel',
        type: 'hotel',
        legalName: 'Test Hotel LLC',
        contact: {
          primaryContact: {
            name: 'John Manager',
            email: 'manager@testhotel.com',
            phone: '+1234567890'
          }
        },
        address: {
          street: '123 Test Street',
          city: 'Test City',
          country: 'Test Country'
        },
        rating: 4.5
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(validProviderData)
        .expect(201);

      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('provider');
      expect(res.body.provider.name).toBe(validProviderData.name);
    }, 15000);

    it('should reject provider creation with missing required fields', async () => {
      const invalidProviderData = {
        name: 'Test Hotel'
        // Missing type, legalName, contact, address
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(invalidProviderData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'type',
          code: 'MISSING_REQUIRED_FIELD'
        })
      );
    }, 15000);

    it('should reject provider creation with invalid type', async () => {
      const invalidProviderData = {
        name: 'Test Provider',
        type: 'invalid_type',
        legalName: 'Test Provider LLC',
        contact: {
          primaryContact: {
            name: 'John Manager',
            email: 'manager@testprovider.com',
            phone: '+1234567890'
          }
        },
        address: {
          street: '123 Test Street',
          city: 'Test City',
          country: 'Test Country'
        }
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(invalidProviderData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'type',
          code: 'ENUM_VIOLATION'
        })
      );
    }, 15000);

    it('should reject provider creation with invalid rating', async () => {
      const invalidProviderData = {
        name: 'Test Hotel',
        type: 'hotel',
        legalName: 'Test Hotel LLC',
        contact: {
          primaryContact: {
            name: 'John Manager',
            email: 'manager@testhotel.com',
            phone: '+1234567890'
          }
        },
        address: {
          street: '123 Test Street',
          city: 'Test City',
          country: 'Test Country'
        },
        rating: 6.0 // Invalid rating > 5
      };

      const res = await request(app)
        .post('/manager/providers')
        .send(invalidProviderData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'rating',
          code: 'MAX_VALUE_VIOLATION'
        })
      );
    }, 15000);
  });

  describe('Journey Creation Validation', () => {
    it('should create journey with valid data', async () => {
      const validJourneyData = {
        name: 'Test Journey',
        category: 'cultural',
        type: 'guided',
        duration: {
          days: 3,
          nights: 2
        },
        pricing: {
          basePrice: 299.99,
          currency: 'USD'
        },
        capacity: {
          maxParticipants: 10
        },
        schedule: {
          startDate: '2024-06-01',
          endDate: '2024-06-03'
        }
      };

      const res = await request(app)
        .post('/manager/journeys')
        .send(validJourneyData)
        .expect(201);

      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('journey');
      expect(res.body.journey.name).toBe(validJourneyData.name);
    }, 15000);

    it('should reject journey creation with missing required fields', async () => {
      const invalidJourneyData = {
        name: 'Test Journey'
        // Missing category, type, duration, pricing, capacity, schedule
      };

      const res = await request(app)
        .post('/manager/journeys')
        .send(invalidJourneyData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'category',
          code: 'MISSING_REQUIRED_FIELD'
        })
      );
    }, 15000);

    it('should reject journey creation with invalid category', async () => {
      const invalidJourneyData = {
        name: 'Test Journey',
        category: 'invalid_category',
        type: 'guided',
        duration: {
          days: 3,
          nights: 2
        },
        pricing: {
          basePrice: 299.99,
          currency: 'USD'
        },
        capacity: {
          maxParticipants: 10
        },
        schedule: {
          startDate: '2024-06-01',
          endDate: '2024-06-03'
        }
      };

      const res = await request(app)
        .post('/manager/journeys')
        .send(invalidJourneyData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'category',
          code: 'ENUM_VIOLATION'
        })
      );
    }, 15000);
  });
});
