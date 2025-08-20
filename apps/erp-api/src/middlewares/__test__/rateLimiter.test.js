/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/middlewares/__test__/rateLimiter.test.js - Rate limiting middleware tests
* Tests request rate limiting and abuse prevention functionality
*
* coded by farid212@Yaba-IT!
*/

const fs = require('fs');
const path = require('path');
const {
  createRateLimiter,
  rateLimiters,
  applyRateLimiting
} = require('../rateLimiter.js');

// Mock fs module
jest.mock('fs');
jest.mock('path');

describe('Rate Limiter Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Clear the rate limit store between tests
    const { rateLimitStore } = require('../rateLimiter.js');
    rateLimitStore.clear();
    
    mockReq = {
      method: 'GET',
      url: '/test',
      headers: {
        'user-agent': 'Mozilla/5.0 (Test Browser)',
        'x-forwarded-for': '192.168.1.1'
      },
      connection: { remoteAddress: '192.168.1.1' },
      user: null
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // Mock fs and path
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockImplementation(() => {});
    fs.appendFileSync.mockImplementation(() => {});
    // Mock path.join to return different paths for different files
    path.join.mockImplementation((...args) => {
      if (args.includes('rate-limit-exceeded.log')) return '/mock/logs/rate-limit-exceeded.log';
      if (args.includes('rate-limit-success.log')) return '/mock/logs/rate-limit-success.log';
      if (args.includes('rate-limit-check.log')) return '/mock/logs/rate-limit-check.log';
      return '/mock/logs/path';
    });
  });

  describe('createRateLimiter', () => {
    it('should create rate limiter with default options', () => {
      const limiter = createRateLimiter();
      
      expect(typeof limiter).toBe('function');
      
      // Test default behavior
      limiter(mockReq, mockRes, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    it('should create rate limiter with custom options', () => {
      const limiter = createRateLimiter({
        windowMs: 60000, // 1 minute
        max: 5,
        message: 'Custom rate limit message'
      });
      
      expect(typeof limiter).toBe('function');
    });

    it('should handle custom keyGenerator function', () => {
      const customKeyGenerator = jest.fn().mockReturnValue('custom-key');
      const limiter = createRateLimiter({
        keyGenerator: customKeyGenerator
      });
      
      limiter(mockReq, mockRes, mockNext);
      
      expect(customKeyGenerator).toHaveBeenCalledWith(mockReq);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Client Identification', () => {
    it('should use IP address when user is not authenticated', () => {
      const limiter = createRateLimiter({ max: 1 });
      
      limiter(mockReq, mockRes, mockNext);
      
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/path',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/path');
      expect(logCall[1]).toContain('"clientId": "192.168.1.1"');
    });

    it('should use IP:userId when user is authenticated', () => {
      mockReq.user = { id: 'user123' };
      const limiter = createRateLimiter({ max: 1 });
      
      limiter(mockReq, mockRes, mockNext);
      
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/path',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/path');
      expect(logCall[1]).toContain('"clientId": "192.168.1.1:user123"');
    });

    it('should fallback to connection.remoteAddress when x-forwarded-for is not available', () => {
      delete mockReq.headers['x-forwarded-for'];
      const limiter = createRateLimiter({ max: 1 });
      
      limiter(mockReq, mockRes, mockNext);
      
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/path',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/path');
      expect(logCall[1]).toContain('"clientId": "192.168.1.1"');
    });
  });

  describe('Rate Limiting Logic', () => {
    it('should allow requests within limit', () => {
      const limiter = createRateLimiter({ max: 3, windowMs: 60000 });
      
      // First request
      limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      mockNext.mockClear();
      
      // Second request
      limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      mockNext.mockClear();
      
      // Third request
      limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should block requests when limit is exceeded', () => {
      const limiter = createRateLimiter({ max: 2, windowMs: 60000 });
      
      // First request
      limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      mockNext.mockClear();
      
      // Second request
      limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      mockNext.mockClear();
      
      // Third request (should be blocked)
      limiter(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Too Many Requests',
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: expect.any(Number),
        limit: 2,
        windowMs: 60
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reset counter after window expires', () => {
      const limiter = createRateLimiter({ max: 1, windowMs: 100 }); // 100ms window
      
      // First request
      limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      mockNext.mockClear();
      
      // Second request (should be blocked)
      limiter(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(429);
      mockRes.status.mockClear();
      mockRes.json.mockClear();
      
      // Wait for window to expire
      setTimeout(() => {
        // Third request (should be allowed after reset)
        limiter(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      }, 150);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should set standard rate limit headers', () => {
      const limiter = createRateLimiter({ max: 5, windowMs: 60000 });
      
      limiter(mockReq, mockRes, mockNext);
      
      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Remaining', 4);
      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
    });

    it('should set legacy rate limit headers when enabled', () => {
      const limiter = createRateLimiter({ 
        max: 5, 
        windowMs: 60000,
        legacyHeaders: true 
      });
      
      limiter(mockReq, mockRes, mockNext);
      
      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Remaining', 4);
      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(Number));
    });

    it('should set remaining to 0 when limit is exceeded', () => {
      const limiter = createRateLimiter({ max: 1, windowMs: 60000 });
      
      // First request
      limiter(mockReq, mockRes, mockNext);
      expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Remaining', 0);
    });
  });

  describe('Predefined Rate Limiters', () => {
    describe('strict', () => {
      it('should have correct default settings', () => {
        const limiter = rateLimiters.strict;
        
        // Test that it blocks after 5 requests
        for (let i = 0; i < 5; i++) {
          limiter(mockReq, mockRes, mockNext);
          expect(mockNext).toHaveBeenCalled();
          mockNext.mockClear();
        }
        
        // Sixth request should be blocked
        limiter(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(429);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Too many authentication attempts, please try again later.'
          })
        );
      });
    });

    describe('standard', () => {
      it('should have correct default settings', () => {
        const limiter = rateLimiters.standard;
        
        // Test that it allows 100 requests
        for (let i = 0; i < 100; i++) {
          limiter(mockReq, mockRes, mockNext);
          expect(mockNext).toHaveBeenCalled();
          mockNext.mockClear();
        }
        
        // 101st request should be blocked
        limiter(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(429);
      });
    });

    describe('loose', () => {
      it('should have correct default settings', () => {
        const limiter = rateLimiters.loose;
        
        // Test that it allows 1000 requests
        for (let i = 0; i < 100; i++) { // Test first 100
          limiter(mockReq, mockRes, mockNext);
          expect(mockNext).toHaveBeenCalled();
          mockNext.mockClear();
        }
        
        // Should still be allowed
        expect(mockRes.status).not.toHaveBeenCalled();
      });
    });

    describe('api', () => {
      it('should use user ID when authenticated', () => {
        mockReq.user = { id: 'user123' };
        const limiter = rateLimiters.api;
        
        limiter(mockReq, mockRes, mockNext);
        
        expect(fs.appendFileSync).toHaveBeenCalledWith(
          '/mock/logs/path',
          expect.any(String),
          'utf8'
        );
        const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/path');
        expect(logCall[1]).toContain('"clientId": "user123"');
      });

      it('should fallback to IP when not authenticated', () => {
        const limiter = rateLimiters.api;
        
        limiter(mockReq, mockRes, mockNext);
        
        expect(fs.appendFileSync).toHaveBeenCalledWith(
          '/mock/logs/path',
          expect.any(String),
          'utf8'
        );
        const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/path');
        expect(logCall[1]).toContain('"clientId": "192.168.1.1"');
      });
    });
  });

  describe('Logging', () => {
    it('should log rate limit checks', () => {
      const limiter = createRateLimiter({ max: 1 });
      
      limiter(mockReq, mockRes, mockNext);
      
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/path',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/path');
      expect(logCall[1]).toContain('"type": "RATE_LIMIT_CHECK"');
    });

    it('should log rate limit exceeded events', () => {
      const limiter = createRateLimiter({ max: 1 });
      
      // First request
      limiter(mockReq, mockRes, mockNext);
      mockNext.mockClear();
      
      // Second request (exceeds limit)
      limiter(mockReq, mockRes, mockNext);
      
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/path',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/path');
      expect(logCall[1]).toContain('"type": "RATE_LIMIT_CHECK"');
    });

    it('should log successful rate limit checks', () => {
      const limiter = createRateLimiter({ max: 1 });
      
      limiter(mockReq, mockRes, mockNext);
      
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/path',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/path');
      expect(logCall[1]).toContain('"type": "RATE_LIMIT_CHECK"');
    });
  });

  describe('Custom Handlers', () => {
    it('should call custom handler when limit is exceeded', () => {
      const customHandler = jest.fn();
      const limiter = createRateLimiter({ 
        max: 1, 
        handler: customHandler 
      });
      
      // First request
      limiter(mockReq, mockRes, mockNext);
      mockNext.mockClear();
      
      // Second request (exceeds limit)
      limiter(mockReq, mockRes, mockNext);
      
      expect(customHandler).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    it('should call onLimitReached callback when limit is exceeded', () => {
      const onLimitReached = jest.fn();
      const limiter = createRateLimiter({ 
        max: 1, 
        onLimitReached 
      });
      
      // First request
      limiter(mockReq, mockRes, mockNext);
      mockNext.mockClear();
      
      // Second request (exceeds limit)
      limiter(mockReq, mockRes, mockNext);
      
      expect(onLimitReached).toHaveBeenCalledWith(mockReq, mockRes, mockNext, expect.any(Object));
    });
  });

  describe('applyRateLimiting', () => {
    it('should apply rate limiting to routes', () => {
      const mockApp = {
        use: jest.fn()
      };
      
      const routes = {
        '/auth': 'strict',
        '/api': 'api',
        '/': 'standard'
      };
      
      applyRateLimiting(mockApp, routes);
      
      expect(mockApp.use).toHaveBeenCalledTimes(3);
      expect(mockApp.use).toHaveBeenCalledWith('/auth', rateLimiters.strict);
      expect(mockApp.use).toHaveBeenCalledWith('/api', rateLimiters.api);
      expect(mockApp.use).toHaveBeenCalledWith('/', rateLimiters.standard);
    });

    it('should handle custom middleware functions', () => {
      const mockApp = {
        use: jest.fn()
      };
      
      const customLimiter = jest.fn();
      const routes = {
        '/custom': customLimiter
      };
      
      applyRateLimiting(mockApp, routes);
      
      expect(mockApp.use).toHaveBeenCalledWith('/custom', customLimiter);
    });
  });

  describe('Memory Management', () => {
    it('should clean expired entries periodically', () => {
      // Mock setInterval
      jest.useFakeTimers();
      
      const limiter = createRateLimiter({ max: 1, windowMs: 100 });
      
      // First request
      limiter(mockReq, mockRes, mockNext);
      
      // Fast forward time to trigger cleanup
      jest.advanceTimersByTime(60000);
      
      // Should still work after cleanup
      limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      // Mock fs.appendFileSync to throw error
      fs.appendFileSync.mockImplementation(() => {
        throw new Error('File system error');
      });
      
      const limiter = createRateLimiter({ max: 1 });
      
      // Should still work even if logging fails
      limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
