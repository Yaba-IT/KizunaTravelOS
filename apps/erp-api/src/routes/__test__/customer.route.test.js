/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/__test__/customer.route.test.js - Customer routes tests
* Tests customer-specific route functionality and permissions
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const request = require('supertest');

const customerRouter = require('../customer');

const app = express();
app.use(express.json());
app.use('/customer', customerRouter);

describe('Customer routes', () => {
  describe('Authentication and Authorization', () => {
    it('should refuse access without token', async () => {
      const res = await request(app).get('/customer/bookings');
      expect(res.status).toBe(401);
    });

    it('should refuse access with wrong role', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'guide' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/customer', fakeAuth, customerRouter);
      
      const res = await request(app2).get('/customer/bookings');
      expect(res.status).toBe(403);
    });

    it('should allow access with correct role', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app3 = express();
      app3.use(express.json());
      app3.use('/customer', fakeAuth, customerRouter);
      
      // Mock the controller methods
      const mockBookingCtrl = {
        getMyBookings: (req, res) => res.json({ bookings: [] })
      };
      jest.doMock('../../controllers/booking.js', () => mockBookingCtrl);
      
      const res = await request(app3).get('/customer/bookings');
      expect(res.status).toBe(200);
    });
  });

  describe('Booking routes', () => {
    it('should handle GET /bookings', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/customer', fakeAuth, customerRouter);
      
      const res = await request(app2).get('/customer/bookings');
      expect(res.status).toBe(200);
    });

    it('should handle GET /bookings/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/customer', fakeAuth, customerRouter);
      
      const res = await request(app2).get('/customer/bookings/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /bookings', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/customer', fakeAuth, customerRouter);
      
      const res = await request(app2).post('/customer/bookings')
        .send({ journeyId: '67890', date: '2024-01-01' });
      expect(res.status).toBe(200);
    });

    it('should handle PUT /bookings/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/customer', fakeAuth, customerRouter);
      
      const res = await request(app2).put('/customer/bookings/67890')
        .send({ date: '2024-01-02' });
      expect(res.status).toBe(200);
    });

    it('should handle DELETE /bookings/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/customer', fakeAuth, customerRouter);
      
      const res = await request(app2).delete('/customer/bookings/67890');
      expect(res.status).toBe(200);
    });
  });

  describe('Journey routes', () => {
    it('should handle GET /journeys', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/customer', fakeAuth, customerRouter);
      
      const res = await request(app2).get('/customer/journeys');
      expect(res.status).toBe(200);
    });

    it('should handle GET /journeys/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/customer', fakeAuth, customerRouter);
      
      const res = await request(app2).get('/customer/journeys/67890');
      expect(res.status).toBe(200);
    });
  });

  describe('Account routes', () => {
    it('should handle DELETE /account', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/customer', fakeAuth, customerRouter);
      
      const res = await request(app2).delete('/customer/account');
      expect(res.status).toBe(200);
    });
  });
});
