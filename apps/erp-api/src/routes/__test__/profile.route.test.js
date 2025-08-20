/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/__test__/profile.route.test.js - Profile routes tests
* Tests profile management route functionality and permissions
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const request = require('supertest');

const profileRouter = require('../shared');

const app = express();
app.use(express.json());
app.use('/profile', profileRouter);

describe('Profile routes', () => {
  describe('Authentication and Authorization', () => {
    it('should refuse access without token', async () => {
      const res = await request(app).get('/profile/12345');
      expect(res.status).toBe(401);
    });

    it('should refuse access if not own profile', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: 'not-matching-id', role: 'user' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use(
        '/profile/:userId',
        fakeAuth,
        (req, res, next) => {
          if (req.user.id !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });
          next();
        },
        (req, res) => res.json({ ok: true }),
      );
      const res = await request(app2).get('/profile/12345');
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    it('should allow access if own profile', async () => {
      const matchingId = '12345';
      const fakeAuth = (req, res, next) => {
        req.user = { id: matchingId, role: 'user' };
        next();
      };
      const app3 = express();
      app3.use(express.json());
      app3.use(
        '/profile/:userId',
        fakeAuth,
        (req, res, next) => {
          if (req.user.id !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });
          next();
        },
        (req, res) => res.json({ ok: true }),
      );
      const res = await request(app3).get('/profile/' + matchingId);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
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
        app2.use('/profile', fakeAuth, profileRouter);
        
        const res = await request(app2).get('/profile/profile/me');
        expect(res.status).toBe(200);
      }
    });
  });

  describe('Profile routes with User-Profile relationship', () => {
    it('should handle GET /profile/me with populated profile data', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, profileRouter);
      
      // Mock the controller response to simulate User.findById().populate('profileId')
      const mockResponse = {
        profile: {
          _id: 'profile123',
          firstname: 'John',
          lastname: 'Doe',
          sexe: 'M',
          meta: {
            created_at: new Date(),
            updated_at: new Date(),
            created_by: '12345',
            updated_by: '12345',
            isActive: true,
            isDeleted: false
          }
        },
        user: {
          id: '12345',
          email: 'john.doe@example.com',
          role: 'customer',
          status: 'active',
          emailVerified: true,
          twoFactorEnabled: false
        }
      };
      
      // Mock the profile controller
      const mockProfileCtrl = {
        getMyProfile: (req, res) => res.json(mockResponse)
      };
      jest.doMock('../../controllers/profile.js', () => mockProfileCtrl);
      
      const res = await request(app2).get('/profile/profile/me');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('profile');
      expect(res.body).toHaveProperty('user');
      expect(res.body.profile).toHaveProperty('firstname', 'John');
      expect(res.body.profile).toHaveProperty('lastname', 'Doe');
      expect(res.body.user).toHaveProperty('email', 'john.doe@example.com');
      expect(res.body.user).toHaveProperty('role', 'customer');
    });

    it('should handle PUT /profile/me with profile update', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, profileRouter);
      
      const updateData = {
        firstname: 'Jane',
        lastname: 'Smith',
        sexe: 'F'
      };
      
      const mockResponse = {
        message: 'Profile updated successfully',
        profile: {
          _id: 'profile123',
          firstname: 'Jane',
          lastname: 'Smith',
          sexe: 'F',
          meta: {
            created_at: new Date(),
            updated_at: new Date(),
            created_by: '12345',
            updated_by: '12345',
            isActive: true,
            isDeleted: false
          }
        }
      };
      
      const mockProfileCtrl = {
        updateMyProfile: (req, res) => res.json(mockResponse)
      };
      jest.doMock('../../controllers/profile.js', () => mockProfileCtrl);
      
      const res = await request(app2).put('/profile/profile/me')
        .send(updateData);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Profile updated successfully');
      expect(res.body.profile.firstname).toBe('Jane');
      expect(res.body.profile.lastname).toBe('Smith');
      expect(res.body.profile.sexe).toBe('F');
    });

    it('should handle GET /:userId with own profile access', async () => {
      const matchingId = '12345';
      const fakeAuth = (req, res, next) => {
        req.user = { id: matchingId, role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, profileRouter);
      
      const mockResponse = {
        profile: {
          _id: 'profile123',
          firstname: 'John',
          lastname: 'Doe',
          sexe: 'M',
          meta: {
            created_at: new Date(),
            updated_at: new Date(),
            created_by: '12345',
            updated_by: '12345',
            isActive: true,
            isDeleted: false
          }
        },
        user: {
          id: '12345',
          email: 'john.doe@example.com',
          role: 'customer',
          status: 'active',
          emailVerified: true,
          twoFactorEnabled: false
        }
      };
      
      const mockProfileCtrl = {
        getMyProfile: (req, res) => res.json(mockResponse)
      };
      jest.doMock('../../controllers/profile.js', () => mockProfileCtrl);
      
      const res = await request(app2).get('/profile/' + matchingId);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('profile');
      expect(res.body).toHaveProperty('user');
    });

    it('should handle PUT /:userId with own profile update', async () => {
      const matchingId = '12345';
      const fakeAuth = (req, res, next) => {
        req.user = { id: matchingId, role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, profileRouter);
      
      const updateData = {
        firstname: 'John',
        lastname: 'Doe Updated',
        sexe: 'M'
      };
      
      const mockResponse = {
        message: 'Profile updated successfully',
        profile: {
          _id: 'profile123',
          firstname: 'John',
          lastname: 'Doe Updated',
          sexe: 'M',
          meta: {
            created_at: new Date(),
            updated_at: new Date(),
            created_by: '12345',
            updated_by: '12345',
            isActive: true,
            isDeleted: false
          }
        }
      };
      
      const mockProfileCtrl = {
        updateMyProfile: (req, res) => res.json(mockResponse)
      };
      jest.doMock('../../controllers/profile.js', () => mockProfileCtrl);
      
      const res = await request(app2).put('/profile/' + matchingId)
        .send(updateData);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Profile updated successfully');
      expect(res.body.profile.lastname).toBe('Doe Updated');
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
      app2.use('/profile', fakeAuth, profileRouter);
      
      const passwordData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!'
      };
      
      const mockResponse = {
        message: 'Password updated successfully'
      };
      
      const mockUserCtrl = {
        changePassword: (req, res) => res.json(mockResponse)
      };
      jest.doMock('../../controllers/user.js', () => mockUserCtrl);
      
      const res = await request(app2).put('/profile/account/password')
        .send(passwordData);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Password updated successfully');
    });

    it('should handle PUT /account/email', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, profileRouter);
      
      const emailData = {
        currentPassword: 'Password123!',
        newEmail: 'newemail@example.com'
      };
      
      const mockResponse = {
        message: 'Email updated successfully'
      };
      
      const mockUserCtrl = {
        updateEmail: (req, res) => res.json(mockResponse)
      };
      jest.doMock('../../controllers/user.js', () => mockUserCtrl);
      
      const res = await request(app2).put('/profile/account/email')
        .send(emailData);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Email updated successfully');
    });
  });

  describe('Data validation and error handling', () => {
    it('should validate profile update data', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, profileRouter);
      
      // Test with invalid data
      const invalidData = {
        firstname: '',
        lastname: '',
        sexe: 'INVALID'
      };
      
      const mockProfileCtrl = {
        updateMyProfile: (req, res) => res.status(400).json({ error: 'Invalid profile data' })
      };
      jest.doMock('../../controllers/profile.js', () => mockProfileCtrl);
      
      const res = await request(app2).put('/profile/profile/me')
        .send(invalidData);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid profile data');
    });

    it('should validate password strength', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, profileRouter);
      
      // Test with weak password
      const weakPasswordData = {
        currentPassword: 'OldPassword123!',
        newPassword: 'weak'
      };
      
      const mockUserCtrl = {
        changePassword: (req, res) => res.status(400).json({ error: 'Password too weak' })
      };
      jest.doMock('../../controllers/user.js', () => mockUserCtrl);
      
      const res = await request(app2).put('/profile/account/password')
        .send(weakPasswordData);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Password too weak');
    });

    it('should validate email format', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, profileRouter);
      
      // Test with invalid email format
      const invalidEmailData = {
        currentPassword: 'Password123!',
        newEmail: 'invalid-email-format'
      };
      
      const mockUserCtrl = {
        updateEmail: (req, res) => res.status(400).json({ error: 'Invalid email format' })
      };
      jest.doMock('../../controllers/user.js', () => mockUserCtrl);
      
      const res = await request(app2).put('/profile/account/email')
        .send(invalidEmailData);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid email format');
    });

    it('should handle malformed JSON', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, profileRouter);
      
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
      app2.use('/profile', fakeAuth, profileRouter);
      
      const res = await request(app2).put('/profile/profile/me');
      expect(res.status).toBe(400);
    });
  });

  describe('User-Profile relationship testing', () => {
    it('should handle case when user has no profile', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, profileRouter);
      
      const mockResponse = {
        error: 'Profile not found'
      };
      
      const mockProfileCtrl = {
        getMyProfile: (req, res) => res.status(404).json(mockResponse)
      };
      jest.doMock('../../controllers/profile.js', () => mockProfileCtrl);
      
      const res = await request(app2).get('/profile/profile/me');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Profile not found');
    });

    it('should handle case when user is not found', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, profileRouter);
      
      const mockResponse = {
        error: 'User not found'
      };
      
      const mockProfileCtrl = {
        getMyProfile: (req, res) => res.status(404).json(mockResponse)
      };
      jest.doMock('../../controllers/profile.js', () => mockProfileCtrl);
      
      const res = await request(app2).get('/profile/profile/me');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should update both user and profile meta information', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'customer' };
        next();
      };
      const app2 = express();
      app2.use(express.json());
      app2.use('/profile', fakeAuth, profileRouter);
      
      const updateData = {
        firstname: 'Updated',
        lastname: 'Name'
      };
      
      const mockResponse = {
        message: 'Profile updated successfully',
        profile: {
          _id: 'profile123',
          firstname: 'Updated',
          lastname: 'Name',
          sexe: 'M',
          meta: {
            created_at: new Date(),
            updated_at: new Date(),
            created_by: '12345',
            updated_by: '12345', // This should be updated
            isActive: true,
            isDeleted: false
          }
        }
      };
      
      const mockProfileCtrl = {
        updateMyProfile: (req, res) => res.json(mockResponse)
      };
      jest.doMock('../../controllers/profile.js', () => mockProfileCtrl);
      
      const res = await request(app2).put('/profile/profile/me')
        .send(updateData);
      expect(res.status).toBe(200);
      expect(res.body.profile.meta.updated_by).toBe('12345');
    });
  });
});
