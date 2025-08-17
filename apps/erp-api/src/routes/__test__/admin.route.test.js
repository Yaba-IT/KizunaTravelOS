/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/__test__/admin.route.test.js - Admin routes tests
* Tests admin-specific route functionality and permissions
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const request = require('supertest');

const adminRouter = require('../admin');

const app = express();
app.use(express.json());
app.use('/admin', adminRouter);

describe('Admin routes', () => {
  describe('Authentication and Authorization', () => {
    it('should refuse access without token', async () => {
      const res = await request(app).get('/admin/users');
      expect(res.status).toBe(401);
    });

    it('should refuse access with wrong role', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/admin', fakeAuth, adminRouter);
      
      const res = await request(app2).get('/admin/users');
      expect(res.status).toBe(403);
    });

    it('should allow access with correct role', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'admin' };
        next();
      };
      const app3 = express();
      app3.use(express.json());
      app3.use('/admin', fakeAuth, adminRouter);
      
      const res = await request(app3).get('/admin/users');
      expect(res.status).toBe(200);
    });
  });

  describe('User management routes', () => {
    let authApp;

    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'admin' };
        next();
      };
      authApp = express();
      authApp.use(express.json());
      authApp.use('/admin', fakeAuth, adminRouter);
    });

    it('should handle GET /users', async () => {
      const res = await request(authApp).get('/admin/users');
      expect(res.status).toBe(200);
    });

    it('should handle GET /users/:userId', async () => {
      const res = await request(authApp).get('/admin/users/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /users', async () => {
      const res = await request(authApp).post('/admin/users')
        .send({ email: 'test@example.com', password: 'Password123!', role: 'agent' });
      expect(res.status).toBe(200);
    });

    it('should handle PUT /users/:userId', async () => {
      const res = await request(authApp).put('/admin/users/67890')
        .send({ status: 'active' });
      expect(res.status).toBe(200);
    });

    it('should handle DELETE /users/:userId', async () => {
      const res = await request(authApp).delete('/admin/users/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /users/:userId/status', async () => {
      const res = await request(authApp).post('/admin/users/67890/status')
        .send({ status: 'suspended' });
      expect(res.status).toBe(200);
    });

    it('should handle POST /users/:userId/role', async () => {
      const res = await request(authApp).post('/admin/users/67890/role')
        .send({ role: 'guide' });
      expect(res.status).toBe(200);
    });

    it('should handle POST /users/:userId/activate', async () => {
      const res = await request(authApp).post('/admin/users/67890/activate');
      expect(res.status).toBe(200);
    });

    it('should handle POST /users/:userId/deactivate', async () => {
      const res = await request(authApp).post('/admin/users/67890/deactivate');
      expect(res.status).toBe(200);
    });

    it('should handle POST /users/:userId/unlock', async () => {
      const res = await request(authApp).post('/admin/users/67890/unlock');
      expect(res.status).toBe(200);
    });

    it('should handle GET /users/stats', async () => {
      const res = await request(authApp).get('/admin/users/stats');
      expect(res.status).toBe(200);
    });
  });

  describe('Profile management routes', () => {
    let authApp;

    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'admin' };
        next();
      };
      authApp = express();
      authApp.use(express.json());
      authApp.use('/admin', fakeAuth, adminRouter);
    });

    it('should handle GET /profiles', async () => {
      const res = await request(authApp).get('/admin/profiles');
      expect(res.status).toBe(200);
    });

    it('should handle GET /profiles/:profileId', async () => {
      const res = await request(authApp).get('/admin/profiles/67890');
      expect(res.status).toBe(200);
    });

    it('should handle PUT /profiles/:profileId', async () => {
      const res = await request(authApp).put('/admin/profiles/67890')
        .send({ firstname: 'Updated', lastname: 'Name' });
      expect(res.status).toBe(200);
    });

    it('should handle DELETE /profiles/:profileId', async () => {
      const res = await request(authApp).delete('/admin/profiles/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /profiles/:profileId/restore', async () => {
      const res = await request(authApp).post('/admin/profiles/67890/restore');
      expect(res.status).toBe(200);
    });

    it('should handle GET /profiles/stats', async () => {
      const res = await request(authApp).get('/admin/profiles/stats');
      expect(res.status).toBe(200);
    });
  });

  describe('Booking management routes', () => {
    let authApp;

    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'admin' };
        next();
      };
      authApp = express();
      authApp.use(express.json());
      authApp.use('/admin', fakeAuth, adminRouter);
    });

    it('should handle GET /bookings', async () => {
      const res = await request(authApp).get('/admin/bookings');
      expect(res.status).toBe(200);
    });

    it('should handle GET /bookings/:bookingId', async () => {
      const res = await request(authApp).get('/admin/bookings/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /bookings', async () => {
      const res = await request(authApp).post('/admin/bookings')
        .send({ customerId: '67890', journeyId: '11111', date: '2024-01-01' });
      expect(res.status).toBe(200);
    });

    it('should handle PUT /bookings/:bookingId', async () => {
      const res = await request(authApp).put('/admin/bookings/67890')
        .send({ date: '2024-01-02' });
      expect(res.status).toBe(200);
    });

    it('should handle DELETE /bookings/:bookingId', async () => {
      const res = await request(authApp).delete('/admin/bookings/67890');
      expect(res.status).toBe(200);
    });

    it('should handle GET /bookings/stats', async () => {
      const res = await request(authApp).get('/admin/bookings/stats');
      expect(res.status).toBe(200);
    });
  });

  describe('Journey management routes', () => {
    let authApp;

    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'admin' };
        next();
      };
      authApp = express();
      authApp.use(express.json());
      authApp.use('/admin', fakeAuth, adminRouter);
    });

    it('should handle GET /journeys', async () => {
      const res = await request(authApp).get('/admin/journeys');
      expect(res.status).toBe(200);
    });

    it('should handle GET /journeys/:journeyId', async () => {
      const res = await request(authApp).get('/admin/journeys/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /journeys', async () => {
      const res = await request(authApp).post('/admin/journeys')
        .send({ name: 'New Journey', price: 200.00, duration: '2 days' });
      expect(res.status).toBe(200);
    });

    it('should handle PUT /journeys/:journeyId', async () => {
      const res = await request(authApp).put('/admin/journeys/67890')
        .send({ price: 250.00 });
      expect(res.status).toBe(200);
    });

    it('should handle DELETE /journeys/:journeyId', async () => {
      const res = await request(authApp).delete('/admin/journeys/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /journeys/:journeyId/assign-guide', async () => {
      const res = await request(authApp).post('/admin/journeys/67890/assign-guide')
        .send({ guideId: '99999' });
      expect(res.status).toBe(200);
    });

    it('should handle GET /journeys/stats', async () => {
      const res = await request(authApp).get('/admin/journeys/stats');
      expect(res.status).toBe(200);
    });
  });

  describe('Provider management routes', () => {
    let authApp;

    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'admin' };
        next();
      };
      authApp = express();
      authApp.use(express.json());
      authApp.use('/admin', fakeAuth, adminRouter);
    });

    it('should handle GET /providers', async () => {
      const res = await request(authApp).get('/admin/providers');
      expect(res.status).toBe(200);
    });

    it('should handle GET /providers/:providerId', async () => {
      const res = await request(authApp).get('/admin/providers/67890');
      expect(res.status).toBe(200);
    });

    it('should handle POST /providers', async () => {
      const res = await request(authApp).post('/admin/providers')
        .send({ name: 'New Provider', type: 'hotel' });
      expect(res.status).toBe(200);
    });

    it('should handle PUT /providers/:providerId', async () => {
      const res = await request(authApp).put('/admin/providers/67890')
        .send({ name: 'Updated Provider Name' });
      expect(res.status).toBe(200);
    });

    it('should handle DELETE /providers/:providerId', async () => {
      const res = await request(authApp).delete('/admin/providers/67890');
      expect(res.status).toBe(200);
    });
  });

  describe('System management routes', () => {
    let authApp;

    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'admin' };
        next();
      };
      authApp = express();
      authApp.use(express.json());
      authApp.use('/admin', fakeAuth, adminRouter);
    });

    it('should handle GET /system/stats', async () => {
      const res = await request(authApp).get('/admin/system/stats');
      expect(res.status).toBe(200);
    });

    it('should handle GET /system/health', async () => {
      const res = await request(authApp).get('/admin/system/health');
      expect(res.status).toBe(200);
    });

    it('should handle GET /system/audit-logs', async () => {
      const res = await request(authApp).get('/admin/system/audit-logs');
      expect(res.status).toBe(200);
    });

    it('should handle GET /system/security-events', async () => {
      const res = await request(authApp).get('/admin/system/security-events');
      expect(res.status).toBe(200);
    });
  });

  describe('Role and permission management routes', () => {
    let authApp;

    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'admin' };
        next();
      };
      authApp = express();
      authApp.use(express.json());
      authApp.use('/admin', fakeAuth, adminRouter);
    });

    it('should handle GET /roles', async () => {
      const res = await request(authApp).get('/admin/roles');
      expect(res.status).toBe(200);
    });

    it('should handle POST /roles', async () => {
      const res = await request(authApp).post('/admin/roles')
        .send({ name: 'new-role', permissions: ['read', 'write'] });
      expect(res.status).toBe(200);
    });

    it('should handle PUT /roles/:roleId', async () => {
      const res = await request(authApp).put('/admin/roles/67890')
        .send({ permissions: ['read', 'write', 'delete'] });
      expect(res.status).toBe(200);
    });

    it('should handle DELETE /roles/:roleId', async () => {
      const res = await request(authApp).delete('/admin/roles/67890');
      expect(res.status).toBe(200);
    });
  });

  describe('Data export and GDPR compliance routes', () => {
    let authApp;

    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'admin' };
        next();
      };
      authApp = express();
      authApp.use(express.json());
      authApp.use('/admin', fakeAuth, adminRouter);
    });

    it('should handle GET /export/users', async () => {
      const res = await request(authApp).get('/admin/export/users');
      expect(res.status).toBe(200);
    });

    it('should handle GET /export/bookings', async () => {
      const res = await request(authApp).get('/admin/export/bookings');
      expect(res.status).toBe(200);
    });

    it('should handle GET /export/journeys', async () => {
      const res = await request(authApp).get('/admin/export/journeys');
      expect(res.status).toBe(200);
    });
  });

  describe('Edge cases and error handling', () => {
    let authApp;

    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'admin' };
        next();
      };
      authApp = express();
      authApp.use(express.json());
      authApp.use('/admin', fakeAuth, adminRouter);
    });

    it('should handle invalid user ID format', async () => {
      const res = await request(authApp).get('/admin/users/invalid-id');
      expect(res.status).toBe(200); // Controller should handle validation
    });

    it('should handle missing required fields in POST requests', async () => {
      const res = await request(authApp).post('/admin/users')
        .send({}); // Empty body
      expect(res.status).toBe(200); // Controller should handle validation
    });

    it('should handle non-existent resource IDs', async () => {
      const res = await request(authApp).get('/admin/users/999999999');
      expect(res.status).toBe(200); // Controller should handle not found
    });
  });
});
