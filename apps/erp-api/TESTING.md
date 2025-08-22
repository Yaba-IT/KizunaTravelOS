# Testing Strategy & Best Practices

## Overview

This document outlines the testing strategy and best practices implemented in the KizunaTravelOS ERP API project. We follow enterprise-grade testing standards to ensure code quality, reliability, and maintainability.

## Testing Philosophy

### What We Test (Unit Tests)
- ✅ **Business Logic**: Complex calculations, validation rules
- ✅ **Service Layer**: Business operations, data transformations
- ✅ **Model Methods**: Custom instance/static methods
- ✅ **Utility Functions**: Pure functions, helpers
- ✅ **Error Handling**: Custom error scenarios
- ✅ **Controller Logic**: Request/response handling

### What We DON'T Test (Integration/E2E Tests)
- ❌ **Framework Code**: Express routes, middleware
- ❌ **Database Connections**: Connection setup/teardown
- ❌ **External APIs**: Third-party service calls
- ❌ **File System**: File I/O operations
- ❌ **Configuration**: Environment variables, config loading

## Test Structure

### File Organization
```
src/
├── controllers/
│   ├── user.js
│   └── __tests__/
│       └── user.test.js
├── models/
│   ├── User.js
│   └── __tests__/
│       └── user.model.test.js
├── services/
│   ├── userService.js
│   └── __tests__/
│       └── userService.test.js
└── test-utils/
    ├── factories.js
    └── setup.js
```

### Test File Naming
- Unit tests: `*.test.js`
- Integration tests: `*.integration.test.js`
- E2E tests: `*.e2e.test.js`

## Test Utilities

### Factories (`src/test-utils/factories.js`)
Provides reusable test data creation utilities:

```javascript
const { 
  createTestUserData, 
  createUserWithProfile,
  createMockRequest, 
  createMockResponse 
} = require('../../test-utils/factories');

// Create test data with overrides
const userData = createTestUserData({ 
  email: 'custom@example.com' 
});

// Create user with linked profile
const { user, profile } = await createUserWithProfile(userData);

// Create mock request/response
const req = createMockRequest({ body: userData });
const res = createMockResponse();
```

### Setup (`src/test-utils/setup.js`)
Handles database setup and teardown:

```javascript
const { createTestHooks } = require('../../test-utils/setup');

// Apply test hooks
const { beforeAll, afterAll, beforeEach, afterEach } = createTestHooks();
```

## Testing Patterns

### AAA Pattern (Arrange-Act-Assert)
```javascript
describe('UserService.createUser', () => {
  it('should create user successfully', async () => {
    // Arrange - Set up test data and mocks
    const userData = createTestUserData();
    const mockUser = new User(userData);
    jest.spyOn(User, 'create').mockResolvedValue(mockUser);

    // Act - Execute the function being tested
    const result = await userService.createUser(userData);

    // Assert - Verify the expected outcome
    expect(result).toBeDefined();
    expect(result.email).toBe(userData.email);
    expect(User.create).toHaveBeenCalledWith(userData);
  });
});
```

### Test Documentation
```javascript
/**
 * @test Creates new user
 * @scenario Valid user data provided
 * @expected User created successfully with hashed password
 */
describe('createUser', () => {
  it('should create user with valid data', async () => {
    // Test implementation
  });
});
```

## Mocking Strategy

### External Dependencies
```javascript
// ✅ Good - Mock external dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models/User');

// ❌ Bad - Don't mock what you're testing
jest.mock('../services/userService');
```

### Mock Implementation
```javascript
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('mocked-salt'),
  hash: jest.fn().mockResolvedValue('SecurePass123!'),
  compare: jest.fn().mockImplementation((password, hash) => {
    return Promise.resolve(password === 'SecurePass123!' && hash === 'SecurePass123!');
  })
}));
```

## Database Testing

### In-Memory Database
```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

### Test Data Isolation
```javascript
beforeEach(async () => {
  // Clear all collections
  await clearTestDatabase();
  
  // Create fresh test data
  const { user, profile } = await createUserWithProfile();
});
```

## Coverage Standards

### Coverage Thresholds
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 90%
- **Lines**: 80%

### Coverage Reports
```bash
# Generate coverage report
yarn test --coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

