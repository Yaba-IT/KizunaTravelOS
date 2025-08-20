/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/middlewares/__test__/auth.test.js - Authentication middleware tests
* Tests JWT token validation and authentication logic
*
* coded by farid212@Yaba-IT!
*/

const jwt = require('jsonwebtoken');
const auth = require('../auth.js');

// Mock config
jest.mock('../../configs/config.js', () => ({
  jwt: {
    secret: 'test-secret',
    issuer: 'test-issuer',
    audience: 'test-audience'
  }
}));

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let validToken;
  let expiredToken;
  let invalidToken;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create valid JWT token
    validToken = jwt.sign(
      {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user',
        firstName: 'John',
        lastName: 'Doe'
      },
      'test-secret',
      {
        issuer: 'test-issuer',
        audience: 'test-audience',
        expiresIn: '1h'
      }
    );

    // Create expired JWT token
    expiredToken = jwt.sign(
      {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user'
      },
      'test-secret',
      {
        issuer: 'test-issuer',
        audience: 'test-audience',
        expiresIn: '0s' // Expired immediately
      }
    );

    // Create invalid token
    invalidToken = 'invalid.token.format';

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

  describe('Token Validation', () => {
    it('should return 401 when no token is provided', async () => {
      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'No authorization token provided',
        code: 'NO_TOKEN'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token format is invalid', async () => {
      mockReq.headers.authorization = `Bearer ${invalidToken}`;

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'Invalid token signature',
        code: 'INVALID_TOKEN_SIGNATURE'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is too short', async () => {
      mockReq.headers.authorization = 'Bearer short';

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token format',
        message: 'The provided token is malformed',
        code: 'INVALID_TOKEN_FORMAT'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('JWT Verification', () => {
    it('should return 401 when JWT verification fails', async () => {
      mockReq.headers.authorization = `Bearer ${invalidToken}`;

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'Invalid token signature',
        code: 'INVALID_TOKEN_SIGNATURE'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token has expired', async () => {
      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token has invalid signature', async () => {
      const tokenWithWrongSecret = jwt.sign(
        { userId: 'user123', email: 'test@example.com' },
        'wrong-secret',
        { issuer: 'test-issuer', audience: 'test-audience' }
      );

      mockReq.headers.authorization = `Bearer ${tokenWithWrongSecret}`;

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'Invalid token signature',
        code: 'INVALID_TOKEN_SIGNATURE'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Token Claims Validation', () => {
    it('should return 401 when token is missing userId', async () => {
      const tokenWithoutUserId = jwt.sign(
        { email: 'test@example.com', role: 'user' },
        'test-secret',
        { issuer: 'test-issuer', audience: 'test-audience' }
      );

      mockReq.headers.authorization = `Bearer ${tokenWithoutUserId}`;

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token claims',
        message: 'Token is missing required user information',
        code: 'MISSING_TOKEN_CLAIMS'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is missing email', async () => {
      const tokenWithoutEmail = jwt.sign(
        { userId: 'user123', role: 'user' },
        'test-secret',
        { issuer: 'test-issuer', audience: 'test-audience' }
      );

      mockReq.headers.authorization = `Bearer ${tokenWithoutEmail}`;

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token claims',
        message: 'Token is missing required user information',
        code: 'MISSING_TOKEN_CLAIMS'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Successful Authentication', () => {
    it('should call next() when token is valid', async () => {
      mockReq.headers.authorization = `Bearer ${validToken}`;

      await auth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should set user object in request', async () => {
      mockReq.headers.authorization = `Bearer ${validToken}`;

      await auth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe('user123');
      expect(mockReq.user.email).toBe('test@example.com');
      expect(mockReq.user.role).toBe('user');
      expect(mockReq.user.firstName).toBe('John');
      expect(mockReq.user.lastName).toBe('Doe');
    });

    it('should set authToken in request', async () => {
      mockReq.headers.authorization = `Bearer ${validToken}`;

      await auth(mockReq, mockRes, mockNext);

      expect(mockReq.authToken).toBe(validToken);
    });

    it('should set authTime in request', async () => {
      mockReq.headers.authorization = `Bearer ${validToken}`;

      await auth(mockReq, mockRes, mockNext);

      expect(mockReq.authTime).toBeDefined();
      expect(typeof mockReq.authTime).toBe('number');
    });

    it('should set jwtPayload in request', async () => {
      mockReq.headers.authorization = `Bearer ${validToken}`;

      await auth(mockReq, mockRes, mockNext);

      expect(mockReq.jwtPayload).toBeDefined();
      expect(mockReq.jwtPayload.userId).toBe('user123');
      expect(mockReq.jwtPayload.email).toBe('test@example.com');
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // Mock jwt.verify to throw an error
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      mockReq.headers.authorization = `Bearer ${validToken}`;

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'Token verification failed',
        code: 'TOKEN_VERIFICATION_FAILED'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle Bearer token with extra spaces', async () => {
      // Reset the JWT mock to use the real implementation
      jest.restoreAllMocks();
      
      mockReq.headers.authorization = `  Bearer  ${validToken}  `;

      await auth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
    });

    it('should handle different IP address sources', async () => {
      // Reset the JWT mock to use the real implementation
      jest.restoreAllMocks();
      
      mockReq.headers.authorization = `Bearer ${validToken}`;
      mockReq.headers['x-forwarded-for'] = '10.0.0.1';
      delete mockReq.ip;
      delete mockReq.connection.remoteAddress;

      await auth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
    });

    it('should set default role when not provided in token', async () => {
      // Reset the JWT mock to use the real implementation
      jest.restoreAllMocks();
      
      const tokenWithoutRole = jwt.sign(
        { userId: 'user123', email: 'test@example.com' },
        'test-secret',
        { issuer: 'test-issuer', audience: 'test-audience' }
      );

      mockReq.headers.authorization = `Bearer ${tokenWithoutRole}`;

      await auth(mockReq, mockRes, mockNext);

      expect(mockReq.user.role).toBe('user');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should complete authentication within reasonable time', async () => {
      // Reset the JWT mock to use the real implementation
      jest.restoreAllMocks();
      
      mockReq.headers.authorization = `Bearer ${validToken}`;
      
      const startTime = Date.now();
      await auth(mockReq, mockRes, mockNext);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
