# ERP API Routes Documentation

## Overview
This document describes the complete API routes structure for the Kizuna Travel ERP system, including Role-Based Access Control (RBAC), authentication requirements, request/response formats, and detailed endpoint explanations.

## Table of Contents
- [Authentication & Authorization](#authentication--authorization)
- [Route Structure](#route-structure)
- [Public Routes](#public-routes)
- [Shared Routes](#shared-routes)
- [Customer Routes](#customer-routes)
- [Guide Routes](#guide-routes)
- [Agent Routes](#agent-routes)
- [Manager Routes](#manager-routes)
- [RBAC Matrix](#rbac-matrix)
- [Request/Response Examples](#requestresponse-examples)
- [Error Handling](#error-handling)
- [Security Features](#security-features)
- [Development Notes](#development-notes)

## Authentication & Authorization

### Middleware
- **`auth`**: Verifies JWT token and sets `req.user` with user information
- **`authorize(roles)`**: Checks if user has required role(s) for endpoint access
- **`canAccessOwnData`**: Ensures users can only access their own data unless explicitly authorized

### User Roles
1. **`customer`** - Corporate clients who book journeys and manage their own bookings
2. **`guide`** - External staff who conduct tours and manage assigned journeys
3. **`agent`** - Internal staff handling daily operations, customer management, and booking operations
4. **`manager`** - Full system access and management capabilities
5. **`admin`** - System administrator with highest privileges

### JWT Token Structure
```json
{
  "userId": "user_id_here",
  "role": "customer|guide|agent|manager|admin",
  "iat": 1640995200,
  "exp": 1641081600
}
```

## Route Structure

### Base URL
```
Base URL: http://localhost:4000
API Version: v1 (implicit)
```

### Route Prefixes
- **`/`** - Public routes (no authentication)
- **`/profile`** - Shared routes for all authenticated users
- **`/customer`** - Customer-specific routes
- **`/guide`** - Guide-specific routes
- **`/agent`** - Agent-specific routes
- **`/manager`** - Manager-specific routes

## Public Routes (`/`)

No authentication required. These endpoints are accessible to all users.

### Authentication Endpoints

#### User Registration
```
POST   /auth/register
```
**Description**: Register a new user account with profile information
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "customer",
  "firstname": "John",
  "lastname": "Doe",
  "sexe": "M"
}
```
**Response**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "customer",
    "status": "pending"
  },
  "token": "jwt_token_here"
}
```

#### User Login
```
POST   /auth/login
```
**Description**: Authenticate user and receive JWT token
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response**:
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "customer",
    "status": "active"
  },
  "token": "jwt_token_here"
}
```

#### Password Reset Request
```
POST   /auth/forgot-password
```
**Description**: Request password reset email
**Request Body**:
```json
{
  "email": "user@example.com"
}
```
**Response**:
```json
{
  "message": "Password reset email sent"
}
```

#### Password Reset
```
POST   /auth/reset-password
```
**Description**: Reset password using reset token
**Request Body**:
```json
{
  "token": "reset_token_here",
  "password": "NewSecurePass123!"
}
```
**Response**:
```json
{
  "message": "Password reset successful"
}
```

#### Email Verification
```
POST   /auth/verify-email
```
**Description**: Verify email address using verification token
**Request Body**:
```json
{
  "token": "verification_token_here"
}
```
**Response**:
```json
{
  "message": "Email verified successfully"
}
```

#### Resend Verification Email
```
POST   /auth/resend-verification
```
**Description**: Resend email verification link
**Request Body**:
```json
{
  "email": "user@example.com"
}
```
**Response**:
```json
{
  "message": "Verification email sent"
}
```

### Public Journey Browsing

#### Browse Available Journeys
```
GET    /journeys
```
**Description**: Get list of available journeys for public viewing
**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by journey category
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `duration` (optional): Filter by journey duration

**Response**:
```json
{
  "journeys": [
    {
      "id": "journey_id",
      "name": "Paris Cultural Tour",
      "description": "Explore the cultural heritage of Paris",
      "price": 299.99,
      "duration": "3 days",
      "category": "culture",
      "image": "paris_tour.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Get Journey Details
```
GET    /journeys/:id
```
**Description**: Get detailed information about a specific journey
**Response**:
```json
{
  "journey": {
    "id": "journey_id",
    "name": "Paris Cultural Tour",
    "description": "Detailed description of the tour",
    "price": 299.99,
    "duration": "3 days",
    "category": "culture",
    "itinerary": ["Day 1: Louvre Museum", "Day 2: Eiffel Tower"],
    "included": ["Hotel", "Meals", "Transport"],
    "excluded": ["Flights", "Personal expenses"],
    "images": ["image1.jpg", "image2.jpg"]
  }
}
```

#### Search Journeys
```
GET    /journeys/search
```
**Description**: Search journeys with various filters
**Query Parameters**:
- `q` (required): Search query
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `duration` (optional): Duration filter
- `rating` (optional): Minimum rating

### Public Provider Information

#### List Providers
```
GET    /providers
```
**Description**: Get list of service providers (hotels, restaurants, etc.)
**Query Parameters**:
- `type` (optional): Provider type (hotel, restaurant, transport)
- `rating` (optional): Minimum rating filter
- `location` (optional): Location filter

#### Get Provider Details
```
GET    /providers/:id
```
**Description**: Get detailed information about a specific provider

### System Health Check
```
GET    /health
```
**Description**: Check system health and status
**Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": "24h 30m 15s"
}
```

## Shared Routes (`/profile`)

Available to all authenticated users. These routes provide common functionality across all user roles.

### Profile Management

#### Get Own Profile
```
GET    /profile/me
```
**Description**: Get current user's complete profile with user and profile information
**Authentication**: Required
**Response**:
```json
{
  "profile": {
    "id": "profile_id",
    "firstname": "John",
    "lastname": "Doe",
    "sexe": "M",
    "meta": {
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "created_by": "user_id",
      "updated_by": "user_id",
      "isActive": true,
      "isDeleted": false
    }
  },
  "user": {
    "id": "user_id",
    "email": "john.doe@example.com",
    "role": "customer",
    "status": "active",
    "emailVerified": true,
    "twoFactorEnabled": false
  }
}
```

#### Update Own Profile
```
PUT    /profile/me
```
**Description**: Update current user's profile information
**Authentication**: Required
**Request Body**:
```json
{
  "firstname": "John",
  "lastname": "Doe Updated",
  "sexe": "M"
}
```
**Response**:
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "profile_id",
    "firstname": "John",
    "lastname": "Doe Updated",
    "sexe": "M"
  }
}
```

### Account Management

#### Change Password
```
PUT    /account/password
```
**Description**: Change user's password
**Authentication**: Required
**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```
**Response**:
```json
{
  "message": "Password updated successfully"
}
```

#### Update Email
```
PUT    /account/email
```
**Description**: Update user's email address
**Authentication**: Required
**Request Body**:
```json
{
  "currentPassword": "Password123!",
  "newEmail": "newemail@example.com"
}
```
**Response**:
```json
{
  "message": "Email updated successfully"
}
```

### Profile with User ID (Own Data Only)

#### Get User Profile by ID
```
GET    /:userId
```
**Description**: Get user profile by user ID (own data only)
**Authentication**: Required
**Authorization**: Can only access own profile
**Response**: Same as GET /profile/me

#### Update User Profile by ID
```
PUT    /:userId
```
**Description**: Update user profile by user ID (own data only)
**Authentication**: Required
**Authorization**: Can only update own profile
**Request Body**: Same as PUT /profile/me

## Customer Routes (`/customer`)

Requires `customer` role authentication. These routes provide customer-specific functionality.

### Booking Management

#### List Own Bookings
```
GET    /bookings
```
**Description**: Get list of current user's bookings
**Authentication**: Required (customer role)
**Query Parameters**:
- `status` (optional): Filter by booking status
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Response**:
```json
{
  "bookings": [
    {
      "id": "booking_id",
      "journeyId": "journey_id",
      "journeyName": "Paris Cultural Tour",
      "date": "2024-06-15",
      "status": "confirmed",
      "totalPrice": 299.99,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

#### Get Own Booking Details
```
GET    /bookings/:id
```
**Description**: Get detailed information about a specific booking
**Authentication**: Required (customer role)
**Authorization**: Can only access own bookings

#### Create New Booking
```
POST   /bookings
```
**Description**: Create a new booking for a journey
**Authentication**: Required (customer role)
**Request Body**:
```json
{
  "journeyId": "journey_id",
  "date": "2024-06-15",
  "participants": 2,
  "specialRequests": "Vegetarian meals preferred"
}
```
**Response**:
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": "booking_id",
    "journeyId": "journey_id",
    "date": "2024-06-15",
    "status": "pending",
    "totalPrice": 599.98
  }
}
```

#### Update Own Booking
```
PUT    /bookings/:id
```
**Description**: Update booking details (date, participants, special requests)
**Authentication**: Required (customer role)
**Authorization**: Can only update own bookings

#### Cancel Own Booking
```
DELETE /bookings/:id
```
**Description**: Cancel a booking
**Authentication**: Required (customer role)
**Authorization**: Can only cancel own bookings

### Journey Browsing

#### Browse Available Journeys
```
GET    /journeys
```
**Description**: Browse available journeys with customer-specific pricing and availability
**Authentication**: Required (customer role)

#### Get Journey Details
```
GET    /journeys/:id
```
**Description**: Get detailed journey information with customer-specific pricing
**Authentication**: Required (customer role)

### Account Management

#### Deactivate Account
```
DELETE /account
```
**Description**: Deactivate customer account
**Authentication**: Required (customer role)
**Request Body**:
```json
{
  "password": "Password123!",
  "reason": "No longer interested"
}
```

## Guide Routes (`/guide`)

Requires `guide` role authentication. These routes provide guide-specific functionality.

### Journey Management

#### List Assigned Journeys
```
GET    /journeys
```
**Description**: Get list of journeys assigned to the current guide
**Authentication**: Required (guide role)
**Query Parameters**:
- `status` (optional): Filter by journey status
- `date` (optional): Filter by date

#### Get Assigned Journey Details
```
GET    /journeys/:id
```
**Description**: Get detailed information about an assigned journey
**Authentication**: Required (guide role)

#### Update Journey Status
```
PUT    /journeys/:id/status
```
**Description**: Update the status of an assigned journey
**Authentication**: Required (guide role)
**Request Body**:
```json
{
  "status": "in_progress",
  "notes": "Started the tour at 9:00 AM"
}
```

#### Add Journey Notes
```
POST   /journeys/:id/notes
```
**Description**: Add notes or observations about a journey
**Authentication**: Required (guide role)
**Request Body**:
```json
{
  "notes": "Group was very interested in local history",
  "type": "observation"
}
```

### Booking Management

#### List Assigned Bookings
```
GET    /bookings
```
**Description**: Get list of bookings for journeys assigned to the guide
**Authentication**: Required (guide role)

#### Get Assigned Booking Details
```
GET    /bookings/:id
```
**Description**: Get detailed information about an assigned booking
**Authentication**: Required (guide role)

#### Update Booking Status
```
PUT    /bookings/:id/status
```
**Description**: Update the status of a booking
**Authentication**: Required (guide role)
**Request Body**:
```json
{
  "status": "confirmed",
  "notes": "Customer confirmed attendance"
}
```

### Schedule & Availability

#### Get Personal Schedule
```
GET    /schedule
```
**Description**: Get guide's personal schedule and upcoming assignments
**Authentication**: Required (guide role)
**Query Parameters**:
- `startDate` (optional): Start date for schedule
- `endDate` (optional): End date for schedule

#### Update Availability
```
PUT    /availability
```
**Description**: Update guide's availability and working hours
**Authentication**: Required (guide role)
**Request Body**:
```json
{
  "available": true,
  "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "workingHours": {
    "start": "09:00",
    "end": "17:00"
  },
  "unavailableDates": ["2024-12-25", "2024-12-26"]
}
```

## Agent Routes (`/agent`)

Requires `agent` role authentication. These routes provide agent-specific functionality for managing customers, bookings, and operations.

### Customer Management

#### List Customers
```
GET    /customers
```
**Description**: Get list of all customers in the system
**Authentication**: Required (agent role)
**Query Parameters**:
- `status` (optional): Filter by customer status
- `role` (optional): Filter by customer role
- `search` (optional): Search by name or email
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

#### Get Customer Details
```
GET    /customers/:id
```
**Description**: Get detailed information about a specific customer
**Authentication**: Required (agent role)

#### Update Customer
```
PUT    /customers/:id
```
**Description**: Update customer information
**Authentication**: Required (agent role)
**Request Body**:
```json
{
  "status": "active",
  "notes": "VIP customer, provide priority service"
}
```

#### Update Customer Status
```
POST   /customers/:id/status
```
**Description**: Update customer account status
**Authentication**: Required (agent role)
**Request Body**:
```json
{
  "status": "suspended",
  "reason": "Payment overdue"
}
```

### Booking Management

#### List All Bookings
```
GET    /bookings
```
**Description**: Get list of all bookings in the system
**Authentication**: Required (agent role)
**Query Parameters**:
- `status` (optional): Filter by booking status
- `customerId` (optional): Filter by customer
- `journeyId` (optional): Filter by journey
- `date` (optional): Filter by date
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

#### Get Booking Details
```
GET    /bookings/:id
```
**Description**: Get detailed information about a specific booking
**Authentication**: Required (agent role)

#### Update Booking
```
PUT    /bookings/:id
```
**Description**: Update booking details
**Authentication**: Required (agent role)
**Request Body**:
```json
{
  "date": "2024-06-20",
  "participants": 3,
  "specialRequests": "Wheelchair accessible"
}
```

#### Update Booking Status
```
POST   /bookings/:id/status
```
**Description**: Update booking status
**Authentication**: Required (agent role)
**Request Body**:
```json
{
  "status": "confirmed",
  "notes": "Payment received, confirmed with customer"
}
```

#### Create Booking for Customer
```
POST   /bookings
```
**Description**: Create a new booking on behalf of a customer
**Authentication**: Required (agent role)
**Request Body**:
```json
{
  "customerId": "customer_id",
  "journeyId": "journey_id",
  "date": "2024-06-15",
  "participants": 2,
  "specialRequests": "Early morning departure preferred"
}
```

### Journey Management

#### List All Journeys
```
GET    /journeys
```
**Description**: Get list of all journeys in the system
**Authentication**: Required (agent role)

#### Get Journey Details
```
GET    /journeys/:id
```
**Description**: Get detailed information about a specific journey
**Authentication**: Required (agent role)

#### Update Journey
```
PUT    /journeys/:id
```
**Description**: Update journey information
**Authentication**: Required (agent role)
**Request Body**:
```json
{
  "price": 350.00,
  "description": "Updated journey description"
}
```

#### Assign Guide to Journey
```
POST   /journeys/:id/assign-guide
```
**Description**: Assign a guide to a specific journey
**Authentication**: Required (agent role)
**Request Body**:
```json
{
  "guideId": "guide_id",
  "notes": "Experienced guide with French language skills"
}
```

### Provider Management

#### List Providers
```
GET    /providers
```
**Description**: Get list of all service providers
**Authentication**: Required (agent role)

#### Get Provider Details
```
GET    /providers/:id
```
**Description**: Get detailed information about a specific provider
**Authentication**: Required (agent role)

#### Update Provider
```
PUT    /providers/:id
```
**Description**: Update provider information
**Authentication**: Required (agent role)
**Request Body**:
```json
{
  "name": "Updated Hotel Name",
  "contact": "new_contact@hotel.com"
}
```

## Manager Routes (`/manager`)

Requires `manager` role authentication. These routes provide full system access and management capabilities.

### User Management (Full Access)

#### List All Users
```
GET    /users
```
**Description**: Get list of all users in the system
**Authentication**: Required (manager role)
**Query Parameters**:
- `role` (optional): Filter by user role
- `status` (optional): Filter by user status
- `search` (optional): Search by email or role
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

#### Get User Details
```
GET    /users/:id
```
**Description**: Get detailed information about a specific user
**Authentication**: Required (manager role)

#### Create New User
```
POST   /users
```
**Description**: Create a new user account
**Authentication**: Required (manager role)
**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "role": "agent",
  "firstname": "Jane",
  "lastname": "Smith",
  "sexe": "F"
}
```

#### Update User
```
PUT    /users/:id
```
**Description**: Update user information
**Authentication**: Required (manager role)
**Request Body**:
```json
{
  "email": "updated@example.com",
  "status": "active"
}
```

#### Delete User
```
DELETE /users/:id
```
**Description**: Delete a user account
**Authentication**: Required (manager role)

#### Update User Status
```
POST   /users/:id/status
```
**Description**: Update user account status
**Authentication**: Required (manager role)
**Request Body**:
```json
{
  "status": "suspended",
  "reason": "Policy violation"
}
```

#### Update User Role
```
POST   /users/:id/role
```
**Description**: Update user role
**Authentication**: Required (manager role)
**Request Body**:
```json
{
  "role": "guide",
  "reason": "Promotion to guide role"
}
```

### Profile Management (Full Access)

#### List All Profiles
```
GET    /profiles
```
**Description**: Get list of all user profiles
**Authentication**: Required (manager role)

#### Get Profile Details
```
GET    /profiles/:id
```
**Description**: Get detailed information about a specific profile
**Authentication**: Required (manager role)

#### Update Profile
```
PUT    /profiles/:id
```
**Description**: Update profile information
**Authentication**: Required (manager role)

#### Delete Profile
```
DELETE /profiles/:id
```
**Description**: Delete a user profile
**Authentication**: Required (manager role)

#### Restore Deleted Profile
```
POST   /profiles/:id/restore
```
**Description**: Restore a previously deleted profile
**Authentication**: Required (manager role)

#### Get Profile Statistics
```
GET    /profiles/stats
```
**Description**: Get profile statistics and analytics
**Authentication**: Required (manager role)
**Response**:
```json
{
  "stats": {
    "total": 150,
    "deleted": 5,
    "recent": 12,
    "bySexe": [
      { "sexe": "M", "count": 80 },
      { "sexe": "F", "count": 65 },
      { "sexe": "X", "count": 5 }
    ]
  }
}
```

### Booking Management (Full Access)

#### List All Bookings
```
GET    /bookings
```
**Description**: Get list of all bookings in the system
**Authentication**: Required (manager role)

#### Get Booking Details
```
GET    /bookings/:id
```
**Description**: Get detailed information about a specific booking
**Authentication**: Required (manager role)

#### Create Booking
```
POST   /bookings
```
**Description**: Create a new booking
**Authentication**: Required (manager role)

#### Update Booking
```
PUT    /bookings/:id
```
**Description**: Update booking information
**Authentication**: Required (manager role)

#### Delete Booking
```
DELETE /bookings/:id
```
**Description**: Delete a booking
**Authentication**: Required (manager role)

#### Get Booking Statistics
```
GET    /bookings/stats
```
**Description**: Get booking statistics and analytics
**Authentication**: Required (manager role)

### Journey Management (Full Access)

#### List All Journeys
```
GET    /journeys
```
**Description**: Get list of all journeys in the system
**Authentication**: Required (manager role)

#### Get Journey Details
```
GET    /journeys/:id
```
**Description**: Get detailed information about a specific journey
**Authentication**: Required (manager role)

#### Create Journey
```
POST   /journeys
```
**Description**: Create a new journey
**Authentication**: Required (manager role)
**Request Body**:
```json
{
  "name": "New Cultural Journey",
  "description": "Explore cultural heritage sites",
  "price": 299.99,
  "duration": "4 days",
  "category": "culture",
  "itinerary": ["Day 1: Arrival", "Day 2: City Tour"],
  "included": ["Hotel", "Meals", "Transport"],
  "excluded": ["Flights", "Personal expenses"]
}
```

#### Update Journey
```
PUT    /journeys/:id
```
**Description**: Update journey information
**Authentication**: Required (manager role)

#### Delete Journey
```
DELETE /journeys/:id
```
**Description**: Delete a journey
**Authentication**: Required (manager role)

#### Assign Guide to Journey
```
POST   /journeys/:id/assign-guide
```
**Description**: Assign a guide to a journey
**Authentication**: Required (manager role)

#### Get Journey Statistics
```
GET    /journeys/stats
```
**Description**: Get journey statistics and analytics
**Authentication**: Required (manager role)

### Provider Management (Full Access)

#### List All Providers
```
GET    /providers
```
**Description**: Get list of all service providers
**Authentication**: Required (manager role)

#### Get Provider Details
```
GET    /providers/:id
```
**Description**: Get detailed information about a specific provider
**Authentication**: Required (manager role)

#### Create Provider
```
POST   /providers
```
**Description**: Create a new service provider
**Authentication**: Required (manager role)
**Request Body**:
```json
{
  "name": "New Hotel",
  "type": "hotel",
  "contact": "contact@newhotel.com",
  "address": "123 Main Street",
  "rating": 4.5
}
```

#### Update Provider
```
PUT    /providers/:id
```
**Description**: Update provider information
**Authentication**: Required (manager role)

#### Delete Provider
```
DELETE /providers/:id
```
**Description**: Delete a service provider
**Authentication**: Required (manager role)

### System Management

#### Get System Statistics
```
GET    /system/stats
```
**Description**: Get comprehensive system statistics
**Authentication**: Required (manager role)
**Response**:
```json
{
  "stats": {
    "users": {
      "total": 150,
      "active": 140,
      "inactive": 10
    },
    "bookings": {
      "total": 500,
      "confirmed": 450,
      "pending": 50
    },
    "revenue": {
      "total": 150000.00,
      "monthly": 15000.00
    }
  }
}
```

#### Get System Health
```
GET    /system/health
```
**Description**: Get detailed system health information
**Authentication**: Required (manager role)
**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": "24h 30m 15s",
  "database": "connected",
  "memory": "45%",
  "cpu": "12%"
}
```

## RBAC Matrix

| Endpoint Category | Customer | Guide | Agent | Manager | Admin |
|------------------|----------|-------|-------|---------|-------|
| **Own Profile** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Own Bookings** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **All Bookings** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Journey Browsing** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Journey Management** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Customer Management** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **User Management** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **System Management** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Provider Management** | ❌ | ❌ | ✅ | ✅ | ✅ |

## Request/Response Examples

### Successful Response Format
```json
{
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response Format
```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": {
    // Additional error details if available
  }
}
```

### Pagination Response Format
```json
{
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Error Handling

### HTTP Status Codes
- **`200`** - Success
- **`201`** - Created
- **`400`** - Bad Request (validation errors, malformed data)
- **`401`** - Unauthorized (missing or invalid JWT token)
- **`403`** - Forbidden (insufficient permissions)
- **`404`** - Not Found (resource doesn't exist)
- **`409`** - Conflict (duplicate resource, business rule violation)
- **`422`** - Unprocessable Entity (semantic errors)
- **`429`** - Too Many Requests (rate limiting)
- **`500`** - Internal Server Error
- **`503`** - Service Unavailable (maintenance, overload)

### Common Error Codes
- **`AUTH_REQUIRED`** - Authentication required
- **`INSUFFICIENT_PERMISSIONS`** - User lacks required permissions
- **`VALIDATION_ERROR`** - Input validation failed
- **`RESOURCE_NOT_FOUND`** - Requested resource not found
- **`DUPLICATE_RESOURCE`** - Resource already exists
- **`BUSINESS_RULE_VIOLATION`** - Business logic constraint violated

### Error Response Examples

#### Validation Error
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

#### Authentication Error
```json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

#### Permission Error
```json
{
  "error": "Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS",
  "details": "Role 'customer' cannot access this endpoint"
}
```

## Security Features

### 1. **JWT Authentication**
- Secure token-based authentication
- Configurable token expiration
- Automatic token refresh mechanism

### 2. **Role-Based Access Control (RBAC)**
- Granular permission system
- Role-based endpoint access
- Data isolation between user types

### 3. **Data Isolation**
- Users can only access their own data unless explicitly authorized
- Cross-user data access requires appropriate permissions
- Soft delete implementation for data recovery

### 4. **Input Validation & Sanitization**
- Comprehensive input validation
- SQL injection prevention
- XSS protection
- Data sanitization before storage

### 5. **Rate Limiting**
- Configurable rate limiting per endpoint
- IP-based and user-based limiting
- Protection against abuse and DDoS

### 6. **Audit Logging**
- Complete audit trail of all operations
- User action tracking
- Data change history
- Security event logging

### 7. **Password Security**
- Strong password requirements
- Bcrypt hashing with configurable cost
- Password strength validation
- Secure password reset flow

## Development Notes

### Architecture Overview
- **Separation of Concerns**: User and Profile models are separate for performance optimization
- **Middleware Pattern**: Authentication, authorization, and validation middleware
- **Controller Organization**: Controllers organized by resource type
- **Route Structure**: RESTful API design with proper HTTP methods

### Performance Optimizations
- **User-Profile Separation**: Basic user info loads quickly for admin lists
- **Detailed Profile Loading**: Profile data loaded separately when needed
- **Pagination**: All list endpoints support pagination
- **Database Indexing**: Optimized database queries with proper indexing

### Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **Authentication Tests**: JWT and RBAC testing
- **Error Handling Tests**: Comprehensive error scenario coverage

### Deployment Considerations
- **Environment Configuration**: Separate configs for dev, staging, production
- **Health Checks**: Built-in health monitoring endpoints
- **Logging**: Structured logging for production monitoring
- **Error Tracking**: Comprehensive error reporting and monitoring

### API Versioning
- **Current Version**: v1 (implicit)
- **Backward Compatibility**: Maintained within major versions
- **Deprecation Policy**: Clear deprecation notices and migration guides

### Monitoring & Observability
- **Performance Metrics**: Response time, throughput, error rates
- **Business Metrics**: User activity, booking trends, revenue analytics
- **System Health**: Database connectivity, external service status
- **Alerting**: Automated alerts for critical issues

This comprehensive API documentation provides developers, administrators, and stakeholders with complete information about the ERP system's capabilities, security features, and usage patterns.
