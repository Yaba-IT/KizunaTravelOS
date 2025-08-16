/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/controllers/__test__/user.test.js - User controller tests
* Tests user authentication, registration, and management functionality
*
* coded by farid212@Yaba-IT!
*/

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('mocked-salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 'mocked-user-id', role: 'admin' })
}));

const bcrypt = require('bcryptjs');

// Import models and controller
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const userController = require('../user');

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
app.post('/register', userController.register);
app.post('/login', userController.login);
app.get('/me', mockAuth, userController.getMe);
app.put('/me', mockAuth, userController.updateMe);
app.post('/forgot-password', userController.forgotPassword);
app.post('/reset-password', userController.resetPassword);
app.post('/verify-email', userController.verifyEmail);
app.get('/users', mockAuth, mockAuthorize(['admin']), userController.getAllUsers);
app.get('/users/:id', mockAuth, mockAuthorize(['admin']), userController.getUserById);
app.put('/users/:id', mockAuth, mockAuthorize(['admin']), userController.updateUserById);
app.delete('/users/:id', mockAuth, mockAuthorize(['admin']), userController.deleteUserById);
app.post('/users/:id/activate', mockAuth, mockAuthorize(['admin']), userController.activateUser);
app.post('/users/:id/deactivate', mockAuth, mockAuthorize(['admin']), userController.deactivateUser);
app.post('/users/:id/unlock', mockAuth, mockAuthorize(['admin']), userController.unlockUser);
app.post('/logout', mockAuth, userController.logout);
app.get('/stats', mockAuth, mockAuthorize(['admin']), userController.getUserStats);

