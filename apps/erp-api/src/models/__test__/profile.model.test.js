/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/models/__test__/profile.model.test.js - Profile model tests
* Tests profile schema validation and data management
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Profile = require('../Profile'); 

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Profile.deleteMany();
});

describe('Profile model', () => {
  it('should create and find a profile', async () => {
    await Profile.create({
      userId: 'abc123',
      firstname: 'Toto',
      lastname: 'Dupond',
      sexe: 'M',
    });

    const found = await Profile.findOne({ userId: 'abc123' });

    expect(found).not.toBeNull();
    expect(found.firstname).toBe('Toto');
    expect(found.lastname).toBe('Dupond');
    expect(found.sexe).toBe('M');
  });

  it('should set default values', async () => {
    await Profile.create({ userId: 'xyz999', firstname: 'Jane' });
    const found = await Profile.findOne({ userId: 'xyz999' });
    expect(found.lastname).toBe('');
    expect(found.sexe).toBe('X');
  });

  it('should require userId and firstname', async () => {
    // Sans userId
    await expect(Profile.create({ firstname: 'X' })).rejects.toThrow();
    // Sans firstname
    await expect(Profile.create({ userId: 'no-first' })).rejects.toThrow();
  });

  it('should not allow duplicate userId', async () => {
    await Profile.create({ userId: 'unique', firstname: 'A' });
    await expect(Profile.create({ userId: 'unique', firstname: 'B' })).rejects.toThrow();
  });
});
