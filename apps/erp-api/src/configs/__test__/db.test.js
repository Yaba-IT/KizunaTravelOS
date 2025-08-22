const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { dbName: 'test' });
}, 30000);

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const c of collections) await c.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

describe('Database Connection', () => {
  it('should connect to in-memory MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });

  it('should be able to perform database operations', async () => {
    const collections = await mongoose.connection.db.listCollections().toArray();
    expect(Array.isArray(collections)).toBe(true);
  });
});