describe('User Controller', () => {
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
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer',
        firstname: 'John',
        lastname: 'Doe',
        sexe: 'M'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe(userData.role);
      expect(response.body.token).toBe('mocked-jwt-token');
      expect(response.body.user.profile).toBeDefined();
    });

    it('should return 400 for missing email', async () => {
      const userData = {
        password: 'SecurePass123!',
        role: 'customer'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
    });

    it('should return 400 for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        role: 'customer'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('Password must contain at least 8 characters');
    });

    it('should return 409 for existing email', async () => {
      // Create existing user
      const existingUser = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });
      await existingUser.save();

      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(409);

      expect(response.body.error).toBe('User with this email already exists');
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer',
        status: 'active'
      });
      await user.save();

      const profile = new Profile({
        userId: user._id.toString(),
        firstname: 'John',
        lastname: 'Doe',
        sexe: 'M'
      });
      await profile.save();
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.token).toBe('mocked-jwt-token');
    });

    it('should return 400 for missing credentials', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 403 for inactive account', async () => {
      // Update user status to inactive
      await User.findOneAndUpdate(
        { email: 'test@example.com' },
        { status: 'inactive' }
      );

      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(403);

      expect(response.body.error).toBe('Account is not active');
    });
  });

  describe('GET /me', () => {
    it('should return current user profile', async () => {
      // Create a test user
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

      // Mock req.user.id to match the created user
      const mockReq = { user: { id: user._id.toString() } };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await userController.getMe(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          email: 'test@example.com',
          role: 'customer'
        })
      });
    });
  });

  describe('PUT /me', () => {
    it('should update current user profile', async () => {
      // Create a test user
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
        user: { id: user._id.toString() },
        body: updateData
      };
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      await userController.updateMe(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        user: expect.objectContaining({
          email: 'test@example.com'
        })
      });
    });
  });

  describe('POST /forgot-password', () => {
    it('should handle forgot password request', async () => {
      // Create a test user
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });
      await user.save();

      const forgotData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/forgot-password')
        .send(forgotData)
        .expect(200);

      expect(response.body.message).toBe('If an account with that email exists, a password reset link has been sent');
    });
  });

  describe('POST /reset-password', () => {
    it('should reset password with valid token', async () => {
      // Create a test user with reset token
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer',
        passwordResetToken: 'valid-token',
        passwordResetExpires: new Date(Date.now() + 3600000)
      });
      await user.save();

      const resetData = {
        token: 'valid-token',
        password: 'NewSecurePass123!'
      };

      const response = await request(app)
        .post('/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body.message).toBe('Password reset successfully');
    });

    it('should return 400 for invalid token', async () => {
      const resetData = {
        token: 'invalid-token',
        password: 'NewSecurePass123!'
      };

      const response = await request(app)
        .post('/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body.error).toBe('Invalid or expired reset token');
    });
  });

  describe('POST /verify-email', () => {
    it('should verify email with valid token', async () => {
      // Create a test user with verification token
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer',
        emailVerificationToken: 'valid-token'
      });
      await user.save();

      const verifyData = {
        token: 'valid-token'
      };

      const response = await request(app)
        .post('/verify-email')
        .send(verifyData)
        .expect(200);

      expect(response.body.message).toBe('Email verified successfully');
    });
  });

  describe('GET /users', () => {
    beforeEach(async () => {
      // Create test users
      const users = [
        {
          email: 'user1@example.com',
          password: 'SecurePass123!',
          role: 'customer',
          status: 'active'
        },
        {
          email: 'user2@example.com',
          password: 'SecurePass123!',
          role: 'guide',
          status: 'active'
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
      }
    });

    it('should return all users with pagination', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body.users).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/users?role=customer')
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].role).toBe('customer');
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by ID', async () => {
      // Create a test user
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

      const response = await request(app)
        .get(`/users/${user._id}`)
        .expect(200);

      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('customer');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/users/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user by ID', async () => {
      // Create a test user
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
        role: 'guide',
        firstname: 'Jane'
      };

      const response = await request(app)
        .put(`/users/${user._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.user.role).toBe('guide');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should soft delete user by ID', async () => {
      // Create a test user
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

      const response = await request(app)
        .delete(`/users/${user._id}`)
        .expect(200);

      expect(response.body.message).toBe('User deleted successfully');

      // Check if user is soft deleted
      const deletedUser = await User.findById(user._id);
      expect(deletedUser.meta.isDeleted).toBe(true);
    });
  });

  describe('POST /users/:id/activate', () => {
    it('should activate user account', async () => {
      // Create an inactive user
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer',
        status: 'inactive'
      });
      await user.save();

      const response = await request(app)
        .post(`/users/${user._id}/activate`)
        .expect(200);

      expect(response.body.message).toBe('User activated successfully');
      expect(response.body.user.status).toBe('active');
    });
  });

  describe('POST /users/:id/deactivate', () => {
    it('should deactivate user account', async () => {
      // Create an active user
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer',
        status: 'active'
      });
      await user.save();

      const response = await request(app)
        .post(`/users/${user._id}/deactivate`)
        .expect(200);

      expect(response.body.message).toBe('User deactivated successfully');
      expect(response.body.user.status).toBe('inactive');
    });
  });

  describe('POST /users/:id/unlock', () => {
    it('should unlock user account', async () => {
      // Create a locked user
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer',
        meta: {
          loginAttempts: 5,
          lockUntil: new Date(Date.now() + 3600000)
        }
      });
      await user.save();

      const response = await request(app)
        .post(`/users/${user._id}/unlock`)
        .expect(200);

      expect(response.body.message).toBe('User account unlocked successfully');

      // Check if user is unlocked
      const unlockedUser = await User.findById(user._id);
      expect(unlockedUser.meta.loginAttempts).toBe(0);
      expect(unlockedUser.meta.lockUntil).toBeNull();
    });
  });

  describe('POST /logout', () => {
    it('should logout user successfully', async () => {
      const response = await request(app)
        .post('/logout')
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /stats', () => {
    beforeEach(async () => {
      // Create test users with different statuses
      const users = [
        { email: 'user1@example.com', password: 'SecurePass123!', role: 'customer', status: 'active' },
        { email: 'user2@example.com', password: 'SecurePass123!', role: 'guide', status: 'active' },
        { email: 'user3@example.com', password: 'SecurePass123!', role: 'customer', status: 'pending' }
      ];

      for (const userData of users) {
        const user = new User(userData);
        await user.save();
      }
    });

    it('should return user statistics', async () => {
      const response = await request(app)
        .get('/stats')
        .expect(200);

      expect(response.body.stats.total).toBe(3);
      expect(response.body.stats.active).toBe(2);
      expect(response.body.stats.pending).toBe(1);
      expect(response.body.stats.byRole).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock User.findByEmail to throw error
      const originalFindByEmail = User.findByEmail;
      User.findByEmail = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'password' })
        .expect(500);

      expect(response.body.error).toBe('Internal server error during login');

      // Restore original method
      User.findByEmail = originalFindByEmail;
    });
  });
});
