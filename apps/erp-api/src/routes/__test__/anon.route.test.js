/* Yaba-IT/KizunaTravelOS
 * apps/erp-api/src/routes/__test__/anon.route.test.js
 *
 * Tests des routes publiques (anon)
 *
 * coded by farid212@Yaba-IT!
 */

const request = require('supertest');
const express = require('express');

// Assure l'env de test avant les imports
process.env.NODE_ENV = 'test';

/* Mocks contrôleurs: pas d'I/O réels, on renvoie des 200/201 déterministes */
jest.mock('../../controllers/user.js', () => ({
  register: (req, res) => res.status(201).json({ ok: true }),
  login: (req, res) => res.status(200).json({ token: 'test-token' }),
  forgotPassword: (req, res) => res.status(200).json({ ok: true }),
  resetPassword: (req, res) => res.status(200).json({ ok: true }),
  verifyEmail: (req, res) => res.status(200).json({ ok: true }),
  resendVerification: (req, res) => res.status(200).json({ ok: true }),
}));

jest.mock('../../controllers/journey.js', () => ({
  getPublicJourneys: (req, res) => res.status(200).json({ items: [], page: 1, total: 0 }),
  searchPublicJourneys: (req, res) => res.status(200).json({ items: [], query: req.query.q || '' }),
  getPublicJourneyDetails: (req, res) => res.status(200).json({ id: req.params.id }),
}));

jest.mock('../../controllers/provider.js', () => ({
  getPublicProviders: (req, res) => res.status(200).json({ items: [] }),
  getPublicProviderDetails: (req, res) => res.status(200).json({ id: req.params.id }),
}));

// Mock mongoose pour éviter les erreurs de connexion DB
jest.mock('mongoose', () => ({
  connection: {
    readyState: 1
  }
}));

// Mock express-mongo-sanitize
jest.mock('express-mongo-sanitize', () => () => (req, res, next) => {
  // Simulate sanitization
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string' && req.body[key].includes('$')) {
        delete req.body[key];
      }
    });
  }
  next();
});

// App de test minimale avec uniquement le router anon
const anonRouter = require('../anon'); // depuis src/routes/__test__ -> ../anon
const app = express();
app.use(express.json());
app.use('/', anonRouter);

describe('Anon routes', () => {
  describe('API Root', () => {
    it('GET / -> 200', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('endpoints');
      expect(res.body.endpoints).toHaveProperty('auth');
      expect(res.body.endpoints).toHaveProperty('public');
      expect(res.body.endpoints).toHaveProperty('authenticated');
    });
  });

  describe('Auth', () => {
    it('POST /auth/register -> 201', async () => {
      const res = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        firstname: 'John',
        lastname: 'Doe',
      });
      expect([200, 201]).toContain(res.status);
    });

    it('POST /auth/login empty body -> 400', async () => {
      const res = await request(app).post('/auth/login');
      expect(res.status).toBe(400);
    });

    it('POST /auth/login valid -> 200', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'Password123!',
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('POST /auth/forgot-password -> 200', async () => {
      const res = await request(app).post('/auth/forgot-password').send({ email: 'test@example.com' });
      expect(res.status).toBe(200);
    });

    it('POST /auth/reset-password -> 200', async () => {
      const res = await request(app).post('/auth/reset-password').send({
        token: 'reset-token-123',
        password: 'NewPassword123!',
      });
      expect(res.status).toBe(200);
    });

    it('POST /auth/verify-email -> 200', async () => {
      const res = await request(app).post('/auth/verify-email').send({ token: 'verification-token-123' });
      expect(res.status).toBe(200);
    });

    it('POST /auth/resend-verification -> 200', async () => {
      const res = await request(app).post('/auth/resend-verification').send({ email: 'test@example.com' });
      expect(res.status).toBe(200);
    });
  });

  describe('Journeys', () => {
    it('GET /journeys -> 200', async () => {
      const res = await request(app).get('/journeys');
      expect(res.status).toBe(200);
    });

    it('GET /journeys/search -> 200', async () => {
      const res = await request(app).get('/journeys/search?q=paris');
      expect(res.status).toBe(200);
    });

    it('GET /journeys/:id -> 200', async () => {
      const res = await request(app).get('/journeys/507f1f77bcf86cd799439011');
      expect(res.status).toBe(200);
    });

    it('GET /journeys/:invalidId -> 400', async () => {
      const res = await request(app).get('/journeys/invalid-id');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'invalid_id');
    });
  });

  describe('Providers', () => {
    it('GET /providers -> 200', async () => {
      const res = await request(app).get('/providers');
      expect(res.status).toBe(200);
    });

    it('GET /providers/:id -> 200', async () => {
      const res = await request(app).get('/providers/507f1f77bcf86cd799439011');
      expect(res.status).toBe(200);
    });

    it('GET /providers/:invalidId -> 400', async () => {
      const res = await request(app).get('/providers/invalid-id');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'invalid_id');
    });
  });
});