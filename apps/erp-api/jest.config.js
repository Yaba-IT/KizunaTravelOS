/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/jest.config.js - Jest configuration
* Implements enterprise testing best practices
*
* coded by farid212@Yaba-IT!
*/

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/*.test.js'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],
  
  // Collect coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/test-utils/**',
    '!src/**/__tests__/**',
    '!src/config/**',
    '!src/middlewares/testAuth.js'
  ],
  
  // Coverage thresholds (enterprise standards)
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 60,
      functions: 50,
      lines: 50
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Test timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Coverage path mapping
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test-utils/',
    '/__tests__/',
    '/config/'
  ],
  
  // Test environment variables
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // CI-specific settings
  ...(process.env.CI && {
    maxWorkers: 1,
    forceExit: true,
    detectOpenHandles: true
  }),
  
  // Error on coverage threshold failure
  errorOnDeprecated: true,
  
  // Coverage provider
  coverageProvider: 'v8',
  
  // Test location
  testLocationInResults: true
};
