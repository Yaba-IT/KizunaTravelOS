/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/__test__/shared.route.test.js - Shared routes tests
* Tests common route functionality shared across user types
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const request = require('supertest');

const sharedRouter = require('../shared');

const app = express();
app.use(express.json());
app.use('/profile', sharedRouter);

describe('Shared routes', () => {
  describe('Authentication and Authorization', () => {
    it('should refuse access without token', async () => {
      const res = await request(app).get('/profile/profile/me');
      expect(res.status).toBe(401);
    });

    it('should allow access with valid token', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, sharedRouter);
      
      const res = await request(app2).get('/profile/profile/me');
      expect(res.status).toBe(200);
    });

    it('should allow access for any authenticated role', async () => {
      const roles = ['customer', 'guide', 'agent', 'manager', 'admin'];
      
      for (const role of roles) {
        const fakeAuth = (req, res, next) => {
          req.user = { id: '12345', role: role };
          next();
        };
        const app2 = express();
        app2.use(express.json());
        app2.use('/profile', fakeAuth, sharedRouter);
        
        const res = await request(app2).get('/profile/profile/me');
        expect(res.status).toBe(200);
      }
    });
  });

  describe('Profile routes', () => {
    it('should handle GET /profile/me', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, sharedRouter);
      
      const res = await request(app2).get('/profile/profile/me');
      expect(res.status).toBe(200);
    });

    it('should handle PUT /profile/me', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, sharedRouter);
      
      const res = await request(app2).put('/profile/profile/me')
        .send({ firstname: 'Updated', lastname: 'Name' });
      expect(res.status).toBe(200);
    });
  });

  describe('Account management routes', () => {
    it('should handle PUT /account/password', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, sharedRouter);
      
      const res = await request(app2).put('/profile/account/password')
        .send({ 
          currentPassword: 'OldPassword123!', 
          newPassword: 'NewPassword123!' 
        });
      expect(res.status).toBe(200);
    });

    it('should handle PUT /account/email', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, sharedRouter);
      
      const res = await request(app2).put('/profile/account/email')
        .send({ 
          currentPassword: 'Password123!', 
          newEmail: 'newemail@example.com' 
        });
      expect(res.status).toBe(200);
    });
  });

  describe('Profile with user ID routes', () => {
    it('should refuse access if not own profile', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: 'not-matching-id', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, sharedRouter);
      
      const res = await request(app2).get('/profile/12345');
      expect(res.status).toBe(403);
    });

    it('should allow access if own profile', async () => {
      const matchingId = '12345';
      const fakeAuth = (req, res, next) => {
        req.user = { id: matchingId, role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, sharedRouter);
      
      const res = await request(app2).get('/profile/' + matchingId);
      expect(res.status).toBe(200);
    });

    it('should handle PUT /:userId', async () => {
      const matchingId = '12345';
      const fakeAuth = (req, res, next) => {
        req.user = { id: matchingId, role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, sharedRouter);
      
      const res = await request(app2).put('/profile/' + matchingId)
        .send({ firstname: 'Updated', lastname: 'Name' });
      expect(res.status).toBe(200);
    });
  });

  describe('Data validation', () => {
    it('should validate profile update data', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, sharedRouter);
      
      // Test with invalid data
      const res = await request(app2).put('/profile/profile/me')
        .send({ firstname: '', lastname: '' });
      expect(res.status).toBe(400);
    });

    it('should validate password change data', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, sharedRouter);
      
      // Test with weak password
      const res = await request(app2).put('/profile/account/password')
        .send({ 
          currentPassword: 'OldPassword123!', 
          newPassword: 'weak' 
        });
      expect(res.status).toBe(400);
    });

    it('should validate email format', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, sharedRouter);
      
      // Test with invalid email format
      const res = await request(app2).put('/profile/account/email')
        .send({ 
          currentPassword: 'Password123!', 
          newEmail: 'invalid-email' 
        });
      expect(res.status).toBe(400);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, sharedRouter);
      
      const res = await request(app2)
        .put('/profile/profile/me')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      expect(res.status).toBe(400);
    });

    it('should handle empty request body', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, sharedRouter);
      
      const res = await request(app2).put('/profile/profile/me');
      expect(res.status).toBe(400);
    });
  });
});
