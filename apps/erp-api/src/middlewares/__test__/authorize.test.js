/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/middlewares/__test__/authorize.test.js - Authorization middleware tests
* Tests role-based access control and permission validation
*
* coded by farid212@Yaba-IT!
*/

const authorize = require('../authorize.js');

describe('Authorize Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let authorizeMiddleware;

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
      connection: { remoteAddress: '192.168.1.1' }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('User Authentication Check', () => {
    it('should return 401 when user is not authenticated', () => {
      authorizeMiddleware = authorize(['admin']);
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated before authorization',
        code: 'USER_NOT_AUTHENTICATED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when req.user is null', () => {
      mockReq.user = null;
      authorizeMiddleware = authorize(['admin']);
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'User must be authenticated before authorization',
        code: 'USER_NOT_AUTHENTICATED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Role Assignment Check', () => {
    it('should return 403 when user has no role assigned', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com'
        // No role property
      };

      authorizeMiddleware = authorize(['admin']);
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        message: 'User has no role assigned',
        code: 'NO_ROLE_ASSIGNED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user.role is null', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: null
      };

      authorizeMiddleware = authorize(['admin']);
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        message: 'User has no role assigned',
        code: 'NO_ROLE_ASSIGNED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user.role is undefined', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: undefined
      };

      authorizeMiddleware = authorize(['admin']);
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Insufficient permissions',
        message: 'User has no role assigned',
        code: 'NO_ROLE_ASSIGNED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Role Validation - Single Role', () => {
    it('should allow access when user role matches single allowed role', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };

      authorizeMiddleware = authorize('admin');
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should deny access when user role does not match single allowed role', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      authorizeMiddleware = authorize('admin');
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: "Role 'user' is not authorized for this resource",
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: 'admin',
        userRole: 'user'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Role Validation - Multiple Roles', () => {
    it('should allow access when user role is in allowed roles array', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };

      authorizeMiddleware = authorize(['admin', 'manager']);
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should allow access when user role is in allowed roles array (different position)', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'manager'
      };

      authorizeMiddleware = authorize(['admin', 'manager', 'user']);
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should deny access when user role is not in allowed roles array', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      authorizeMiddleware = authorize(['admin', 'manager']);
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: "Role 'user' is not authorized for this resource",
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: ['admin', 'manager'],
        userRole: 'user'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('User Metadata Role Fallback', () => {
    it('should use user_metadata.role when user.role is not available', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        user_metadata: {
          role: 'admin'
        }
      };

      authorizeMiddleware = authorize('admin');
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should prioritize user.role over user_metadata.role', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'manager',
        user_metadata: {
          role: 'admin'
        }
      };

      authorizeMiddleware = authorize('manager');
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('Request Enhancement', () => {
    it('should add userRole to request object', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };

      authorizeMiddleware = authorize('admin');
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.userRole).toBe('admin');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should add authorizedRoles to request object', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };

      authorizeMiddleware = authorize(['admin', 'manager']);
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.authorizedRoles).toEqual(['admin', 'manager']);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should add authorizationTime to request object', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };

      authorizeMiddleware = authorize('admin');
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.authorizationTime).toBeDefined();
      expect(typeof mockReq.authorizationTime).toBe('number');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };

      // Mock an error by making the middleware throw
      authorizeMiddleware = authorize('admin');
      
      // Simulate an error by modifying the request object unexpectedly
      Object.defineProperty(mockReq, 'user', {
        get: () => {
          throw new Error('Unexpected error');
        }
      });

      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authorization service error',
        message: 'An unexpected error occurred during authorization',
        code: 'AUTHORIZATION_SERVICE_ERROR'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty allowed roles array', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };

      authorizeMiddleware = authorize([]);
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: "Role 'admin' is not authorized for this resource",
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: [],
        userRole: 'admin'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle null allowed roles', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };

      authorizeMiddleware = authorize(null);
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: "Role 'admin' is not authorized for this resource",
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: null,
        userRole: 'admin'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle undefined allowed roles', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };

      authorizeMiddleware = authorize(undefined);
      authorizeMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access denied',
        message: "Role 'admin' is not authorized for this resource",
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: undefined,
        userRole: 'admin'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should complete authorization within reasonable time', () => {
      mockReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };

      authorizeMiddleware = authorize('admin');
      
      const startTime = Date.now();
      authorizeMiddleware(mockReq, mockRes, mockNext);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
