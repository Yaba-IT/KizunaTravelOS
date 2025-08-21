/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/models/__test__/user.model.test.js - User model tests
* Tests user schema validation, methods, and functionality
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../User.js');
const Profile = require('../Profile.js');
const Meta = require('../Meta.js');

describe('User Model', () => {
  let mongoServer;

  beforeAll(async () => {
    // Use in-memory database for testing
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

  describe('Schema Definition', () => {
    it('should have all required fields', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer'
      });
      
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('Password123!');
      expect(user.role).toBe('customer');
    });

    it('should set default values correctly', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer'
      });
      
      expect(user.status).toBe('pending');
      expect(user.emailVerified).toBe(false);
      expect(user.twoFactorEnabled).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should require email', async () => {
      const user = new User({
        password: 'Password123!',
        role: 'customer'
      });
      
      let error;
      try {
        await user.validate();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should require password', async () => {
      const user = new User({
        email: 'test@example.com',
        role: 'customer'
      });
      
      let error;
      try {
        await user.validate();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should validate email format', async () => {
      const user = new User({
        email: 'invalid-email',
        password: 'Password123!',
        role: 'customer'
      });
      
      let error;
      try {
        await user.validate();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should validate password strength', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'weak',
        role: 'customer'
      });
      
      let error;
      try {
        await user.validate();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should validate role enum', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'invalid-role'
      });
      
      let error;
      try {
        await user.validate();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.role).toBeDefined();
    });

    it('should validate status enum', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        status: 'invalid-status'
      });
      
      let error;
      try {
        await user.validate();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.status).toBeDefined();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password on save', async () => {
      // Create a profile first
      const profile = await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        profileId: profile._id
      });

      await user.save();
      
      expect(user.password).not.toBe('Password123!');
      expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
    });

    it('should not hash password if not modified', async () => {
      // Create a profile first
      const profile = await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        profileId: profile._id
      });

      await user.save();
      const originalHash = user.password;
      
      // Update non-password field
      user.email = 'newemail@example.com';
      await user.save();
      
      expect(user.password).toBe(originalHash);
    });
  });

  describe('Profile Creation', () => {
    it('should require profileId when creating user', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer'
        // No profileId - should fail validation
      });

      let error;
      try {
        await user.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.profileId).toBeDefined();
    });

    it('should work with valid profileId', async () => {
      // Create a profile first
      const profile = await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        profileId: profile._id
      });

      await user.save();
      expect(user.profileId).toEqual(profile._id);
    });
  });

  describe('Meta Integration', () => {
    it('should create meta object automatically', async () => {
      // Create a profile first
      const profile = await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        profileId: profile._id
      });

      await user.save();
      
      expect(user.meta).toBeDefined();
      expect(user.meta.isActive).toBe(true);
      expect(user.meta.isDeleted).toBe(false);
    });

    it('should delegate isLocked to meta', async () => {
      // Create a profile first
      const profile = await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        profileId: profile._id
      });

      await user.save();
      
      expect(user.isLocked()).toBe(false);
      
      // Lock the account
      user.meta.lockUntil = new Date(Date.now() + 3600000); // 1 hour from now
      expect(user.isLocked()).toBe(true);
    });

    it('should delegate incLoginAttempts to meta', async () => {
      // Create a profile first
      const profile = await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        profileId: profile._id
      });

      await user.save();
      
      expect(user.meta.loginAttempts).toBe(0);
      
      user.incLoginAttempts();
      expect(user.meta.loginAttempts).toBe(1);
    });

    it('should delegate softDelete to meta', async () => {
      // Create a profile first
      const profile = await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        profileId: profile._id
      });

      await user.save();
      
      expect(user.meta.isDeleted).toBe(false);
      
      user.softDelete();
      expect(user.meta.isDeleted).toBe(true);
    });

    it('should delegate restore to meta', async () => {
      // Create a profile first
      const profile = await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        profileId: profile._id
      });

      await user.save();
      
      user.softDelete();
      expect(user.meta.isDeleted).toBe(true);
      
      user.restore();
      expect(user.meta.isDeleted).toBe(false);
    });
  });

  describe('Instance Methods', () => {
    it('should compare password correctly', async () => {
      // Create a profile first
      const profile = await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        profileId: profile._id
      });

      await user.save();
      
      const isMatch = await user.comparePassword('Password123!');
      expect(isMatch).toBe(true);
      
      const isNotMatch = await user.comparePassword('WrongPassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Static Methods', () => {
    it('should find by email', async () => {
      // Create a profile first
      const profile = await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        profileId: profile._id
      });

      await user.save();
      
      const foundUser = await User.findByEmail('test@example.com');
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe('test@example.com');
    });

    it('should find active users', async () => {
      // Create users with profiles using the test utility
      const { createUserWithProfile } = require('../../test-utils/factories');
      
      await createUserWithProfile({
        email: 'test1@example.com',
        password: 'Password123!',
        role: 'customer',
        status: 'active'
      });

      await createUserWithProfile({
        email: 'test2@example.com',
        password: 'Password123!',
        role: 'customer',
        status: 'inactive'
      });
      
      const activeUsers = await User.findActive();
      // Find the user we created in this test
      const testUser = activeUsers.find(u => u.email === 'test1@example.com');
      expect(testUser).toBeDefined();
      expect(testUser.email).toBe('test1@example.com');
    });

    it('should find non-deleted users', async () => {
      // Create users with profiles using the test utility
      const { createUserWithProfile } = require('../../test-utils/factories');
      
      await createUserWithProfile({
        email: 'test1@example.com',
        password: 'Password123!',
        role: 'customer'
      });

      const { user: user2 } = await createUserWithProfile({
        email: 'test2@example.com',
        password: 'Password123!',
        role: 'customer'
      });

      // Soft delete one user
      user2.meta.isDeleted = true;
      user2.meta.deleted_at = new Date();
      await user2.save();
      
      const nonDeletedUsers = await User.findNonDeleted();
      // Find the user we created in this test
      const testUser = nonDeletedUsers.find(u => u.email === 'test1@example.com');
      expect(testUser).toBeDefined();
      expect(testUser.email).toBe('test1@example.com');
    });
  });

  describe('Virtuals', () => {
    it('should have fullName virtual', async () => {
      // Create a profile first
      const profile = await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        profileId: profile._id
      });

      await user.save();
      
      // The virtual would need population to work properly
      expect(user.fullName).toBeDefined();
    });
  });

  describe('Indexes', () => {
    it('should have proper indexes', async () => {
      const indexes = await User.collection.indexes();
      const indexNames = indexes.map(idx => Object.keys(idx.key)[0]);
      
      expect(indexNames).toContain('email');
      expect(indexNames).toContain('role');
      expect(indexNames).toContain('status');
      expect(indexNames).toContain('profileId');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing meta gracefully', async () => {
      // Create a profile first
      const profile = await Profile.create({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer',
        profileId: profile._id
      });

      // Should not throw error
      expect(() => user.isLocked()).not.toThrow();
    });

    it('should handle validation errors gracefully', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'customer'
        // Missing profileId - should fail validation
      });

      let error;
      try {
        await user.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.profileId).toBeDefined();
    });
  });
});
