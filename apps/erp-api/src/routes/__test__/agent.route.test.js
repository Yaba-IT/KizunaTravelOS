/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/__test__/agent.route.test.js - Agent routes tests
* Tests agent-specific route functionality and permissions
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const request = require('supertest');

const agentRouter = require('../agent');

const app = express();
app.use(express.json());
app.use('/agent', agentRouter);

describe('Agent routes', () => {
  describe('Authentication and Authorization', () => {
    it('should refuse access without token', async () => {
      const res = await request(app).get('/agent/customers');
      expect(res.status).toBe(401);
    });

    it('should refuse access with wrong role', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).get('/agent/customers');
      expect(res.status).toBe(403);
    });

    it('should allow access with correct role', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app3 = express();
      app3.use(express.json());
      app3.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app3).get('/agent/customers');
      expect(res.status).toBe(200);
    });
  });

  describe('Customer management routes', () => {
    it('should handle GET /customers', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).get('/agent/customers');
      expect(res.status).toBe(200);
    });

    it('should handle GET /customers/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).get('/agent/customers/67890');
      expect(res.status).toBe(200);
    });

    it('should handle PUT /customers/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).put('/agent/customers/67890')
        .send({ status: 'active' });
      expect(res.status).toBe(200);
    });

    it('should handle POST /customers/:id/status', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).post('/agent/customers/67890/status')
        .send({ status: 'suspended' });
      expect(res.status).toBe(200);
    });
  });

  describe('Booking management routes', () => {
    it('should handle GET /bookings', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).get('/agent/bookings');
      expect(res.status).toBe(200);
    });

    it('should handle GET /bookings/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).get('/agent/bookings/67890');
      expect(res.status).toBe(200);
    });

    it('should handle PUT /bookings/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).put('/agent/bookings/67890')
        .send({ date: '2024-01-02' });
      expect(res.status).toBe(200);
    });

    it('should handle POST /bookings/:id/status', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).post('/agent/bookings/67890/status')
        .send({ status: 'confirmed' });
      expect(res.status).toBe(200);
    });

    it('should handle POST /bookings', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).post('/agent/bookings')
        .send({ customerId: '67890', journeyId: '11111', date: '2024-01-01' });
      expect(res.status).toBe(200);
    });
  });

  describe('Journey management routes', () => {
    it('should handle GET /journeys', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).get('/agent/journeys');
      expect(res.status).toBe(200);
    });

    it('should handle GET /journeys/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).get('/agent/journeys/67890');
      expect(res.status).toBe(200);
    });

    it('should handle PUT /journeys/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).put('/agent/journeys/67890')
        .send({ price: 150.00 });
      expect(res.status).toBe(200);
    });

    it('should handle POST /journeys/:id/assign-guide', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).post('/agent/journeys/67890/assign-guide')
        .send({ guideId: '99999' });
      expect(res.status).toBe(200);
    });
  });

  describe('Provider management routes', () => {
    it('should handle GET /providers', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).get('/agent/providers');
      expect(res.status).toBe(200);
    });

    it('should handle GET /providers/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).get('/agent/providers/67890');
      expect(res.status).toBe(200);
    });

    it('should handle PUT /providers/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/agent', fakeAuth, agentRouter);
      
      const res = await request(app2).put('/agent/providers/67890')
        .send({ name: 'Updated Provider Name' });
      expect(res.status).toBe(200);
    });
  });
});
