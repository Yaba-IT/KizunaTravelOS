/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/controllers/__test__/profile.test.js - Profile controller tests
* Tests profile management and data handling functionality
*
* coded by farid212@Yaba-IT!
*/

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const profileController = require('../profile');
const { 
  createUserWithProfile, 
  createMockRequest, 
  createMockResponse, 
  createMockNext 
} = require('../../test-utils/factories');

let mongoServer;

/**
 * @group Profile Management
 * @description Tests profile controller functionality
 */
describe('Profile Controller', () => {
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
   * @test Gets current user profile
   * @scenario User with valid profile exists
   * @expected Returns profile and user information
   */
  describe('getMyProfile', () => {
    it('should return current user profile', async () => {
      // Arrange
      const { user, profile } = await createUserWithProfile();
      const req = createMockRequest({ 
        user: { id: user._id.toString(), _id: user._id }
      });
      const res = createMockResponse();

      // Act
      await profileController.getMyProfile(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        profile: expect.objectContaining({
          firstname: profile.firstname,
          lastname: profile.lastname,
          sexe: profile.sexe
        }),
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
      await profileController.getMyProfile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });

    it('should return 404 if profile not found', async () => {
      // Arrange
      const { user } = await createUserWithProfile();
      
      // Delete the profile to simulate missing profile
      const Profile = require('../../models/Profile');
      await Profile.findByIdAndDelete(user.profileId);

      const req = createMockRequest({ 
        user: { id: user._id.toString(), _id: user._id }
      });
      const res = createMockResponse();

      // Act
      await profileController.getMyProfile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Profile not found'
      });
    });
  });

  /**
   * @test Updates current user profile
   * @scenario Valid profile update data
   * @expected Profile updated successfully
   */
  describe('updateMyProfile', () => {
    it('should update current user profile', async () => {
      // Arrange
      const { user, profile } = await createUserWithProfile();
      const updateData = {
        firstname: 'Jane',
        lastname: 'Smith',
        sexe: 'F'
      };
      const req = createMockRequest({
        user: { id: user._id.toString(), _id: user._id },
        body: updateData
      });
      const res = createMockResponse();

      // Act
      await profileController.updateMyProfile(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        profile: expect.objectContaining({
          firstname: 'Jane',
          lastname: 'Smith',
          sexe: 'F'
        })
      });
    });

    it('should handle partial updates', async () => {
      // Arrange
      const { user, profile } = await createUserWithProfile();
      const updateData = { firstname: 'Jane' };
      const req = createMockRequest({
        user: { id: user._id.toString(), _id: user._id },
        body: updateData
      });
      const res = createMockResponse();

      // Act
      await profileController.updateMyProfile(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        profile: expect.objectContaining({
          firstname: 'Jane',
          lastname: profile.lastname, // Should remain unchanged
          sexe: profile.sexe // Should remain unchanged
        })
      });
    });
  });

  /**
   * @test Gets profile by ID (admin only)
   * @scenario Valid profile ID provided
   * @expected Returns profile and user information
   */
  describe('getProfileById', () => {
    it('should return profile by ID with user info', async () => {
      // Arrange
      const { user, profile } = await createUserWithProfile();
      const req = createMockRequest({ 
        params: { id: profile._id.toString() }
      });
      const res = createMockResponse();

      // Act
      await profileController.getProfileById(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        profile: expect.objectContaining({
          firstname: profile.firstname,
          lastname: profile.lastname,
          sexe: profile.sexe
        }),
        user: expect.objectContaining({
          email: user.email,
          role: user.role
        })
      });
    });

    it('should return 404 for non-existent profile', async () => {
      // Arrange
      const fakeId = new mongoose.Types.ObjectId();
      const req = createMockRequest({ 
        params: { id: fakeId.toString() }
      });
      const res = createMockResponse();

      // Act
      await profileController.getProfileById(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Profile not found'
      });
    });
  });

  /**
   * @test Updates profile by ID (admin only)
   * @scenario Valid profile ID and update data
   * @expected Profile updated successfully
   */
  describe('updateProfileById', () => {
    it('should update profile by ID', async () => {
      // Arrange
      const { user, profile } = await createUserWithProfile();
      const updateData = {
        firstname: 'Updated',
        lastname: 'Name'
      };
      const req = createMockRequest({
        params: { id: profile._id.toString() },
        body: updateData
      });
      const res = createMockResponse();

      // Act
      await profileController.updateProfileById(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        profile: expect.objectContaining({
          firstname: 'Updated',
          lastname: 'Name'
        })
      });
    });
  });

  /**
   * @test Gets all profiles with pagination (admin only)
   * @scenario Multiple profiles exist
   * @expected Returns paginated profile list
   */
  describe('getAllProfiles', () => {
    it('should return all profiles with pagination', async () => {
      // Arrange
      await createUserWithProfile({ email: 'user1@example.com' });
      await createUserWithProfile({ email: 'user2@example.com' });
      await createUserWithProfile({ email: 'user3@example.com' });

      const req = createMockRequest({ 
        query: { page: '1', limit: '10' }
      });
      const res = createMockResponse();

      // Act
      await profileController.getAllProfiles(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        profiles: expect.arrayContaining([
          expect.objectContaining({
            profile: expect.objectContaining({
              firstname: expect.any(String),
              lastname: expect.any(String)
            }),
            user: expect.objectContaining({
              email: expect.any(String),
              role: expect.any(String)
            })
          })
        ]),
        pagination: expect.objectContaining({
          page: 1,
          limit: 10,
          total: expect.any(Number),
          pages: expect.any(Number)
        })
      });
    });

    it('should filter profiles by search term', async () => {
      // Arrange
      await createUserWithProfile({ 
        email: 'john@example.com' 
      }, { 
        firstname: 'John', 
        lastname: 'Doe' 
      });
      await createUserWithProfile({ 
        email: 'jane@example.com' 
      }, { 
        firstname: 'Jane', 
        lastname: 'Smith' 
      });

      const req = createMockRequest({ 
        query: { search: 'John' }
      });
      const res = createMockResponse();

      // Act
      await profileController.getAllProfiles(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        profiles: expect.arrayContaining([
          expect.objectContaining({
            profile: expect.objectContaining({
              firstname: 'John',
              lastname: 'Doe'
            })
          })
        ]),
        pagination: expect.objectContaining({
          total: expect.any(Number)
        })
      });
    });
  });

  /**
   * @test Restores deleted profile (admin only)
   * @scenario Profile was soft deleted
   * @expected Profile restored successfully
   */
  describe('restoreProfile', () => {
    it('should restore deleted profile', async () => {
      // Arrange
      const { user, profile } = await createUserWithProfile();
      
      // Soft delete the profile by setting isDeleted to true
      profile.meta.isDeleted = true;
      await profile.save();

      const req = createMockRequest({ 
        params: { id: profile._id.toString() }
      });
      const res = createMockResponse();

      // Act
      await profileController.restoreProfile(req, res);

      // Assert
      const response = res.json.mock.calls[0][0];
      expect(response.message).toBe('Profile restored successfully');
      expect(response.profile).toBeDefined();
      expect(response.profile._id).toBeDefined();
      expect(response.profile.firstname).toBeDefined();
      expect(response.profile.lastname).toBeDefined();
      expect(response.profile.role).toBeDefined();
      expect(response.profile.meta.isDeleted).toBe(false);
    });

    it('should return 400 if profile is not deleted', async () => {
      // Arrange
      const { user, profile } = await createUserWithProfile();
      const req = createMockRequest({ 
        params: { id: profile._id.toString() }
      });
      const res = createMockResponse();

      // Act
      await profileController.restoreProfile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Profile is not deleted'
      });
    });
  });

  /**
   * @test Gets profile statistics (admin only)
   * @scenario Multiple profiles with different statuses
   * @expected Returns profile statistics
   */
  describe('getProfileStats', () => {
    it('should return profile statistics', async () => {
      // Arrange
      await createUserWithProfile({ email: 'user1@example.com' });
      await createUserWithProfile({ email: 'user2@example.com' });
      await createUserWithProfile({ email: 'user3@example.com' });

      const req = createMockRequest();
      const res = createMockResponse();

      // Act
      await profileController.getProfileStats(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        stats: expect.objectContaining({
          total: expect.any(Number),
          deleted: expect.any(Number),
          recent: expect.any(Number),
          bySexe: expect.arrayContaining([
            expect.objectContaining({
              _id: expect.any(String),
              count: expect.any(Number)
            })
          ])
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
      jest.spyOn(User, 'findById').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const req = createMockRequest({ 
        user: { id: new mongoose.Types.ObjectId().toString() }
      });
      const res = createMockResponse();

      // Act
      await profileController.getMyProfile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });
});
