/* Yaba-IT/KizunaTravelOS
 * apps/erp-api/src/routes/__test__/agent.route.test.js
 *
 * coded by farid212@Yaba-IT!
 */

const express = require('express');
const request = require('supertest');

// Mocks des middlewares utilisés par src/routes/agent.js
jest.mock('../../middlewares/auth.js', () => (req, res, next) => {
  const raw = req.headers['x-test-user'];
  if (!raw) return res.status(401).json({ error: 'unauthenticated' });
  req.user = JSON.parse(raw); next();
});
jest.mock('../../middlewares/authorize.js', () => (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'forbidden' });
  next();
});

// Mocks des contrôleurs appelés par agent.js
jest.mock('../../controllers/user.js', () => ({
  getCustomers: (req, res) => res.status(200).json({ items: [] }),
  getCustomerById: (req, res) => res.status(200).json({ id: req.params.customerId }),
  updateCustomer: (req, res) => res.status(200).json({ id: req.params.customerId, ...req.body }),
  updateCustomerStatus: (req, res) => res.status(200).json({ id: req.params.customerId, status: req.body.status }),
}));

jest.mock('../../controllers/booking.js', () => ({
  getAllBookings: (req, res) => res.status(200).json({ items: [] }),
  getBookingById: (req, res) => res.status(200).json({ id: req.params.bookingId }),
  updateBooking: (req, res) => res.status(200).json({ id: req.params.bookingId, ...req.body }),
  updateBookingStatus: (req, res) => res.status(200).json({ id: req.params.bookingId, status: req.body.status }),
  createBookingForCustomer: (req, res) => res.status(201).json({ created: true, ...req.body }),
}));

jest.mock('../../controllers/journey.js', () => ({
  getAllJourneys: (req, res) => res.status(200).json({ items: [] }),
  getJourneyById: (req, res) => res.status(200).json({ id: req.params.journeyId }),
  updateJourney: (req, res) => res.status(200).json({ id: req.params.journeyId, ...req.body }),
  assignGuide: (req, res) => res.status(200).json({ id: req.params.journeyId, guideId: req.body.guideId }),
}));

jest.mock('../../controllers/provider.js', () => ({
  getAllProviders: (req, res) => res.status(200).json({ items: [] }),
  getProviderById: (req, res) => res.status(200).json({ id: req.params.providerId }),
  updateProvider: (req, res) => res.status(200).json({ id: req.params.providerId, ...req.body }),
}));

// Router à tester
const agentRouter = require('../agent');

// App de test
const app = express();
app.use(express.json());
app.use('/agent', agentRouter);

// helper pour header d'auth simulé
const as = (role) => ({ 'x-test-user': JSON.stringify({ id: 'u1', role }) });

