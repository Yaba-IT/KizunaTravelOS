/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/controllers/__test__/profile.test.js - Profile controller tests
* Tests profile management and data handling functionality
*
* coded by farid212@Yaba-IT!
*/

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

// Import models and controller
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const profileController = require('../profile');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 'mocked-user-id', role: 'admin' };
  next();
};

// Mock authorize middleware
const mockAuthorize = (roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
};

// Apply routes
app.get('/me', mockAuth, profileController.getMyProfile);
app.put('/me', mockAuth, profileController.updateMyProfile);
app.get('/:id', mockAuth, mockAuthorize(['admin']), profileController.getProfileById);
app.put('/:id', mockAuth, mockAuthorize(['admin']), profileController.updateProfileById);
app.get('/', mockAuth, mockAuthorize(['admin']), profileController.getAllProfiles);
app.post('/:id/restore', mockAuth, mockAuthorize(['admin']), profileController.restoreProfile);
app.get('/stats', mockAuth, mockAuthorize(['admin']), profileController.getProfileStats);

describe('Profile Controller', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Profile.deleteMany({});
  });

  describe('GET /me', () => {
    it('should return current user profile', async () => {
      // Create a test user with profile
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });
      await user.save();

      const profile = new Profile({
        userId: user._id.toString(),
        firstname: 'John',
        lastname: 'Doe',
        sexe: 'M'
      });
      await profile.save();

      // Update user with profile reference
      user.profileId = profile._id;
      await user.save();

      // Mock req.user.id to match the created user
      const mockReq = { user: { id: user._id.toString() } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.getMyProfile(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        profile: expect.objectContaining({
          firstname: 'John',
          lastname: 'Doe',
          sexe: 'M'
        }),
        user: expect.objectContaining({
          email: 'test@example.com',
          role: 'customer'
        })
      });
    });

    it('should return 404 if user not found', async () => {
      const mockReq = { user: { id: 'non-existent-id' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.getMyProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });

    it('should return 404 if profile not found', async () => {
      // Create user without profile
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });
      await user.save();

      const mockReq = { user: { id: user._id.toString() } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.getMyProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Profile not found'
      });
    });
  });

  describe('PUT /me', () => {
    it('should update current user profile', async () => {
      // Create a test user with profile
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });
      await user.save();

      const profile = new Profile({
        userId: user._id.toString(),
        firstname: 'John',
        lastname: 'Doe',
        sexe: 'M'
      });
      await profile.save();

      user.profileId = profile._id;
      await user.save();

      const updateData = {
        firstname: 'Jane',
        lastname: 'Smith',
        sexe: 'F'
      };

      const mockReq = {
        user: { id: user._id.toString() },
        body: updateData
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.updateMyProfile(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        profile: expect.objectContaining({
          firstname: 'Jane',
          lastname: 'Smith',
          sexe: 'F'
        })
      });
    });

    it('should handle partial updates', async () => {
      // Create a test user with profile
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });
      await user.save();

      const profile = new Profile({
        userId: user._id.toString(),
        firstname: 'John',
        lastname: 'Doe',
        sexe: 'M'
      });
      await profile.save();

      user.profileId = profile._id;
      await user.save();

      const updateData = {
        firstname: 'Jane'
      };

      const mockReq = {
        user: { id: user._id.toString() },
        body: updateData
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.updateMyProfile(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        profile: expect.objectContaining({
          firstname: 'Jane',
          lastname: 'Doe', // Should remain unchanged
          sexe: 'M' // Should remain unchanged
        })
      });
    });
  });

  describe('GET /:id', () => {
    it('should return profile by ID with user info', async () => {
      // Create a test user with profile
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });
      await user.save();

      const profile = new Profile({
        userId: user._id.toString(),
        firstname: 'John',
        lastname: 'Doe',
        sexe: 'M'
      });
      await profile.save();

      user.profileId = profile._id;
      await user.save();

      const mockReq = { params: { id: profile._id.toString() } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.getProfileById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        profile: expect.objectContaining({
          firstname: 'John',
          lastname: 'Doe',
          sexe: 'M'
        }),
        user: expect.objectContaining({
          email: 'test@example.com',
          role: 'customer'
        })
      });
    });

    it('should return 404 for non-existent profile', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const mockReq = { params: { id: fakeId.toString() } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.getProfileById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Profile not found'
      });
    });

    it('should return 404 for deleted profile', async () => {
      // Create a test user with profile
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });
      await user.save();

      const profile = new Profile({
        userId: user._id.toString(),
        firstname: 'John',
        lastname: 'Doe',
        sexe: 'M'
      });
      await profile.save();

      // Soft delete the profile
      profile.meta.softDelete(user._id);
      await profile.save();

      const mockReq = { params: { id: profile._id.toString() } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.getProfileById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Profile not found'
      });
    });
  });

  describe('PUT /:id', () => {
    it('should update profile by ID', async () => {
      // Create a test user with profile
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });
      await user.save();

      const profile = new Profile({
        userId: user._id.toString(),
        firstname: 'John',
        lastname: 'Doe',
        sexe: 'M'
      });
      await profile.save();

      const updateData = {
        firstname: 'Jane',
        lastname: 'Smith'
      };

      const mockReq = {
        params: { id: profile._id.toString() },
        body: updateData,
        user: { id: 'admin-id' }
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.updateProfileById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        profile: expect.objectContaining({
          firstname: 'Jane',
          lastname: 'Smith'
        })
      });
    });
  });

  describe('GET /', () => {
    beforeEach(async () => {
      // Create test users with profiles
      const users = [
        {
          email: 'user1@example.com',
          password: 'SecurePass123!',
          role: 'customer'
        },
        {
          email: 'user2@example.com',
          password: 'SecurePass123!',
          role: 'guide'
        }
      ];

      for (const userData of users) {
        const user = new User(userData);
        await user.save();

        const profile = new Profile({
          userId: user._id.toString(),
          firstname: 'Test',
          lastname: 'User',
          sexe: 'X'
        });
        await profile.save();

        user.profileId = profile._id;
        await user.save();
      }
    });

    it('should return all profiles with pagination', async () => {
      const mockReq = { query: {} };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.getAllProfiles(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        profiles: expect.arrayContaining([
          expect.objectContaining({
            profile: expect.any(Object),
            user: expect.any(Object)
          })
        ]),
        pagination: expect.objectContaining({
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        })
      });
    });

    it('should filter profiles by search term', async () => {
      const mockReq = { query: { search: 'Test' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.getAllProfiles(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        profiles: expect.arrayContaining([
          expect.objectContaining({
            profile: expect.objectContaining({
              firstname: 'Test'
            })
          })
        ]),
        pagination: expect.any(Object)
      });
    });
  });

  describe('POST /:id/restore', () => {
    it('should restore deleted profile', async () => {
      // Create a test user with profile
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });
      await user.save();

      const profile = new Profile({
        userId: user._id.toString(),
        firstname: 'John',
        lastname: 'Doe',
        sexe: 'M'
      });
      await profile.save();

      // Soft delete the profile
      profile.meta.softDelete(user._id);
      await profile.save();

      const mockReq = {
        params: { id: profile._id.toString() },
        user: { id: 'admin-id' }
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.restoreProfile(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Profile restored successfully',
        profile: expect.objectContaining({
          meta: expect.objectContaining({
            isDeleted: false
          })
        })
      });
    });

    it('should return 400 if profile is not deleted', async () => {
      // Create a test user with profile
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });
      await user.save();

      const profile = new Profile({
        userId: user._id.toString(),
        firstname: 'John',
        lastname: 'Doe',
        sexe: 'M'
      });
      await profile.save();

      const mockReq = {
        params: { id: profile._id.toString() },
        user: { id: 'admin-id' }
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.restoreProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Profile is not deleted'
      });
    });
  });

  describe('GET /stats', () => {
    beforeEach(async () => {
      // Create test users with profiles
      const users = [
        {
          email: 'user1@example.com',
          password: 'SecurePass123!',
          role: 'customer'
        },
        {
          email: 'user2@example.com',
          password: 'SecurePass123!',
          role: 'guide'
        }
      ];

      for (const userData of users) {
        const user = new User(userData);
        await user.save();

        const profile = new Profile({
          userId: user._id.toString(),
          firstname: 'Test',
          lastname: 'User',
          sexe: 'X'
        });
        await profile.save();

        user.profileId = profile._id;
        await user.save();
      }
    });

    it('should return profile statistics', async () => {
      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.getProfileStats(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        stats: expect.objectContaining({
          total: 2,
          deleted: 0,
          recent: 2,
          bySexe: expect.arrayContaining([
            expect.objectContaining({
              _id: 'X',
              count: 2
            })
          ])
        })
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock Profile.findById to throw error
      const originalFindById = Profile.findById;
      Profile.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      const mockReq = { params: { id: 'fake-id' } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await profileController.getProfileById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });

      // Restore original method
      Profile.findById = originalFindById;
    });
  });
});
