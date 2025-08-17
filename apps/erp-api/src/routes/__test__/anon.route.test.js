/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/__test__/anon.route.test.js - Anonymous routes tests
* Tests public access routes and authentication endpoints
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const request = require('supertest');

const anonRouter = require('../anon');

const app = express();
app.use(express.json());
app.use('/', anonRouter);

describe('Anon routes', () => {
  describe('Authentication routes', () => {
    it('should handle POST /auth/register', async () => {
      const res = await request(app).post('/auth/register')
        .send({ 
          email: 'test@example.com', 
          password: 'Password123!', 
          firstname: 'John', 
          lastname: 'Doe' 
        });
      expect(res.status).toBe(200);
    });

    it('should handle POST /auth/login', async () => {
      const res = await request(app).post('/auth/login')
        .send({ 
          email: 'test@example.com', 
          password: 'Password123!' 
        });
      expect(res.status).toBe(200);
    });

    it('should handle POST /auth/forgot-password', async () => {
      const res = await request(app).post('/auth/forgot-password')
        .send({ email: 'test@example.com' });
      expect(res.status).toBe(200);
    });

    it('should handle POST /auth/reset-password', async () => {
      const res = await request(app).post('/auth/reset-password')
        .send({ 
          token: 'reset-token-123', 
          password: 'NewPassword123!' 
        });
      expect(res.status).toBe(200);
    });

    it('should handle POST /auth/verify-email', async () => {
      const res = await request(app).post('/auth/verify-email')
        .send({ token: 'verification-token-123' });
      expect(res.status).toBe(200);
    });

    it('should handle POST /auth/resend-verification', async () => {
      const res = await request(app).post('/auth/resend-verification')
        .send({ email: 'test@example.com' });
      expect(res.status).toBe(200);
    });
  });

  describe('Public journey routes', () => {
    it('should handle GET /journeys', async () => {
      const res = await request(app).get('/journeys');
      expect(res.status).toBe(200);
    });

    it('should handle GET /journeys/:id', async () => {
      const res = await request(app).get('/journeys/67890');
      expect(res.status).toBe(200);
    });

    it('should handle GET /journeys/search', async () => {
      const res = await request(app).get('/journeys/search?q=paris');
      expect(res.status).toBe(200);
    });

    it('should handle GET /journeys/search with multiple query params', async () => {
      const res = await request(app).get('/journeys/search?q=paris&minPrice=100&maxPrice=500');
      expect(res.status).toBe(200);
    });
  });

  describe('Public provider routes', () => {
    it('should handle GET /providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.status).toBe(200);
    });

    it('should handle GET /providers/:id', async () => {
      const res = await request(app).get('/providers/67890');
      expect(res.status).toBe(200);
    });
  });

  describe('Health check route', () => {
    it('should handle GET /health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body.status).toBe('OK');
    });
  });

  describe('Route validation', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app).get('/non-existent-route');
      expect(res.status).toBe(404);
    });

    it('should handle malformed JSON in POST requests', async () => {
      const res = await request(app)
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      expect(res.status).toBe(400);
    });

    it('should handle empty request body', async () => {
      const res = await request(app).post('/auth/login');
      expect(res.status).toBe(400);
    });
  });

  describe('Query parameter handling', () => {
    it('should handle pagination parameters', async () => {
      const res = await request(app).get('/journeys?page=2&limit=20');
      expect(res.status).toBe(200);
    });

    it('should handle search parameters', async () => {
      const res = await request(app).get('/journeys/search?q=paris&category=culture');
      expect(res.status).toBe(200);
    });

    it('should handle filter parameters', async () => {
      const res = await request(app).get('/providers?type=hotel&rating=4');
      expect(res.status).toBe(200);
    });
  });
});
