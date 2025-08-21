/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/test-utils/setup.js - Test setup utilities
* Provides database setup and teardown utilities
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Setup test database connection
 * @returns {Promise<void>}
 */
const setupTestDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

/**
 * Teardown test database connection
 * @returns {Promise<void>}
 */
const teardownTestDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

/**
 * Clear all collections in test database
 * @returns {Promise<void>}
 */
const clearTestDatabase = async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const collection of collections) {
    await mongoose.connection.db.collection(collection.name).deleteMany({});
  }
};

/**
 * Setup test environment
 * @returns {Promise<void>}
 */
const setupTestEnvironment = async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Setup database
  await setupTestDatabase();
  
  // Clear any existing data
  await clearTestDatabase();
};

/**
 * Teardown test environment
 * @returns {Promise<void>}
 */
const teardownTestEnvironment = async () => {
  await teardownTestDatabase();
};

/**
 * Create test database hooks for Jest
 * @returns {Object} Jest hooks object
 */
const createTestHooks = () => ({
  beforeAll: async () => {
    await setupTestEnvironment();
  },
  
  afterAll: async () => {
    await teardownTestEnvironment();
  },
  
  beforeEach: async () => {
    await clearTestDatabase();
  },
  
  afterEach: async () => {
    jest.clearAllMocks();
  }
});

module.exports = {
  setupTestDatabase,
  teardownTestDatabase,
  clearTestDatabase,
  setupTestEnvironment,
  teardownTestEnvironment,
  createTestHooks
};
