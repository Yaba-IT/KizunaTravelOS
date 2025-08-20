/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/middlewares/__test__/logger.test.js - Logging middleware tests
* Tests request logging and log file management functionality
*
* coded by farid212@Yaba-IT!
*/

const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const {
  requestLogger,
  responseLogger,
  errorLogger,
  performanceLogger,
  securityLogger,
  applyAllLogging
} = require('../logger.js');

// Mock fs module
jest.mock('fs');
jest.mock('path');

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {})
};

describe('Logger Middleware', () => {
  let app;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    app = express();
    mockReq = {
      method: 'GET',
      url: '/test',
      path: '/test',
      query: {},
      params: {},
      headers: {
        'user-agent': 'Mozilla/5.0 (Test Browser)',
        'accept': 'application/json',
        'x-forwarded-for': '192.168.1.1',
        'accept-language': 'en-US,en;q=0.9',
        'x-timezone': 'UTC'
      },
      body: {},
      ip: '192.168.1.1',
      connection: { remoteAddress: '192.168.1.1' }
    };
    mockRes = {
      statusCode: 200,
      statusMessage: 'OK',
      get: jest.fn().mockReturnValue('1024'),
      on: jest.fn(),
      json: jest.fn(),
      send: jest.fn()
    };
    mockNext = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockImplementation(() => {});
    fs.appendFileSync.mockImplementation(() => {});
    // Mock path.join to return different paths for different files
    path.join.mockImplementation((...args) => {
      if (args.includes('requests.log')) return '/mock/logs/requests.log';
      if (args.includes('responses.log')) return '/mock/logs/responses.log';
      if (args.includes('errors.log')) return '/mock/logs/errors.log';
      if (args.includes('performance.log')) return '/mock/logs/performance.log';
      if (args.includes('security.log')) return '/mock/logs/security.log';
      return '/mock/logs/path';
    });
  });

  afterEach(() => {
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
    consoleSpy.warn.mockClear();
  });

  describe('requestLogger', () => {
    it('should log request details and store start time', () => {
      const originalJson = mockRes.json;
      const originalSend = mockRes.send;
      
      requestLogger(mockReq, mockRes, mockNext);

      expect(mockReq.startTime).toBeDefined();
      expect(typeof mockReq.startTime).toBe('number');
      expect(mockNext).toHaveBeenCalled();
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/requests.log',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/requests.log');
      expect(logCall[1]).toContain('"type": "REQUEST"');
    });

    it('should capture request headers and body', () => {
      requestLogger(mockReq, mockRes, mockNext);

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/requests.log',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/requests.log');
      expect(logCall[1]).toContain('"user-agent": "Mozilla/5.0 (Test Browser)"');
      expect(logCall[1]).toContain('"ip": "192.168.1.1"');
    });

    it('should redact authorization header', () => {
      mockReq.headers.authorization = 'Bearer secret-token';
      
      requestLogger(mockReq, mockRes, mockNext);

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/requests.log',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/requests.log');
      expect(logCall[1]).toContain('"authorization": "[REDACTED]"');
    });
  });

  describe('responseLogger', () => {
    it('should log response details when response finishes', () => {
      const mockEventEmitter = {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            callback();
          }
        })
      };
      mockRes.on = mockEventEmitter.on;
      mockReq.startTime = Date.now() - 100; // Simulate request start time

      responseLogger(mockReq, mockRes, mockNext);

      expect(mockEventEmitter.on).toHaveBeenCalledWith('finish', expect.any(Function));
      expect(mockNext).toHaveBeenCalled();
    });

    it('should calculate and log response duration', () => {
      const mockEventEmitter = {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            callback();
          }
        })
      };
      mockRes.on = mockEventEmitter.on;
      mockReq.startTime = Date.now() - 150; // 150ms ago

      responseLogger(mockReq, mockRes, mockNext);

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/responses.log',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/responses.log');
      expect(logCall[1]).toContain('"duration": "150ms"');
    });
  });

  describe('errorLogger', () => {
    it('should log error details', () => {
      const mockError = new Error('Test error');
      mockError.stack = 'Error: Test error\n    at test.js:1:1';

      errorLogger(mockError, mockReq, mockRes, mockNext);

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/errors.log',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/errors.log');
      expect(logCall[1]).toContain('"type": "ERROR"');
      expect(logCall[1]).toContain('"message": "Test error"');
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('performanceLogger', () => {
    it('should log performance data when response finishes', () => {
      const mockEventEmitter = {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            callback();
          }
        })
      };
      mockRes.on = mockEventEmitter.on;

      performanceLogger(mockReq, mockRes, mockNext);

      expect(mockEventEmitter.on).toHaveBeenCalledWith('finish', expect.any(Function));
      expect(mockNext).toHaveBeenCalled();
    });

    it('should log slow requests separately', () => {
      const mockEventEmitter = {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            // Simulate slow response
            setTimeout(callback, 1100);
          }
        })
      };
      mockRes.on = mockEventEmitter.on;

      performanceLogger(mockReq, mockRes, mockNext);

      // Wait for the timeout
      setTimeout(() => {
        expect(fs.appendFileSync).toHaveBeenCalledWith(
          '/mock/logs/performance.log',
          expect.any(String),
          'utf8'
        );
        const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/performance.log');
        expect(logCall[1]).toContain('"type": "PERFORMANCE"');
      }, 1200);
    });
  });

  describe('securityLogger', () => {
    it('should log security data for all requests', () => {
      securityLogger(mockReq, mockRes, mockNext);

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/security.log',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/security.log');
      expect(logCall[1]).toContain('"type": "SECURITY"');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should detect and log suspicious patterns', () => {
      mockReq.url = '/test/../../../etc/passwd';
      
      securityLogger(mockReq, mockRes, mockNext);

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/security.log',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/security.log');
      expect(logCall[1]).toContain('"suspicious": true');
    });

    it('should detect XSS attempts', () => {
      mockReq.body = { input: '<script>alert("xss")</script>' };
      
      securityLogger(mockReq, mockRes, mockNext);

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        '/mock/logs/security.log',
        expect.any(String),
        'utf8'
      );
      const logCall = fs.appendFileSync.mock.calls.find(call => call[0] === '/mock/logs/security.log');
      expect(logCall[1]).toContain('"suspicious": true');
    });
  });

  describe('applyAllLogging', () => {
    it('should apply all logging middleware to the app', () => {
      const mockApp = {
        use: jest.fn()
      };

      applyAllLogging(mockApp);

      expect(mockApp.use).toHaveBeenCalledTimes(5);
      expect(mockApp.use).toHaveBeenCalledWith(requestLogger);
      expect(mockApp.use).toHaveBeenCalledWith(responseLogger);
      expect(mockApp.use).toHaveBeenCalledWith(performanceLogger);
      expect(mockApp.use).toHaveBeenCalledWith(securityLogger);
      expect(mockApp.use).toHaveBeenCalledWith(errorLogger);
    });
  });

  describe('Integration', () => {
    it('should work together in a real Express app', (done) => {
      app.use(requestLogger);
      app.use(responseLogger);
      app.use(performanceLogger);
      app.use(securityLogger);
      app.use(errorLogger);

      app.get('/test', (req, res) => {
        res.status(200).json({ message: 'success' });
      });

      request(app)
        .get('/test')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          
          // Wait a bit for async logging
          setTimeout(() => {
            expect(fs.appendFileSync).toHaveBeenCalled();
            done();
          }, 100);
        });
    });
  });
});
