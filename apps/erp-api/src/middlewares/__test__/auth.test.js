const auth = require('../auth');
const { supabase } = require('../../configs/config');

jest.mock('../../configs/config', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('auth middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 if no token', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    await auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 if Supabase returns error', async () => {
    const req = { headers: { authorization: 'Bearer abcd' } };
    const res = mockRes();
    const next = jest.fn();
    supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'fail' } });
    await auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token Invalid' });
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.user and calls next if token is valid', async () => {
    const req = { headers: { authorization: 'Bearer abcd' } };
    const res = mockRes();
    const next = jest.fn();
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: '123' } }, error: null });
    await auth(req, res, next);
    expect(req.user).toEqual({ id: '123' });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