describe('Agent routes', () => {
  describe('AuthZ', () => {
    it('401 sans token', async () => {
      const r = await request(app).get('/agent/customers');
      expect(r.status).toBe(401);
    });

    it('403 rôle invalide', async () => {
      const r = await request(app).get('/agent/customers').set(as('customer'));
      expect(r.status).toBe(403);
    });

    it('200 rôle agent', async () => {
      const r = await request(app).get('/agent/customers').set(as('agent'));
      expect(r.status).toBe(200);
    });
  });

  describe('Customers', () => {
    it('GET /customers -> 200', async () => {
      const r = await request(app).get('/agent/customers').set(as('agent'));
      expect(r.status).toBe(200);
    });

    it('GET /customers/:id invalide -> 400', async () => {
      const r = await request(app).get('/agent/customers/not-an-objectid').set(as('agent'));
      expect(r.status).toBe(400);
    });

    it('GET /customers/:id -> 200', async () => {
      const r = await request(app).get('/agent/customers/66aabbccddeeff0011223344').set(as('agent'));
      expect(r.status).toBe(200);
    });

    it('PUT /customers/:id -> 200', async () => {
      const r = await request(app)
        .put('/agent/customers/66aabbccddeeff0011223344')
        .set(as('agent'))
        .send({ status: 'active' });
      expect(r.status).toBe(200);
    });

    it('POST /customers/:id/status -> 200', async () => {
      const r = await request(app)
        .post('/agent/customers/66aabbccddeeff0011223344/status')
        .set(as('agent'))
        .send({ status: 'suspended' });
      expect(r.status).toBe(200);
    });
  });

  describe('Bookings', () => {
    it('GET /bookings -> 200', async () => {
      const r = await request(app).get('/agent/bookings').set(as('agent'));
      expect(r.status).toBe(200);
    });

    it('GET /bookings/:id invalide -> 400', async () => {
      const r = await request(app).get('/agent/bookings/abc').set(as('agent'));
      expect(r.status).toBe(400);
    });

    it('GET /bookings/:id -> 200', async () => {
      const r = await request(app).get('/agent/bookings/66aabbccddeeff0011223344').set(as('agent'));
      expect(r.status).toBe(200);
    });

    it('PUT /bookings/:id -> 200', async () => {
      const r = await request(app)
        .put('/agent/bookings/66aabbccddeeff0011223344')
        .set(as('agent'))
        .send({ date: '2025-01-02' });
      expect(r.status).toBe(200);
    });

    it('POST /bookings/:id/status -> 200', async () => {
      const r = await request(app)
        .post('/agent/bookings/66aabbccddeeff0011223344/status')
        .set(as('agent'))
        .send({ status: 'confirmed' });
      expect(r.status).toBe(200);
    });

    it('POST /bookings -> 201', async () => {
      const r = await request(app)
        .post('/agent/bookings')
        .set(as('agent'))
        .send({ customerId: '66aabbccddeeff0011223344', journeyId: '66aabbccddeeff0011223345', date: '2025-01-01' });
      expect([200,201]).toContain(r.status);
    });
  });

  describe('Journeys', () => {
    it('GET /journeys -> 200', async () => {
      const r = await request(app).get('/agent/journeys').set(as('agent'));
      expect(r.status).toBe(200);
    });

    it('GET /journeys/:id invalide -> 400', async () => {
      const r = await request(app).get('/agent/journeys/xyz').set(as('agent'));
      expect(r.status).toBe(400);
    });

    it('GET /journeys/:id -> 200', async () => {
      const r = await request(app).get('/agent/journeys/66aabbccddeeff0011223344').set(as('agent'));
      expect(r.status).toBe(200);
    });

    it('PUT /journeys/:id -> 200', async () => {
      const r = await request(app)
        .put('/agent/journeys/66aabbccddeeff0011223344')
        .set(as('agent'))
        .send({ price: 150.0 });
      expect(r.status).toBe(200);
    });

    it('POST /journeys/:id/assign-guide -> 200', async () => {
      const r = await request(app)
        .post('/agent/journeys/66aabbccddeeff0011223344/assign-guide')
        .set(as('agent'))
        .send({ guideId: '66aabbccddeeff0011223346' });
      expect(r.status).toBe(200);
    });
  });

  describe('Providers', () => {
    it('GET /providers -> 200', async () => {
      const r = await request(app).get('/agent/providers').set(as('agent'));
      expect(r.status).toBe(200);
    });

    it('GET /providers/:id invalide -> 400', async () => {
      const r = await request(app).get('/agent/providers/short').set(as('agent'));
      expect(r.status).toBe(400);
    });

    it('GET /providers/:id -> 200', async () => {
      const r = await request(app).get('/agent/providers/66aabbccddeeff0011223344').set(as('agent'));
      expect(r.status).toBe(200);
    });

    it('PUT /providers/:id -> 200', async () => {
      const r = await request(app)
        .put('/agent/providers/66aabbccddeeff0011223344')
        .set(as('agent'))
        .send({ name: 'Updated Provider Name' });
      expect(r.status).toBe(200);
    });
  });
});