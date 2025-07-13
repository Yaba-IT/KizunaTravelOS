const canAccessOwnData = require('../canAccessOwnData');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('canAccessOwnData middleware', () => {
  it('returns 401 if req.user.id is missing', () => {
    const req = { user: null, params: { userId: 'abc' } };
    const res = mockRes();
    const next = jest.fn();
    canAccessOwnData(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'User not authenticated' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next if req.user.id matches req.params.userId', () => {
    const req = { user: { id: '123' }, params: { userId: '123' } };
    const res = mockRes();
    const next = jest.fn();
    canAccessOwnData(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 if req.user.id does not match req.params.userId', () => {
    const req = { user: { id: '123' }, params: { userId: 'abc' } };
    const res = mockRes();
    const next = jest.fn();
    canAccessOwnData(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });
});
