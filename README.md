# KizunaTravelOS 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-green.svg)](https://www.mongodb.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

**KizunaTravelOS** is a comprehensive, enterprise-grade open-source ERP system designed specifically for travel agencies. Built with modern microservices architecture, it provides complete business management capabilities including client management, booking systems, supplier management, and accounting.

## 🌟 Features

### 🏢 **Core Business Management**
- **Client Management**: Complete customer profiles, preferences, and history
- **Booking System**: Advanced reservation management with real-time availability
- **Supplier Management**: Partner and service provider relationship management
- **Financial Management**: Integrated accounting and invoicing system
- **Journey Planning**: Comprehensive travel package creation and management

### 🔐 **Security & Compliance**
- **Role-Based Access Control (RBAC)**: Hierarchical permission system
- **GDPR Compliance**: Built-in data protection and privacy features
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API abuse prevention and protection
- **Audit Logging**: Complete activity tracking for compliance

### 🏗️ **Modern Architecture**
- **Microservices**: Scalable, maintainable service architecture
- **Containerized**: Docker-ready for easy deployment
- **Multi-Database**: MongoDB for ERP, PostgreSQL for accounting
- **Real-time**: WebSocket support for live updates
- **API-First**: RESTful APIs with comprehensive documentation

### 📱 **User Experience**
- **Responsive Web Interface**: Modern React-based frontend
- **Multi-language Support**: Internationalization ready
- **Role-specific Dashboards**: Tailored interfaces for different user types
- **Mobile-Friendly**: Optimized for all device types

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   ERP API       │    │  Accounting SVC │
│   (React/Vite)  │◄──►│   (Node.js)     │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx/Proxy   │    │   MongoDB       │    │   PostgreSQL    │
│   (Static)      │    │   (ERP Data)    │    │   (Accounting)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Service Components**

| Service | Technology | Purpose | Port |
|---------|------------|---------|------|
| **Web Frontend** | React 19 + Vite | User interface | 5173 |
| **ERP API** | Node.js + Express | Core business logic | 4000 |
| **Accounting Service** | Node.js + TypeORM | Financial management | 4100 |
| **MongoDB** | Database | ERP data storage | 27017 |
| **PostgreSQL** | Database | Accounting data | 5432 |
| **Redis** | Cache/Sessions | Session management | 6379 |

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** (LTS version recommended)
- **Docker & Docker Compose**
- **Git**
- **Yarn** (recommended) or **npm**

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/KizunaTravelOS.git
   cd KizunaTravelOS
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - **Web Interface**: http://localhost:5173
   - **ERP API**: http://localhost:4000
   - **Accounting Service**: http://localhost:4100
   - **MongoDB**: localhost:27017
   - **PostgreSQL**: localhost:5432

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Setup environment variables**
   ```bash
   # Copy environment templates
   cp apps/erp-api/env.template apps/erp-api/.env
   cp apps/accounting-svc/env.template apps/accounting-svc/.env
   cp apps/web/env.template apps/web/.env
   
   # Edit with your configuration
   ```

3. **Start databases**
   ```bash
   docker-compose up mongo postgres redis -d
   ```

4. **Start services**
   ```bash
   # Terminal 1: ERP API
   cd apps/erp-api && yarn dev
   
   # Terminal 2: Accounting Service
   cd apps/accounting-svc && yarn dev
   
   # Terminal 3: Web Frontend
   cd apps/web && yarn dev
   ```

## 🔐 User Roles & Permissions

The system implements a hierarchical role-based access control:

```
Admin (5) > Manager (4) > Agent (3) > Guide (2) > Customer (1)
```

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Admin** | Full system access, user management, monitoring | System administrators |
| **Manager** | Business operations, reporting, staff management | Travel agency managers |
| **Agent** | Customer management, booking operations | Internal staff |
| **Guide** | Journey management, limited access | External guides |
| **Customer** | Own bookings, profile management | End users |

## 📊 API Documentation

### Core Endpoints

#### Authentication
```http
POST /auth/register    # User registration
POST /auth/login       # User authentication
POST /auth/refresh     # Token refresh
POST /auth/logout      # User logout
```

