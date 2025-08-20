/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/__test__/guide.route.test.js - Guide routes tests
* Tests guide-specific route functionality and permissions
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const request = require('supertest');

const guideRouter = require('../guide');

const app = express();
app.use(express.json());
app.use('/guide', guideRouter);

describe('Guide routes', () => {
  describe('Authentication and Authorization', () => {
    it('should refuse access without token', async () => {
      const res = await request(app).get('/guide/journeys');
      expect(res.status).toBe(401);
    });

    it('should refuse access with wrong role', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/guide', fakeAuth, guideRouter);
      
      const res = await request(app2).get('/guide/journeys');
      expect(res.status).toBe(403);
    });

    it('should allow access with correct role', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'guide' };
        next();
      };
      const app3 = express();
      app3.use(express.json());
      app3.use('/guide', fakeAuth, guideRouter);
      
      const res = await request(app3).get('/guide/journeys');
      expect(res.status).toBe(200);
    });
  });

  describe('Journey routes', () => {
    it('should handle GET /journeys', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'guide' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/guide', fakeAuth, guideRouter);
      
      const res = await request(app2).get('/guide/journeys');
      expect(res.status).toBe(200);
    });

    it('should handle GET /journeys/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'guide' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/guide', fakeAuth, guideRouter);
      
      const res = await request(app2).get('/guide/journeys/67890');
      expect(res.status).toBe(200);
    });

    it('should handle PUT /journeys/:id/status', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'guide' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/guide', fakeAuth, guideRouter);
      
      const res = await request(app2).put('/guide/journeys/67890/status')
        .send({ status: 'completed' });
      expect(res.status).toBe(200);
    });

    it('should handle POST /journeys/:id/notes', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'guide' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/guide', fakeAuth, guideRouter);
      
      const res = await request(app2).post('/guide/journeys/67890/notes')
        .send({ notes: 'Great tour experience' });
      expect(res.status).toBe(200);
    });
  });

  describe('Booking routes', () => {
    it('should handle GET /bookings', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'guide' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/guide', fakeAuth, guideRouter);
      
      const res = await request(app2).get('/guide/bookings');
      expect(res.status).toBe(200);
    });

    it('should handle GET /bookings/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'guide' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/guide', fakeAuth, guideRouter);
      
      const res = await request(app2).get('/guide/bookings/67890');
      expect(res.status).toBe(200);
    });

    it('should handle PUT /bookings/:id/status', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'guide' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/guide', fakeAuth, guideRouter);
      
      const res = await request(app2).put('/guide/bookings/67890/status')
        .send({ status: 'confirmed' });
      expect(res.status).toBe(200);
    });
  });

  describe('Schedule and Availability routes', () => {
    it('should handle GET /schedule', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'guide' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/guide', fakeAuth, guideRouter);
      
      const res = await request(app2).get('/guide/schedule');
      expect(res.status).toBe(200);
    });

    it('should handle PUT /availability', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'guide' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/guide', fakeAuth, guideRouter);
      
      const res = await request(app2).put('/guide/availability')
        .send({ available: true, dates: ['2024-01-01', '2024-01-02'] });
      expect(res.status).toBe(200);
    });
  });
});
