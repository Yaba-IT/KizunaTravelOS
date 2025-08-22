/* Yaba-IT/KizunaTravelOS
 *
 * apps/erp-api/src/models/__test__/profile.model.test.js - Profile model tests
 * Tests for the Profile model schema, validation, and methods
 *
 * coded by farid212@Yaba-IT!
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Profile = require('../Profile.js');

describe('Profile Model', () => {
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
    it('should create and find a profile', async () => {
      const userId = new mongoose.Types.ObjectId();
      const profile = new Profile({
        userId: userId,
        firstname: 'Toto',
        lastname: 'Dupond',
        role: 'customer'
      });

      await profile.save();

      const found = await Profile.findOne({ userId: userId });
      expect(found).toBeDefined();
      expect(found.firstname).toBe('Toto');
      expect(found.lastname).toBe('Dupond');
      expect(found.role).toBe('customer');
    });

    it('should set default values', () => {
      const profile = new Profile({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        role: 'customer'
      });

      expect(profile.lastname).toBe('');
      expect(profile.sexe).toBe('X');
      expect(profile.phone).toBe('');
      expect(profile.address.street).toBe('');
      expect(profile.address.city).toBe('');
      expect(profile.availability.isAvailable).toBe(true);
      expect(profile.meta).toBeDefined();
    });

    it('should require userId and firstname', async () => {
      const profile = new Profile({
        lastname: 'Doe',
        role: 'customer'
      });

      let error;
      try {
        await profile.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
      expect(error.errors.firstname).toBeDefined();
    });

    it('should allow multiple profiles with same userId (no unique constraint)', async () => {
      const userId = new mongoose.Types.ObjectId();
      
      const profile1 = new Profile({
        userId: userId,
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      const profile2 = new Profile({
        userId: userId,
        firstname: 'Jane',
        lastname: 'Doe',
        role: 'guide'
      });

      try {
        await profile1.save();
        await profile2.save();
      } catch (error) {
        console.error('Save error:', error);
        throw error;
      }

      // Use findById to verify both profiles exist
      const foundProfile1 = await Profile.findById(profile1._id);
      const foundProfile2 = await Profile.findById(profile2._id);
      
      expect(foundProfile1).toBeDefined();
      expect(foundProfile2).toBeDefined();
      expect(foundProfile1.userId).toEqual(userId);
      expect(foundProfile2.userId).toEqual(userId);
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const profile = new Profile({});

      let error;
      try {
        await profile.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
      expect(error.errors.firstname).toBeDefined();
      expect(error.errors.role).toBeDefined();
    });

    it('should validate role enum', async () => {
      const profile = new Profile({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'invalid_role'
      });

      let error;
      try {
        await profile.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.role).toBeDefined();
    });

    it('should validate sexe enum', async () => {
      const profile = new Profile({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer',
        sexe: 'invalid_sexe'
      });

      let error;
      try {
        await profile.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.sexe).toBeDefined();
    });
  });

  describe('Virtuals', () => {
    it('should generate full name', () => {
      const profile = new Profile({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer'
      });

      expect(profile.fullName).toBe('John Doe');
    });

    it('should handle missing lastname', () => {
      const profile = new Profile({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        role: 'customer'
      });

      expect(profile.fullName).toBe('John');
    });
  });

  describe('Pre-save Middleware', () => {
    it('should ensure meta exists', async () => {
      const profile = new Profile({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        role: 'customer'
      });

      await profile.save();
      expect(profile.meta).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional fields', async () => {
      const profile = new Profile({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        role: 'customer'
      });

      await profile.save();
      expect(profile.lastname).toBe('');
      expect(profile.phone).toBe('');
      expect(profile.address.street).toBe('');
      expect(profile.address.city).toBe('');
    });

    it('should handle complex address information', async () => {
      const profile = new Profile({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'customer',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA'
        }
      });

      await profile.save();
      expect(profile.address.street).toBe('123 Main St');
      expect(profile.address.city).toBe('New York');
      expect(profile.address.country).toBe('USA');
    });

    it('should handle availability settings', async () => {
      const profile = new Profile({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'John',
        lastname: 'Doe',
        role: 'guide',
        availability: {
          isAvailable: false,
          availableDays: ['monday', 'tuesday', 'wednesday'],
          availableHours: {
            start: '08:00',
            end: '18:00'
          }
        }
      });

      await profile.save();
      expect(profile.availability.isAvailable).toBe(false);
      expect(profile.availability.availableDays).toHaveLength(3);
      expect(profile.availability.availableHours.start).toBe('08:00');
      expect(profile.availability.availableHours.end).toBe('18:00');
    });

    it('should handle special characters in names', async () => {
      const profile = new Profile({
        userId: new mongoose.Types.ObjectId(),
        firstname: 'José',
        lastname: 'García-López',
        role: 'customer'
      });

      await profile.save();
      expect(profile.firstname).toBe('José');
      expect(profile.lastname).toBe('García-López');
      expect(profile.fullName).toBe('José García-López');
    });
  });
});
