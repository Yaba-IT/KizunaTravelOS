/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/__test__/manager.route.test.js - Manager routes tests
* Tests manager-specific route functionality and permissions
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const request = require('supertest');

const managerRouter = require('../manager');

const app = express();
app.use(express.json());
app.use('/manager', managerRouter);

describe('Manager routes', () => {
  describe('Authentication and Authorization', () => {
    it('should refuse access without token', async () => {
      const res = await request(app).get('/manager/users');
      expect(res.status).toBe(401);
    });

    it('should refuse access with wrong role', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'agent' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/users');
      expect(res.status).toBe(403);
    });

    it('should allow access with correct role', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app3 = express();
      app3.use(express.json());
      app3.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app3).get('/manager/users');
      expect(res.status).toBe(200);
    });
  });

  describe('User management routes', () => {
    it('should handle GET /users', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/users');
      expect(res.status).toBe(200);
    });

    it('should handle GET /users/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/users/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /users', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).post('/manager/users')
        .send({ email: 'test@example.com', password: 'Password123!', role: 'agent' });
      expect(res.status).toBe(200);
    });

    it('should handle PUT /users/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).put('/manager/users/67890')
        .send({ status: 'active' });
      expect(res.status).toBe(200);
    });

    it('should handle DELETE /users/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).delete('/manager/users/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /users/:id/status', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).post('/manager/users/67890/status')
        .send({ status: 'suspended' });
      expect(res.status).toBe(200);
    });

    it('should handle POST /users/:id/role', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).post('/manager/users/67890/role')
        .send({ role: 'guide' });
      expect(res.status).toBe(200);
    });
  });

  describe('Profile management routes', () => {
    it('should handle GET /profiles', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/profiles');
      expect(res.status).toBe(200);
    });

    it('should handle GET /profiles/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/profiles/67890');
      expect(res.status).toBe(200);
    });

    it('should handle PUT /profiles/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).put('/manager/profiles/67890')
        .send({ firstname: 'Updated', lastname: 'Name' });
      expect(res.status).toBe(200);
    });

    it('should handle DELETE /profiles/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).delete('/manager/profiles/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /profiles/:id/restore', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).post('/manager/profiles/67890/restore');
      expect(res.status).toBe(200);
    });

    it('should handle GET /profiles/stats', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/profiles/stats');
      expect(res.status).toBe(200);
    });
  });

  describe('Booking management routes', () => {
    it('should handle GET /bookings', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/bookings');
      expect(res.status).toBe(200);
    });

    it('should handle GET /bookings/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/bookings/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /bookings', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).post('/manager/bookings')
        .send({ customerId: '67890', journeyId: '11111', date: '2024-01-01' });
      expect(res.status).toBe(200);
    });

    it('should handle PUT /bookings/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).put('/manager/bookings/67890')
        .send({ date: '2024-01-02' });
      expect(res.status).toBe(200);
    });

    it('should handle DELETE /bookings/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).delete('/manager/bookings/67890');
      expect(res.status).toBe(200);
    });

    it('should handle GET /bookings/stats', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/bookings/stats');
      expect(res.status).toBe(200);
    });
  });

  describe('Journey management routes', () => {
    it('should handle GET /journeys', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/journeys');
      expect(res.status).toBe(200);
    });

    it('should handle GET /journeys/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/journeys/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /journeys', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).post('/manager/journeys')
        .send({ name: 'New Journey', price: 200.00, duration: '2 days' });
      expect(res.status).toBe(200);
    });

    it('should handle PUT /journeys/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).put('/manager/journeys/67890')
        .send({ price: 250.00 });
      expect(res.status).toBe(200);
    });

    it('should handle DELETE /journeys/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).delete('/manager/journeys/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /journeys/:id/assign-guide', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).post('/manager/journeys/67890/assign-guide')
        .send({ guideId: '99999' });
      expect(res.status).toBe(200);
    });

    it('should handle GET /journeys/stats', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/journeys/stats');
      expect(res.status).toBe(200);
    });
  });

  describe('Provider management routes', () => {
    it('should handle GET /providers', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/providers');
      expect(res.status).toBe(200);
    });

    it('should handle GET /providers/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/providers/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /providers', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).post('/manager/providers')
        .send({ name: 'New Provider', type: 'hotel' });
      expect(res.status).toBe(200);
    });

    it('should handle PUT /providers/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).put('/manager/providers/67890')
        .send({ name: 'Updated Provider Name' });
      expect(res.status).toBe(200);
    });

    it('should handle DELETE /providers/:id', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).delete('/manager/providers/67890');
      expect(res.status).toBe(200);
    });
  });

  describe('System management routes', () => {
    it('should handle GET /system/stats', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/system/stats');
      expect(res.status).toBe(200);
    });

    it('should handle GET /system/health', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app2).get('/manager/system/health');
      expect(res.status).toBe(200);
    });
  });
});