#### User Management
```http
GET    /admin/users    # List all users (Admin)
GET    /admin/users/:id # Get user details (Admin)
PUT    /admin/users/:id # Update user (Admin)
DELETE /admin/users/:id # Delete user (Admin)
```

#### Booking Management
```http
GET  /customer/bookings     # Customer's bookings
POST /customer/bookings     # Create booking
GET  /agent/bookings        # All bookings (Agent)
PUT  /agent/bookings/:id    # Update booking (Agent)
```

#### Journey Management
```http
GET  /customer/journeys     # Available journeys
GET  /guide/journeys        # Assigned journeys (Guide)
POST /manager/journeys      # Create journey (Manager)
```

## 🧪 Testing

### Run Tests
```bash
# All services
yarn test

# Specific service
cd apps/erp-api && yarn test
cd apps/web && yarn test

# With coverage
yarn test:coverage

# Watch mode
yarn test:watch
```

### Test Coverage
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Component Tests**: React component testing
- **E2E Tests**: Full user journey testing

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Production environment
   cp compose/compose.prod.yml docker-compose.override.yml
   ```

2. **Build and Deploy**
   ```bash
   docker-compose -f docker-compose.yml -f compose/compose.prod.yml up -d
   ```

3. **Health Checks**
   ```bash
   # Check service health
   curl http://localhost:4000/health
   curl http://localhost:4100/health
   ```

### Kubernetes Deployment

The project includes Kubernetes manifests for production deployment:

```bash
# Apply Kubernetes configurations
kubectl apply -f infra/k8s/
```

## 🔧 Development

### Project Structure
```
KizunaTravelOS/
├── apps/
│   ├── web/                 # React frontend
│   ├── erp-api/            # Core ERP API
│   └── accounting-svc/     # Accounting service
├── compose/                # Docker Compose configurations
├── infra/                  # Infrastructure configurations
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

### Development Workflow

1. **Code Style**
   ```bash
   # Lint code
   yarn lint
   
   # Format code
   yarn format
   ```

2. **Git Hooks**
   - Pre-commit linting
   - Test execution
   - Commit message validation

3. **Environment Management**
   ```bash
   # Development
   docker-compose -f compose/compose.dev.yml up
   
   # Staging
   docker-compose -f compose/compose.stg.yml up
   
   # Production
   docker-compose -f compose/compose.prod.yml up
   ```

## 📈 Monitoring & Logging

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Log Rotation**: Daily rotation with compression
- **Log Levels**: Environment-specific logging levels
- **Audit Trail**: Complete activity tracking

### Health Monitoring
- **Service Health**: Endpoint health checks
- **Database Connectivity**: Connection monitoring
- **Performance Metrics**: Response time tracking
- **Error Tracking**: Sentry integration

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests for new functionality**
5. **Ensure all tests pass**
   ```bash
   yarn test
   ```
6. **Submit a pull request**

### Development Guidelines
- Follow the existing code style
- Add comprehensive tests
- Update documentation
- Use conventional commit messages

## 📚 Documentation

- **[API Documentation](./docs/api.md)**: Complete API reference
- **[Deployment Guide](./docs/deployment.md)**: Production deployment
- **[Development Guide](./docs/development.md)**: Development setup
- **[Architecture Guide](./docs/architecture.md)**: System architecture

## 🆘 Support

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/your-org/KizunaTravelOS/issues)
- **Documentation**: Check the `/docs` directory
- **Community**: Join our community discussions

### Common Issues
- **Port conflicts**: Ensure ports 4000, 4100, 5173 are available
- **Database connection**: Verify MongoDB and PostgreSQL are running
- **Environment variables**: Check all required env vars are set

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

KizunaTravelOS is provided **"as is" without warranty of any kind**. Users are responsible for:
- Legal compliance (GDPR, accounting obligations, etc.)
- Security of their deployment
- Data backup and recovery
- Performance optimization

## 🙏 Acknowledgments

- **Contributors**: All contributors who have helped shape this project
- **Open Source**: Built on the shoulders of amazing open-source projects
- **Community**: The travel industry community for feedback and support

---

**Made with ❤️ by the KizunaTravelOS Team**

*Empowering travel agencies with modern, scalable technology*
