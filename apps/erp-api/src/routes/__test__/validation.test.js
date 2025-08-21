/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/__test__/validation.test.js - Validation middleware tests
* Tests the data validation middleware functionality
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

describe.skip('Validation Middleware Tests', () => {
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

  describe.skip('User Registration Validation', () => {
    it('should validate missing email', async () => {
      const invalidData = {
        password: 'Password123!',
        firstname: 'John',
        lastname: 'Doe'
      };

      const res = await request(app)
        .post('/auth/register')
        .send(invalidData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'email',
          code: 'MISSING_REQUIRED_FIELD'
        })
      );
    }, 15000);

    it('should validate invalid email format', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123!',
        firstname: 'John',
        lastname: 'Doe'
      };

      const res = await request(app)
        .post('/auth/register')
        .send(invalidData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'email',
          code: 'PATTERN_VIOLATION'
        })
      );
    }, 15000);

    it('should validate weak password', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        firstname: 'John',
        lastname: 'Doe'
      };

      const res = await request(app)
        .post('/auth/register')
        .send(invalidData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'password',
          code: 'MIN_LENGTH_VIOLATION'
        })
      );
    }, 15000);
  });

  describe('User Login Validation', () => {
    it('should validate missing email in login', async () => {
      const invalidData = {
        password: 'Password123!'
      };

      const res = await request(app)
        .post('/auth/login')
        .send(invalidData)
        .expect(400);

      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toContainEqual(
        expect.objectContaining({
          field: 'email',
          code: 'MISSING_REQUIRED_FIELD'
        })
      );
    }, 15000);
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('OK');
      expect(res.body).toHaveProperty('timestamp');
    }, 15000);
  });
});
