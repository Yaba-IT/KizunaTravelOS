/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/models/__test__/user.model.test.js - User model tests
* Tests user schema validation and authentication methods
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../User');
const Profile = require('../Profile');

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('mocked-salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}));

const bcrypt = require('bcryptjs');

describe('User Model', () => {
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

  describe('Schema Definition', () => {
    it('should have all required fields', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });

      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('SecurePass123!');
      expect(user.role).toBe('customer');
      expect(user.status).toBe('pending');
      expect(user.emailVerified).toBe(false);
      expect(user.twoFactorEnabled).toBe(false);
    });

    it('should set default values correctly', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!'
      });

      expect(user.role).toBe('customer');
      expect(user.status).toBe('pending');
      expect(user.emailVerified).toBe(false);
      expect(user.twoFactorEnabled).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should require email', async () => {
      const user = new User({
        password: 'SecurePass123!',
        role: 'customer'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
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
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should validate email format', async () => {
      const user = new User({
        email: 'invalid-email',
        password: 'SecurePass123!',
        role: 'customer'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
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
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should validate role enum', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'invalid-role'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.role).toBeDefined();
    });

    it('should validate status enum', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer',
        status: 'invalid-status'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.status).toBeDefined();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password on save', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });

      await user.save();

      expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 'mocked-salt');
      expect(user.password).toBe('hashed-password');
    });

    it('should not hash password if not modified', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });

      await user.save();
      jest.clearAllMocks();

      user.email = 'updated@example.com';
      await user.save();

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('Profile Creation', () => {
    it('should create profile automatically for new user', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });

      await user.save();

      expect(user.profileId).toBeDefined();
      
      const profile = await Profile.findById(user.profileId);
      expect(profile).toBeDefined();
      expect(profile.userId).toBe(user._id.toString());
      expect(profile.firstname).toBe('');
      expect(profile.lastname).toBe('');
      expect(profile.sexe).toBe('X');
    });

    it('should not create profile if profileId already exists', async () => {
      const existingProfile = new Profile({
        userId: 'existing-user-id',
        firstname: 'John',
        lastname: 'Doe',
        sexe: 'M'
      });
      await existingProfile.save();

      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer',
        profileId: existingProfile._id
      });

      await user.save();

      expect(user.profileId).toEqual(existingProfile._id);
      
      // Should not create a new profile
      const profiles = await Profile.find({ userId: user._id.toString() });
      expect(profiles).toHaveLength(0);
    });
  });

  describe('Meta Integration', () => {
    it('should create meta object automatically', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });

      await user.save();

      expect(user.meta).toBeDefined();
      expect(user.meta.created_at).toBeInstanceOf(Date);
      expect(user.meta.updated_at).toBeInstanceOf(Date);
      expect(user.meta.isActive).toBe(true);
      expect(user.meta.isDeleted).toBe(false);
    });

    it('should delegate isLocked to meta', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });

      await user.save();

      expect(user.isLocked()).toBe(false);

      user.meta.lockUntil = new Date(Date.now() + 1000);
      expect(user.isLocked()).toBe(true);
    });

    it('should delegate incLoginAttempts to meta', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });

      await user.save();

      expect(user.meta.loginAttempts).toBe(0);
      user.incLoginAttempts();
      expect(user.meta.loginAttempts).toBe(1);
    });

    it('should delegate softDelete to meta', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });

      await user.save();
      const adminUserId = new mongoose.Types.ObjectId();

      user.softDelete(adminUserId);

      expect(user.meta.isDeleted).toBe(true);
      expect(user.meta.deleted_by).toEqual(adminUserId);
      expect(user.status).toBe('inactive');
    });

    it('should delegate restore to meta', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });

      await user.save();
      const adminUserId = new mongoose.Types.ObjectId();

      user.softDelete(adminUserId);
      user.restore();

      expect(user.meta.isDeleted).toBe(false);
      expect(user.meta.deleted_by).toBeNull();
      expect(user.status).toBe('pending');
    });
  });

  describe('Instance Methods', () => {
    it('should compare password correctly', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });

      await user.save();

      const result = await user.comparePassword('SecurePass123!');
      expect(bcrypt.compare).toHaveBeenCalledWith('SecurePass123!', 'hashed-password');
      expect(result).toBe(true);
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
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
        },
        {
          email: 'user3@example.com',
          password: 'SecurePass123!',
          role: 'customer',
          status: 'inactive'
        }
      ];

      for (const userData of users) {
        const user = new User(userData);
        await user.save();
      }
    });

    it('should find by email', async () => {
      const user = await User.findByEmail('user1@example.com');
      expect(user).toBeDefined();
      expect(user.email).toBe('user1@example.com');
    });

    it('should find active users', async () => {
      const activeUsers = await User.findActive();
      expect(activeUsers).toHaveLength(2);
      expect(activeUsers.every(u => u.status === 'active')).toBe(true);
    });

    it('should find non-deleted users', async () => {
      const nonDeletedUsers = await User.findNonDeleted();
      expect(nonDeletedUsers).toHaveLength(3);
      expect(nonDeletedUsers.every(u => !u.meta.isDeleted)).toBe(true);
    });
  });

  describe('Virtuals', () => {
    it('should have fullName virtual', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });

      await user.save();

      // Create profile with names
      const profile = await Profile.findById(user.profileId);
      profile.firstname = 'John';
      profile.lastname = 'Doe';
      await profile.save();

      // Populate profile to test virtual
      await user.populate('profileId');
      expect(user.fullName).toBe('John Doe');
    });
  });

  describe('Indexes', () => {
    it('should have proper indexes', async () => {
      const indexes = await User.collection.indexes();
      const indexNames = indexes.map(idx => Object.keys(idx.key)[0]);

      expect(indexNames).toContain('email_1');
      expect(indexNames).toContain('role_1');
      expect(indexNames).toContain('status_1');
      expect(indexNames).toContain('profileId_1');
      expect(indexNames).toContain('meta.isActive_1');
      expect(indexNames).toContain('meta.isDeleted_1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing meta gracefully', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });

      // Manually remove meta to test edge case
      user.meta = undefined;

      expect(user.isLocked()).toBe(false);
      expect(() => user.incLoginAttempts()).not.toThrow();
      expect(() => user.softDelete(new mongoose.Types.ObjectId())).not.toThrow();
    });

    it('should handle profile creation errors gracefully', async () => {
      // Mock Profile.save to throw error
      const originalSave = Profile.prototype.save;
      Profile.prototype.save = jest.fn().mockRejectedValue(new Error('Profile save failed'));

      const user = new User({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.message).toBe('Profile save failed');

      // Restore original save method
      Profile.prototype.save = originalSave;
    });
  });
});
