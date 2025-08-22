/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/controllers/__test__/user.test.js - User controller tests
* Tests user authentication, registration, and management functionality
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const userController = require('../user');
const { 
  createUserWithProfile, 
  createTestUserData,
  createMockRequest, 
  createMockResponse, 
  createMockNext 
} = require('../../test-utils/factories');

let mongoServer;

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('mocked-salt'),
  hash: jest.fn().mockResolvedValue('SecurePass123!'),
  compare: jest.fn().mockImplementation((password, hash) => {
    return Promise.resolve(password === 'SecurePass123!' && hash === 'SecurePass123!');
  })
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 'test-user-id', role: 'customer' })
}));

/**
 * @group User Management
 * @description Tests user controller functionality
 */
describe('User Controller', () => {
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
    // Clear all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
    }
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  /**
   * @test Registers new user
   * @scenario Valid registration data
   * @expected User and profile created successfully
   */
  describe('register', () => {
    it('should register new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      };
      const req = createMockRequest({ body: userData });
      const res = createMockResponse();

      // Act
      await userController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: expect.objectContaining({
          email: userData.email,
          role: userData.role
        }),
        token: 'mocked-jwt-token'
      });
    });

    it('should return 409 for existing email', async () => {
      // Arrange
      const { user } = await createUserWithProfile({
        email: 'existing@example.com'
      });
      
      const userData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        firstname: 'John',
        lastname: 'Doe'
      };
      const req = createMockRequest({ body: userData });
      const res = createMockResponse();

      // Act
      await userController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User with this email already exists'
      });
    });

    it('should return 400 for invalid data', async () => {
      // Arrange
      const invalidData = {
        email: 'invalid-email',
        password: 'weak'
      };
      const req = createMockRequest({ body: invalidData });
      const res = createMockResponse();

      // Act
      await userController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Password must contain')
      });
    });
  });

  /**
   * @test Authenticates user login
   * @scenario Valid login credentials
   * @expected User authenticated successfully
   */
  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const { user } = await createUserWithProfile({
        email: 'test@example.com',
        password: 'SecurePass123!'
      });

      const loginData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };
      const req = createMockRequest({ body: loginData });
      const res = createMockResponse();

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: expect.objectContaining({
          email: user.email,
          role: user.role
        }),
        token: 'mocked-jwt-token'
      });
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      await createUserWithProfile({
        email: 'test@example.com',
        password: 'SecurePass123!'
      });

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      const req = createMockRequest({ body: loginData });
      const res = createMockResponse();

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid credentials'
      });
    });

    it('should return 401 for non-existent user', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123!'
      };
      const req = createMockRequest({ body: loginData });
      const res = createMockResponse();

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid credentials'
      });
    });

    it('should return 423 for locked account', async () => {
      // Arrange
      const { user } = await createUserWithProfile({
        email: 'locked@example.com',
        password: 'SecurePass123!',
        meta: {
          loginAttempts: 5,
          lockUntil: new Date(Date.now() + 3600000)
        }
      });

      const loginData = {
        email: 'locked@example.com',
        password: 'SecurePass123!'
      };
      const req = createMockRequest({ body: loginData });
      const res = createMockResponse();

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(423);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Account is temporarily locked due to multiple failed login attempts'
      });
    });
  });

  /**
   * @test Gets current user profile
   * @scenario Authenticated user
   * @expected Returns user profile information
   */
  describe('getMe', () => {
    it('should return current user profile', async () => {
      // Arrange
      const { user, profile } = await createUserWithProfile();
      const req = createMockRequest({ 
        user: { id: user._id.toString(), _id: user._id }
      });
      const res = createMockResponse();

      // Act
      await userController.getMe(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          email: user.email,
          role: user.role
        })
      });
    });

    it('should return 404 if user not found', async () => {
      // Arrange
      const req = createMockRequest({ 
        user: { id: new mongoose.Types.ObjectId().toString() }
      });
      const res = createMockResponse();

      // Act
      await userController.getMe(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });
  });

  /**
   * @test Updates current user profile
   * @scenario Valid update data
   * @expected User profile updated successfully
   */
  describe('updateMe', () => {
    it('should update current user profile', async () => {
      // Arrange
      const { user, profile } = await createUserWithProfile();
      const updateData = {
        firstname: 'Jane',
        lastname: 'Smith'
      };
      const req = createMockRequest({
        user: { id: user._id.toString(), _id: user._id },
        body: updateData
      });
      const res = createMockResponse();

      // Act
      await userController.updateMe(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        user: expect.objectContaining({
          email: user.email
        })
      });
    });
  });

  /**
   * @test Handles forgot password request
   * @scenario Valid email address
   * @expected Password reset email sent
   */
  describe('forgotPassword', () => {
    it('should handle forgot password request', async () => {
      // Arrange
      await createUserWithProfile({
        email: 'test@example.com'
      });

      const forgotData = {
        email: 'test@example.com'
      };
      const req = createMockRequest({ body: forgotData });
      const res = createMockResponse();

      // Act
      await userController.forgotPassword(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset link sent to your email',
        resetToken: undefined
      });
    });

    it('should handle non-existent email gracefully', async () => {
      // Arrange
      const forgotData = {
        email: 'nonexistent@example.com'
      };
      const req = createMockRequest({ body: forgotData });
      const res = createMockResponse();

      // Act
      await userController.forgotPassword(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    });
  });

  /**
   * @test Resets password with valid token
   * @scenario Valid reset token and new password
   * @expected Password reset successfully
   */
  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      // Arrange
      const { user } = await createUserWithProfile({
        email: 'test@example.com',
        passwordResetToken: 'valid-token',
        passwordResetExpires: new Date(Date.now() + 3600000)
      });

      const resetData = {
        token: 'valid-token',
        password: 'NewSecurePass123!'
      };
      const req = createMockRequest({ body: resetData });
      const res = createMockResponse();

      // Act
      await userController.resetPassword(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset successfully'
      });
    });

    it('should return 400 for invalid token', async () => {
      // Arrange
      const resetData = {
        token: 'invalid-token',
        password: 'NewSecurePass123!'
      };
      const req = createMockRequest({ body: resetData });
      const res = createMockResponse();

      // Act
      await userController.resetPassword(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired reset token'
      });
    });
  });

  /**
   * @test Verifies email with valid token
   * @scenario Valid verification token
   * @expected Email verified successfully
   */
  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      // Arrange
      await createUserWithProfile({
        email: 'test@example.com',
        emailVerificationToken: 'valid-token'
      });

      const verifyData = {
        token: 'valid-token'
      };
      const req = createMockRequest({ body: verifyData });
      const res = createMockResponse();

      // Act
      await userController.verifyEmail(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email verified successfully'
      });
    });

    it('should return 400 for invalid token', async () => {
      // Arrange
      const verifyData = {
        token: 'invalid-token'
      };
      const req = createMockRequest({ body: verifyData });
      const res = createMockResponse();

      // Act
      await userController.verifyEmail(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid verification token'
      });
    });
  });

  /**
   * @test Gets all users with pagination (admin only)
   * @scenario Multiple users exist
   * @expected Returns paginated user list
   */
  describe('getAllUsers', () => {
    it('should return all users with pagination', async () => {
      // Arrange
      await createUserWithProfile({ email: 'user1@example.com' });
      await createUserWithProfile({ email: 'user2@example.com' });
      await createUserWithProfile({ email: 'user3@example.com' });

      const req = createMockRequest({ 
        query: { page: '1', limit: '10' }
      });
      const res = createMockResponse();

      // Act
      await userController.getAllUsers(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        users: expect.arrayContaining([
          expect.objectContaining({
            email: expect.any(String),
            role: expect.any(String)
          })
        ]),
        pagination: expect.objectContaining({
          page: 1,
          limit: 10,
          total: expect.any(Number)
        })
      });
    });

    it('should filter users by search term', async () => {
      // Arrange
      await createUserWithProfile({ email: 'john@example.com' });
      await createUserWithProfile({ email: 'jane@example.com' });

      const req = createMockRequest({ 
        query: { search: 'john' }
      });
      const res = createMockResponse();

      // Act
      await userController.getAllUsers(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        users: expect.arrayContaining([
          expect.objectContaining({
            email: 'john@example.com'
          })
        ]),
        pagination: expect.any(Object)
      });
    });
  });

  /**
   * @test Gets user by ID (admin only)
   * @scenario Valid user ID
   * @expected Returns user information
   */
  describe('getUserById', () => {
    it('should return user by ID', async () => {
      // Arrange
      const { user, profile } = await createUserWithProfile();
      const req = createMockRequest({ 
        params: { id: user._id.toString() }
      });
      const res = createMockResponse();

      // Act
      await userController.getUserById(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          email: user.email,
          role: user.role
        })
      });
    });

    it('should return 404 for non-existent user', async () => {
      // Arrange
      const fakeId = new mongoose.Types.ObjectId();
      const req = createMockRequest({ 
        params: { id: fakeId.toString() }
      });
      const res = createMockResponse();

      // Act
      await userController.getUserById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });
  });

  /**
   * @test Updates user by ID (admin only)
   * @scenario Valid user ID and update data
   * @expected User updated successfully
   */
  describe('updateUserById', () => {
    it('should update user by ID', async () => {
      // Arrange
      const { user } = await createUserWithProfile();
      const updateData = {
        role: 'guide',
        status: 'active'
      };
      const req = createMockRequest({
        params: { id: user._id.toString() },
        body: updateData
      });
      const res = createMockResponse();

      // Act
      await userController.updateUserById(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'User updated successfully',
        user: expect.objectContaining({
          role: 'guide',
          status: 'active'
        })
      });
    });
  });

  /**
   * @test Soft deletes user by ID (admin only)
   * @scenario Valid user ID
   * @expected User soft deleted successfully
   */
  describe('deleteUserById', () => {
    it('should soft delete user by ID', async () => {
      // Arrange
      const { user } = await createUserWithProfile();
      const req = createMockRequest({ 
        params: { id: user._id.toString() }
      });
      const res = createMockResponse();

      // Act
      await userController.deleteUserById(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'User deleted successfully'
      });
    });
  });

  /**
   * @test Activates user account (admin only)
   * @scenario Inactive user account
   * @expected User account activated
   */
  describe('activateUser', () => {
    it('should activate user account', async () => {
      // Arrange
      const { user } = await createUserWithProfile({
        status: 'inactive'
      });
      const req = createMockRequest({ 
        params: { id: user._id.toString() }
      });
      const res = createMockResponse();

      // Act
      await userController.activateUser(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'User activated successfully',
        user: expect.objectContaining({
          status: 'active'
        })
      });
    });
  });

  /**
   * @test Deactivates user account (admin only)
   * @scenario Active user account
   * @expected User account deactivated
   */
  describe('deactivateUser', () => {
    it('should deactivate user account', async () => {
      // Arrange
      const { user } = await createUserWithProfile({
        status: 'active'
      });
      const req = createMockRequest({ 
        params: { id: user._id.toString() }
      });
      const res = createMockResponse();

      // Act
      await userController.deactivateUser(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'User deactivated successfully',
        user: expect.objectContaining({
          status: 'inactive'
        })
      });
    });
  });

  /**
   * @test Unlocks user account (admin only)
   * @scenario Locked user account
   * @expected User account unlocked
   */
  describe('unlockUser', () => {
    it('should unlock user account', async () => {
      // Arrange
      const { user } = await createUserWithProfile({
        meta: {
          loginAttempts: 5,
          lockUntil: new Date(Date.now() + 3600000)
        }
      });
      const req = createMockRequest({ 
        params: { id: user._id.toString() }
      });
      const res = createMockResponse();

      // Act
      await userController.unlockUser(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'User account unlocked successfully',
        user: expect.objectContaining({
          status: 'active'
        })
      });
    });
  });

  /**
   * @test Gets user statistics (admin only)
   * @scenario Multiple users with different statuses
   * @expected Returns user statistics
   */
  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      // Arrange
      await createUserWithProfile({ 
        email: 'user1@example.com', 
        status: 'active' 
      });
      await createUserWithProfile({ 
        email: 'user2@example.com', 
        status: 'active' 
      });
      await createUserWithProfile({ 
        email: 'user3@example.com', 
        status: 'pending' 
      });

      const req = createMockRequest();
      const res = createMockResponse();

      // Act
      await userController.getUserStats(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        stats: expect.objectContaining({
          total: expect.any(Number),
          active: expect.any(Number),
          pending: expect.any(Number),
          suspended: expect.any(Number),
          byRole: expect.any(Object)
        })
      });
    });
  });

  /**
   * @test Error handling scenarios
   * @scenario Database errors and invalid data
   * @expected Proper error responses
   */
  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      const User = require('../../models/User');
      jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const req = createMockRequest();
      const res = createMockResponse();

      // Act
      await userController.getMe(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });

    it('should handle validation errors', async () => {
      // Arrange
      const invalidData = {
        email: 'invalid-email',
        password: 'weak'
      };
      const req = createMockRequest({ body: invalidData });
      const res = createMockResponse();

      // Act
      await userController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Password must contain')
      });
    });
  });
});
