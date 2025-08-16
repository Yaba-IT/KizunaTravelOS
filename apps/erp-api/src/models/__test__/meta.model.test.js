/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/models/__test__/meta.model.test.js - Meta model tests
* Tests metadata schema and audit trail functionality
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const metaSchema = require('../Meta');

describe('Meta Schema', () => {
  let mongoServer;
  let TestModel;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    
    // Create a test model using the meta schema
    const testSchema = new mongoose.Schema({
      name: String,
      meta: metaSchema
    });
    TestModel = mongoose.model('TestModel', testSchema);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await TestModel.deleteMany({});
  });

  describe('Schema Definition', () => {
    it('should have all required meta fields', () => {
      const testDoc = new TestModel({
        name: 'Test',
        meta: {}
      });
      
      expect(testDoc.meta.created_at).toBeDefined();
      expect(testDoc.meta.updated_at).toBeDefined();
      expect(testDoc.meta.created_by).toBeUndefined();
      expect(testDoc.meta.updated_by).toBeUndefined();
      expect(testDoc.meta.lastLogin).toBeNull();
      expect(testDoc.meta.loginAttempts).toBe(0);
      expect(testDoc.meta.lockUntil).toBeNull();
      expect(testDoc.meta.isActive).toBe(true);
      expect(testDoc.meta.isDeleted).toBe(false);
      expect(testDoc.meta.deleted_at).toBeNull();
      expect(testDoc.meta.deleted_by).toBeNull();
    });

    it('should set default values correctly', () => {
      const testDoc = new TestModel({
        name: 'Test',
        meta: {}
      });
      
      expect(testDoc.meta.isActive).toBe(true);
      expect(testDoc.meta.isDeleted).toBe(false);
      expect(testDoc.meta.loginAttempts).toBe(0);
    });
  });

  describe('Timestamps', () => {
    it('should set created_at on new document', async () => {
      const beforeCreate = new Date();
      const testDoc = new TestModel({
        name: 'Test',
        meta: {}
      });
      
      await testDoc.save();
      
      expect(testDoc.meta.created_at).toBeInstanceOf(Date);
      expect(testDoc.meta.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    });

    it('should update updated_at on save', async () => {
      const testDoc = new TestModel({
        name: 'Test',
        meta: {}
      });
      
      await testDoc.save();
      const originalUpdatedAt = testDoc.meta.updated_at;
      
      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      testDoc.name = 'Updated';
      await testDoc.save();
      
      expect(testDoc.meta.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Soft Delete Methods', () => {
    it('should soft delete correctly', async () => {
      const testDoc = new TestModel({
        name: 'Test',
        meta: {}
      });
      
      await testDoc.save();
      const userId = new mongoose.Types.ObjectId();
      
      testDoc.meta.softDelete(userId);
      await testDoc.save();
      
      expect(testDoc.meta.isDeleted).toBe(true);
      expect(testDoc.meta.deleted_at).toBeInstanceOf(Date);
      expect(testDoc.meta.deleted_by).toEqual(userId);
      expect(testDoc.meta.isActive).toBe(false);
    });

    it('should restore correctly', async () => {
      const testDoc = new TestModel({
        name: 'Test',
        meta: {}
      });
      
      await testDoc.save();
      const userId = new mongoose.Types.ObjectId();
      
      testDoc.meta.softDelete(userId);
      await testDoc.save();
      
      testDoc.meta.restore();
      await testDoc.save();
      
      expect(testDoc.meta.isDeleted).toBe(false);
      expect(testDoc.meta.deleted_at).toBeNull();
      expect(testDoc.meta.deleted_by).toBeNull();
      expect(testDoc.meta.isActive).toBe(true);
    });
  });

  describe('Account Lock Methods', () => {
    it('should check if account is locked', () => {
      const testDoc = new TestModel({
        name: 'Test',
        meta: {}
      });
      
      expect(testDoc.meta.isLocked()).toBe(false);
      
      testDoc.meta.lockUntil = new Date(Date.now() + 1000); // Lock for 1 second
      expect(testDoc.meta.isLocked()).toBe(true);
      
      testDoc.meta.lockUntil = new Date(Date.now() - 1000); // Expired lock
      expect(testDoc.meta.isLocked()).toBe(false);
    });

    it('should increment login attempts correctly', () => {
      const testDoc = new TestModel({
        name: 'Test',
        meta: {}
      });
      
      expect(testDoc.meta.loginAttempts).toBe(0);
      
      testDoc.meta.incLoginAttempts();
      expect(testDoc.meta.loginAttempts).toBe(1);
      
      testDoc.meta.incLoginAttempts();
      expect(testDoc.meta.loginAttempts).toBe(2);
    });

    it('should lock account after 5 failed attempts', () => {
      const testDoc = new TestModel({
        name: 'Test',
        meta: {}
      });
      
      // Increment 4 times - should not lock
      for (let i = 0; i < 4; i++) {
        testDoc.meta.incLoginAttempts();
      }
      expect(testDoc.meta.loginAttempts).toBe(4);
      expect(testDoc.meta.isLocked()).toBe(false);
      
      // 5th attempt - should lock
      testDoc.meta.incLoginAttempts();
      expect(testDoc.meta.loginAttempts).toBe(5);
      expect(testDoc.meta.isLocked()).toBe(true);
      expect(testDoc.meta.lockUntil).toBeInstanceOf(Date);
    });

    it('should reset login attempts when lock expires', () => {
      const testDoc = new TestModel({
        name: 'Test',
        meta: {}
      });
      
      // Lock the account
      for (let i = 0; i < 5; i++) {
        testDoc.meta.incLoginAttempts();
      }
      expect(testDoc.meta.isLocked()).toBe(true);
      
      // Simulate expired lock
      testDoc.meta.lockUntil = new Date(Date.now() - 1000);
      
      // Next attempt should reset
      testDoc.meta.incLoginAttempts();
      expect(testDoc.meta.loginAttempts).toBe(1);
      expect(testDoc.meta.isLocked()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined meta gracefully', () => {
      const testDoc = new TestModel({
        name: 'Test'
        // No meta field
      });
      
      expect(testDoc.meta).toBeUndefined();
    });

    it('should handle null values in meta fields', () => {
      const testDoc = new TestModel({
        name: 'Test',
        meta: {
          lastLogin: null,
          loginAttempts: null,
          lockUntil: null
        }
      });
      
      expect(testDoc.meta.lastLogin).toBeNull();
      expect(testDoc.meta.loginAttempts).toBe(0); // Should use default
      expect(testDoc.meta.lockUntil).toBeNull();
    });
  });

  describe('Data Persistence', () => {
    it('should persist meta data correctly', async () => {
      const testDoc = new TestModel({
        name: 'Test',
        meta: {
          created_by: new mongoose.Types.ObjectId(),
          lastLogin: new Date(),
          isActive: false
        }
      });
      
      await testDoc.save();
      
      const retrievedDoc = await TestModel.findById(testDoc._id);
      expect(retrievedDoc.meta.created_by).toEqual(testDoc.meta.created_by);
      expect(retrievedDoc.meta.lastLogin.getTime()).toBe(testDoc.meta.lastLogin.getTime());
      expect(retrievedDoc.meta.isActive).toBe(false);
    });

    it('should update meta fields correctly', async () => {
      const testDoc = new TestModel({
        name: 'Test',
        meta: {}
      });
      
      await testDoc.save();
      
      testDoc.meta.lastLogin = new Date();
      testDoc.meta.loginAttempts = 3;
      await testDoc.save();
      
      const retrievedDoc = await TestModel.findById(testDoc._id);
      expect(retrievedDoc.meta.lastLogin.getTime()).toBe(testDoc.meta.lastLogin.getTime());
      expect(retrievedDoc.meta.loginAttempts).toBe(3);
    });
  });
});