## Running Tests

### Basic Commands
```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run specific test file
yarn test user.test.js

# Run tests with coverage
yarn test --coverage

# Run only unit tests
yarn test --testNamePattern="unit"

# Run only integration tests
yarn test --testNamePattern="integration"
```

### Test Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testNamePattern='unit'",
    "test:integration": "jest --testNamePattern='integration'",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

## Best Practices

### 1. Test Independence
- Each test should be completely independent
- No shared state between tests
- Use `beforeEach` to set up fresh data

### 2. Descriptive Test Names
```javascript
// ✅ Good
it('should return 404 when user not found', async () => {});

// ❌ Bad
it('should work', async () => {});
```

### 3. Single Responsibility
```javascript
// ✅ Good - Test one thing
it('should validate email format', async () => {});
it('should validate password strength', async () => {});

// ❌ Bad - Test multiple things
it('should validate user data', async () => {});
```

### 4. Error Testing
```javascript
// Test both success and failure cases
it('should create user successfully', async () => {});
it('should throw error for duplicate email', async () => {});
it('should throw error for invalid data', async () => {});
```

### 5. Assertion Quality
```javascript
// ✅ Good - Specific assertions
expect(user.email).toBe('test@example.com');
expect(user.isActive).toBe(true);
expect(user.createdAt).toBeInstanceOf(Date);

// ❌ Bad - Vague assertions
expect(user).toBeDefined();
expect(user).toBeTruthy();
```

## Common Patterns

### Testing Controllers
```javascript
describe('UserController', () => {
  it('should handle user creation', async () => {
    // Arrange
    const userData = createTestUserData();
    const req = createMockRequest({ body: userData });
    const res = createMockResponse();

    // Act
    await userController.createUser(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: expect.objectContaining({
        email: userData.email
      })
    });
  });
});
```

### Testing Models
```javascript
describe('User Model', () => {
  it('should validate required fields', async () => {
    // Arrange
    const user = new User({});

    // Act & Assert
    await expect(user.save()).rejects.toThrow('validation failed');
  });

  it('should hash password on save', async () => {
    // Arrange
    const userData = createTestUserData();

    // Act
    const user = new User(userData);
    await user.save();

    // Assert
    expect(user.password).not.toBe(userData.password);
    expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
  });
});
```

### Testing Services
```javascript
describe('UserService', () => {
  it('should create user with profile', async () => {
    // Arrange
    const userData = createTestUserData();
    jest.spyOn(User, 'create').mockResolvedValue(new User(userData));
    jest.spyOn(Profile, 'create').mockResolvedValue(new Profile({}));

    // Act
    const result = await userService.createUserWithProfile(userData);

    // Assert
    expect(result.user).toBeDefined();
    expect(result.profile).toBeDefined();
    expect(User.create).toHaveBeenCalled();
    expect(Profile.create).toHaveBeenCalled();
  });
});
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure MongoDB is running
   - Check connection string in test environment
   - Verify MongoMemoryServer is properly configured

2. **Mock Issues**
   - Clear mocks between tests: `jest.clearAllMocks()`
   - Restore mocks: `jest.restoreAllMocks()`
   - Check mock implementation matches expected behavior

3. **Test Isolation Issues**
   - Use `beforeEach` to clean database
   - Ensure no shared state between tests
   - Check for proper cleanup in `afterEach`

4. **Coverage Issues**
   - Verify coverage thresholds are realistic
   - Check excluded files in Jest config
   - Ensure all code paths are tested

### Debugging Tests
```bash
# Run single test with verbose output
yarn test --verbose user.test.js

# Run tests with debug logging
DEBUG=* yarn test

# Run tests in debug mode
yarn test --detectOpenHandles --forceExit
```

## Continuous Integration

### CI Configuration
```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: |
    yarn install
    yarn test:ci
    yarn test:coverage
```

### Quality Gates
- All tests must pass
- Coverage must meet thresholds
- No linting errors
- No security vulnerabilities

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Node.js Testing Guide](https://nodejs.org/en/docs/guides/testing-and-debugging/)

---

*This testing strategy ensures our codebase maintains high quality, reliability, and maintainability standards.*
