# Kizuna Travel OS - ERP API

A comprehensive, enterprise-grade ERP API for travel management systems built with Node.js, Express, and MongoDB.

## 🏗️ Architecture Overview

### Role-Based Access Control (RBAC)
The system implements a hierarchical role-based access control system:

```
Admin (5) > Manager (4) > Agent (3) > Guide (2) > Customer (1)
```

- **Admin**: Full system access, user management, system monitoring
- **Manager**: Elevated permissions, full business operations
- **Agent**: Internal staff, customer management, booking operations
- **Guide**: External staff, journey management, limited access
- **Customer**: End users, booking management, profile access

### Core Components

#### Models
- **User**: Authentication, roles, status management
- **Profile**: User details, contact info, role-specific data
- **Meta**: Audit trail, soft delete, timestamps
- **Booking**: Travel reservations and management
- **Journey**: Travel packages and itineraries
- **Provider**: Service providers and partners

#### Middleware
- **Auth**: JWT-based authentication
- **Authorize**: Role-based authorization with hierarchy support
- **CanAccessOwnData**: Data ownership validation
- **Rate Limiter**: API abuse prevention
- **Validation**: Input sanitization and validation
- **Logger**: Comprehensive logging and monitoring

#### Routes
- **`/admin/*`**: System administration endpoints
- **`/manager/*`**: Management operations
- **`/agent/*`**: Agent operations
- **`/guide/*`**: Guide operations
- **`/customer/*`**: Customer operations
- **`/profile/*`**: Shared profile management
- **`/`**: Public and anonymous endpoints

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** (LTS version recommended)
- **MongoDB 6+** (with MongoDB driver support)
- **Redis 6+** (optional, for session management)
- **Yarn** (recommended) or **npm**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KizunaTravelOS/apps/erp-api
   ```

2. **Verify Node.js version**
   ```bash
   node --version  # Must be v20.0.0 or higher
   yarn --version  # Must be installed
   ```

3. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Ensure MongoDB is running
   # The API will auto-create collections on first use
   ```

5. **Start the server**
   ```bash
   # Development
   yarn dev
   
   # Production
   yarn start
   ```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/kizuna_travel_os

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Redis (optional)
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false
```

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication with configurable expiration
- Role-based access control with hierarchy support
- Session management with Redis (optional)
- Two-factor authentication support

### API Security
- Rate limiting and brute force protection
- Input validation and sanitization
- XSS and CSRF protection
- NoSQL injection prevention
- Secure HTTP headers (Helmet)

### Data Protection
- Password hashing with bcrypt
- Soft delete for data recovery
- Audit logging for compliance
- GDPR compliance features
- Data encryption at rest (MongoDB)

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

### User Management
- `GET /admin/users` - List all users (Admin)
- `GET /admin/users/:id` - Get user details (Admin)
- `PUT /admin/users/:id` - Update user (Admin)
- `DELETE /admin/users/:id` - Delete user (Admin)

### Profile Management
- `GET /profile/me` - Get own profile
- `PUT /profile/me` - Update own profile
- `GET /admin/profiles` - List all profiles (Admin/Manager)

### Booking Management
- `GET /customer/bookings` - Customer's bookings
- `POST /customer/bookings` - Create booking
- `GET /agent/bookings` - All bookings (Agent)
- `PUT /agent/bookings/:id` - Update booking (Agent)

### Journey Management
- `GET /customer/journeys` - Available journeys
- `GET /guide/journeys` - Assigned journeys (Guide)
- `POST /manager/journeys` - Create journey (Manager)

## 🧪 Testing

### Run Tests
```bash
# All tests
yarn test

# Tests with coverage
yarn test:coverage

# Watch mode
yarn test:watch

# Specific test file
yarn test -- --testPathPattern=user.test.js
```

### Test Structure
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Middleware Tests**: Authentication and authorization
- **Model Tests**: Database operations

## 📈 Monitoring & Logging

### Logging
- Winston-based logging with daily rotation
- Structured logging in JSON format
- Different log levels per environment
- Audit trail for security events

### Health Checks
- Database connectivity monitoring
- Redis status (if enabled)
- External service health
- System resource monitoring

### Error Tracking
- Sentry integration for production
- Comprehensive error logging
- Stack trace preservation (development)
- User context in error reports

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t kizuna-erp-api .

# Run container
docker run -p 3000:3000 kizuna-erp-api
```

### Production Considerations
- Use environment-specific configurations
- Enable Redis for session management
- Configure proper CORS origins
- Set up monitoring and alerting
- Enable HTTPS with proper certificates
- Configure backup strategies

## 🔧 Development

### Code Style
- ESLint configuration
- Prettier formatting
- Consistent naming conventions
- Comprehensive JSDoc comments

### Git Hooks
- Pre-commit linting
- Test execution before push
- Commit message validation

### API Documentation
- OpenAPI/Swagger specification
- Interactive API explorer
- Request/response examples
- Authentication documentation

## 📚 Additional Resources

### Configuration Files
- `configs/config.js` - Main configuration
- `configs/db.js` - Database configuration
- `configs/security.js` - Security settings
- `configs/roles.js` - RBAC configuration

### Middleware
- `middlewares/auth.js` - Authentication
- `middlewares/authorize.js` - Authorization
- `middlewares/validation.js` - Input validation
- `middlewares/logger.js` - Logging

### Utilities
- `utils/gdpr.js` - GDPR compliance
- `utils/securityMonitor.js` - Security monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test examples
- Contact the development team

---

**Note**: This is an enterprise-grade API. Ensure proper security measures are in place before deploying to production environments.
