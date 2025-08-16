/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/middlewares/__test__/canAccessOwnData.test.js - Data access control middleware tests
* Tests user data access restrictions and ownership validation
*
* coded by farid212@Yaba-IT!
*/

const canAccessOwnData = require('../canAccessOwnData.js');

describe('CanAccessOwnData Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    mockReq = {
      method: 'GET',
      url: '/test',
      headers: {
        'user-agent': 'Mozilla/5.0 (Test Browser)'
      },
      ip: '192.168.1.1',
      connection: { remoteAddress: '192.168.1.1' },
      params: {},
      query: {},
      body: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('User Authentication Check', () => {
    it('should return 401 when user is not authenticated', () => {
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated to access data',
        code: 'USER_NOT_AUTHENTICATED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when req.user is null', () => {
      mockReq.user = null;
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated to access data',
        code: 'USER_NOT_AUTHENTICATED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when req.user.id is undefined', () => {
      mockReq.user = {
        email: 'test@example.com'
        // No id property
      };
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated to access data',
        code: 'USER_NOT_AUTHENTICATED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('UserId Parameter Validation', () => {
    beforeEach(() => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com'
      };
    });

    it('should return 400 when userId parameter is missing', () => {
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing parameter',
        message: 'userId parameter is required',
        code: 'MISSING_USER_ID'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when userId parameter is undefined', () => {
      mockReq.params.userId = undefined;
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing parameter',
        message: 'userId parameter is required',
        code: 'MISSING_USER_ID'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when userId parameter is null', () => {
      mockReq.params.userId = null;
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing parameter',
        message: 'userId parameter is required',
        code: 'MISSING_USER_ID'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('UserId Format Validation', () => {
    beforeEach(() => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com'
      };
    });

    it('should return 400 when userId parameter is empty string', () => {
      mockReq.params.userId = '';
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid parameter',
        message: 'userId parameter is invalid',
        code: 'INVALID_USER_ID'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when userId parameter is whitespace only', () => {
      mockReq.params.userId = '   ';
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid parameter',
        message: 'userId parameter is invalid',
        code: 'INVALID_USER_ID'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when userId parameter is too short after trimming', () => {
      mockReq.params.userId = '  a  ';
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid parameter',
        message: 'userId parameter is invalid',
        code: 'INVALID_USER_ID'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Access Control Logic', () => {
    beforeEach(() => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com'
      };
    });

    it('should allow access when user ID matches userId parameter', () => {
      mockReq.params.userId = 'user123';
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should allow access when user ID matches userId parameter after trimming', () => {
      mockReq.params.userId = '  user123  ';
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should deny access when user ID does not match userId parameter', () => {
      mockReq.params.userId = 'user456';
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: 'You can only access your own data',
        code: 'UNAUTHORIZED_DATA_ACCESS',
        requestedUserId: 'user456',
        currentUserId: 'user123'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access when user ID does not match userId parameter (case sensitive)', () => {
      mockReq.params.userId = 'USER123';
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: 'You can only access your own data',
        code: 'UNAUTHORIZED_DATA_ACCESS',
        requestedUserId: 'USER123',
        currentUserId: 'user123'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Request Enhancement', () => {
    beforeEach(() => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com'
      };
      mockReq.params.userId = 'user123';
    });

    it('should add accessControlTime to request object', () => {
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockReq.accessControlTime).toBeDefined();
      expect(typeof mockReq.accessControlTime).toBe('number');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should add requestedUserId to request object', () => {
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockReq.requestedUserId).toBe('user123');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should add requestedUserId after trimming', () => {
      mockReq.params.userId = '  user123  ';
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockReq.requestedUserId).toBe('user123');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com'
      };
    });

    it('should handle unexpected errors gracefully', () => {
      // Simulate an error by making the middleware throw
      Object.defineProperty(mockReq, 'user', {
        get: () => {
          throw new Error('Unexpected error');
        }
      });

      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access control service error',
        message: 'An unexpected error occurred during access control',
        code: 'ACCESS_CONTROL_SERVICE_ERROR'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle numeric user IDs', () => {
      mockReq.user = {
        id: 123,
        email: 'test@example.com'
      };
      mockReq.params.userId = '123';
      
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.requestedUserId).toBe('123');
    });

    it('should handle UUID user IDs', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      mockReq.user = {
        id: uuid,
        email: 'test@example.com'
      };
      mockReq.params.userId = uuid;
      
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.requestedUserId).toBe(uuid);
    });

    it('should handle special characters in user IDs', () => {
      const specialId = 'user-123_test@example.com';
      mockReq.user = {
        id: specialId,
        email: 'test@example.com'
      };
      mockReq.params.userId = specialId;
      
      canAccessOwnData(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.requestedUserId).toBe(specialId);
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com'
      };
      mockReq.params.userId = 'user123';
    });

    it('should complete access control check within reasonable time', () => {
      const startTime = Date.now();
      canAccessOwnData(mockReq, mockRes, mockNext);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      methods.forEach(method => {
        mockReq.method = method;
        mockReq.user = { id: 'user123', email: 'test@example.com' };
        mockReq.params.userId = 'user123';
        
        canAccessOwnData(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        mockNext.mockClear();
      });
    });

    it('should work with different URL patterns', () => {
      const urls = [
        '/users/user123/profile',
        '/api/users/user123/settings',
        '/profile/user123/preferences'
      ];
      
      urls.forEach(url => {
        mockReq.url = url;
        mockReq.user = { id: 'user123', email: 'test@example.com' };
        mockReq.params.userId = 'user123';
        
        canAccessOwnData(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalled();
        mockNext.mockClear();
      });
    });
  });
});
