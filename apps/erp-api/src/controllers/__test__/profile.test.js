const profileCtrl = require('../profile');
const Profile = require('../../models/Profile');
const { supabase } = require('../../configs/config');

jest.mock('../../models/Profile');
jest.mock('../../configs/config', () => ({
  supabase: {
    auth: {
      admin: {
        createUser: jest.fn(),
      },
    },
  },
}));

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn();
  return res;
};

describe('User Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('returns 400 if email or password missing', async () => {
      const req = { body: { email: '', password: '' } };
      const res = mockRes();
      await profileCtrl.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email and password are required' });
    });

    it('returns 400 if Supabase returns error', async () => {
      const req = { body: { email: 'test@mail.com', password: '1234' } };
      const res = mockRes();
      supabase.auth.admin.createUser.mockResolvedValue({
        data: null,
        error: { message: 'Supabase fail' },
      });
      await profileCtrl.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Supabase fail' });
    });

    it('returns 409 if profile already exists', async () => {
      const req = { body: { email: 'test@mail.com', password: '1234' } };
      const res = mockRes();
      supabase.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      Profile.findOne.mockResolvedValue({ userId: 'user-1' });
      await profileCtrl.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Profile already exists' });
    });

    it('creates profile and returns 201', async () => {
      const req = { body: { email: 'test@mail.com', password: '1234', foo: 'bar' } };
      const res = mockRes();
      supabase.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });
      Profile.findOne.mockResolvedValue(null);
      Profile.create.mockResolvedValue({ userId: 'user-1', foo: 'bar' });
      await profileCtrl.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ userId: 'user-1', foo: 'bar' });
    });

    it('returns 500 on unknown error', async () => {
      const req = { body: { email: 'test@mail.com', password: '1234', foo: 'bar' } };
      const res = mockRes();
      supabase.auth.admin.createUser.mockRejectedValue(new Error('oops'));
      await profileCtrl.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getUserById', () => {
    it('returns profile if found', async () => {
      const req = { params: { id: 'id1' } };
      const res = mockRes();
      Profile.findById.mockResolvedValue({ userId: 'user-1' });
      await profileCtrl.getUserById(req, res);
      expect(res.json).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('returns 404 if not found', async () => {
      const req = { params: { id: 'id1' } };
      const res = mockRes();
      Profile.findById.mockResolvedValue(null);
      await profileCtrl.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Profile not found' });
    });

    it('returns 500 on error', async () => {
      const req = { params: { id: 'id1' } };
      const res = mockRes();
      Profile.findById.mockRejectedValue(new Error('fail'));
      await profileCtrl.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('updateUserById', () => {
    it('returns updated profile', async () => {
      const req = { params: { id: 'id1' }, body: { foo: 'bar' } };
      const res = mockRes();
      Profile.findByIdAndUpdate.mockResolvedValue({ userId: 'id1', foo: 'bar' });
      await profileCtrl.updateUserById(req, res);
      expect(res.json).toHaveBeenCalledWith({ userId: 'id1', foo: 'bar' });
    });

    it('returns 404 if not found', async () => {
      const req = { params: { id: 'id1' }, body: {} };
      const res = mockRes();
      Profile.findByIdAndUpdate.mockResolvedValue(null);
      await profileCtrl.updateUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Profile not found' });
    });

    it('returns 500 on error', async () => {
      const req = { params: { id: 'id1' }, body: {} };
      const res = mockRes();
      Profile.findByIdAndUpdate.mockRejectedValue(new Error('fail'));
      await profileCtrl.updateUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('deleteUserById', () => {
    it('returns 204 if deleted', async () => {
      const req = { params: { id: 'id1' } };
      const res = mockRes();
      Profile.findByIdAndDelete.mockResolvedValue({ userId: 'id1' });
      await profileCtrl.deleteUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('returns 404 if not found', async () => {
      const req = { params: { id: 'id1' } };
      const res = mockRes();
      Profile.findByIdAndDelete.mockResolvedValue(null);
      await profileCtrl.deleteUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Profile not found' });
    });

    it('returns 500 on error', async () => {
      const req = { params: { id: 'id1' } };
      const res = mockRes();
      Profile.findByIdAndDelete.mockRejectedValue(new Error('fail'));
      await profileCtrl.deleteUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getMyProfile', () => {
    it('returns profile if found', async () => {
      const req = { user: { id: 'user-1' } };
      const res = mockRes();
      Profile.findOne.mockResolvedValue({ userId: 'user-1' });
      await profileCtrl.getMyProfile(req, res);
      expect(res.json).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('returns 404 if not found', async () => {
      const req = { user: { id: 'user-1' } };
      const res = mockRes();
      Profile.findOne.mockResolvedValue(null);
      await profileCtrl.getMyProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Profile not found' });
    });

    it('returns 500 on error', async () => {
      const req = { user: { id: 'user-1' } };
      const res = mockRes();
      Profile.findOne.mockRejectedValue(new Error('fail'));
      await profileCtrl.getMyProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('updateMyProfile', () => {
    it('returns updated profile', async () => {
      const req = { user: { id: 'user-1' }, body: { foo: 'bar' } };
      const res = mockRes();
      Profile.findOneAndUpdate.mockResolvedValue({ userId: 'user-1', foo: 'bar' });
      await profileCtrl.updateMyProfile(req, res);
      expect(res.json).toHaveBeenCalledWith({ userId: 'user-1', foo: 'bar' });
    });

    it('returns 404 if not found', async () => {
      const req = { user: { id: 'user-1' }, body: {} };
      const res = mockRes();
      Profile.findOneAndUpdate.mockResolvedValue(null);
      await profileCtrl.updateMyProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Profile not found' });
    });

    it('returns 500 on error', async () => {
      const req = { user: { id: 'user-1' }, body: {} };
      const res = mockRes();
      Profile.findOneAndUpdate.mockRejectedValue(new Error('fail'));
      await profileCtrl.updateMyProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('deleteMyProfile', () => {
    it('returns 204 if deleted', async () => {
      const req = { user: { id: 'user-1' } };
      const res = mockRes();
      Profile.findOneAndDelete.mockResolvedValue({ userId: 'user-1' });
      await profileCtrl.deleteMyProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('returns 404 if not found', async () => {
      const req = { user: { id: 'user-1' } };
      const res = mockRes();
      Profile.findOneAndDelete.mockResolvedValue(null);
      await profileCtrl.deleteMyProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Profile not found' });
    });

    it('returns 500 on error', async () => {
      const req = { user: { id: 'user-1' } };
      const res = mockRes();
      Profile.findOneAndDelete.mockRejectedValue(new Error('fail'));
      await profileCtrl.deleteMyProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
