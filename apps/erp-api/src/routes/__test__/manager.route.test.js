/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/routes/__test__/manager.route.test.js - Manager routes tests
* Tests manager-specific route functionality and permissions
*
* coded by farid212@Yaba-IT!
*/

const express = require('express');
const request = require('supertest');

// Mock the controllers to avoid database calls
jest.mock('../../controllers/user.js', () => ({
  getAllUsers: (req, res) => res.status(200).json({ message: 'All users retrieved' }),
  getUserById: (req, res) => res.status(200).json({ message: 'User retrieved', id: req.params.userId }),
  createUser: (req, res) => res.status(200).json({ message: 'User created', data: req.body }),
  updateUser: (req, res) => res.status(200).json({ message: 'User updated', id: req.params.userId }),
  deleteUser: (req, res) => res.status(200).json({ message: 'User deleted', id: req.params.userId }),
  updateUserStatus: (req, res) => res.status(200).json({ message: 'User status updated', id: req.params.userId }),
  updateUserRole: (req, res) => res.status(200).json({ message: 'User role updated', id: req.params.userId }),
  getSystemStats: (req, res) => res.status(200).json({ message: 'System stats retrieved' }),
  getSystemHealth: (req, res) => res.status(200).json({ message: 'System health checked' })
}));

jest.mock('../../controllers/profile.js', () => ({
  getAllProfiles: (req, res) => res.status(200).json({ message: 'All profiles retrieved' }),
  getProfileById: (req, res) => res.status(200).json({ message: 'Profile retrieved', id: req.params.profileId }),
  updateProfileById: (req, res) => res.status(200).json({ message: 'Profile updated', id: req.params.profileId }),
  deleteProfile: (req, res) => res.status(200).json({ message: 'Profile deleted', id: req.params.profileId }),
  restoreProfile: (req, res) => res.status(200).json({ message: 'Profile restored', id: req.params.profileId }),
  getProfileStats: (req, res) => res.status(200).json({ message: 'Profile stats retrieved' })
}));

jest.mock('../../controllers/booking.js', () => ({
  getAllBookings: (req, res) => res.status(200).json({ message: 'All bookings retrieved' }),
  getBookingById: (req, res) => res.status(200).json({ message: 'Booking retrieved', id: req.params.bookingId }),
  createBooking: (req, res) => res.status(200).json({ message: 'Booking created', data: req.body }),
  updateBooking: (req, res) => res.status(200).json({ message: 'Booking updated', id: req.params.bookingId }),
  deleteBooking: (req, res) => res.status(200).json({ message: 'Booking deleted', id: req.params.bookingId }),
  getBookingStats: (req, res) => res.status(200).json({ message: 'Booking stats retrieved' })
}));

jest.mock('../../controllers/journey.js', () => ({
  getAllJourneys: (req, res) => res.status(200).json({ message: 'All journeys retrieved' }),
  getJourneyById: (req, res) => res.status(200).json({ message: 'Journey retrieved', id: req.params.journeyId }),
  createJourney: (req, res) => res.status(200).json({ message: 'Journey created', data: req.body }),
  updateJourney: (req, res) => res.status(200).json({ message: 'Journey updated', id: req.params.journeyId }),
  deleteJourney: (req, res) => res.status(200).json({ message: 'Journey deleted', id: req.params.journeyId }),
  assignGuide: (req, res) => res.status(200).json({ message: 'Guide assigned', id: req.params.journeyId }),
  getJourneyStats: (req, res) => res.status(200).json({ message: 'Journey stats retrieved' })
}));

jest.mock('../../controllers/provider.js', () => ({
  getAllProviders: (req, res) => res.status(200).json({ message: 'All providers retrieved' }),
  getProviderById: (req, res) => res.status(200).json({ message: 'Provider retrieved', id: req.params.providerId }),
  createProvider: (req, res) => res.status(200).json({ message: 'Provider created', data: req.body }),
  updateProvider: (req, res) => res.status(200).json({ message: 'Provider updated', id: req.params.providerId }),
  deleteProvider: (req, res) => res.status(200).json({ message: 'Provider deleted', id: req.params.providerId }),
  restoreProvider: (req, res) => res.status(200).json({ message: 'Provider restored', id: req.params.providerId }),
  getProviderStats: (req, res) => res.status(200).json({ message: 'Provider stats retrieved' }),
  searchProviders: (req, res) => res.status(200).json({ message: 'Providers searched' })
}));

// Mock the validation middleware
jest.mock('../../middlewares/dataValidation.js', () => ({
  validateData: () => (req, res, next) => next()
}));

const managerRouter = require('../manager');

describe('Manager routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Authentication and Authorization', () => {
    it('should allow access with correct role', async () => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      app.use('/manager', fakeAuth, managerRouter);
      
      const res = await request(app).get('/manager/users');
      expect(res.status).toBe(200);
    });
  });

  describe('User management routes', () => {
    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      app.use('/manager', fakeAuth, managerRouter);
    });

    it('should handle GET /users', async () => {
      const res = await request(app).get('/manager/users');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('All users retrieved');
    });

    it('should handle GET /users/:id', async () => {
      const res = await request(app).get('/manager/users/67890');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle POST /users', async () => {
      const userData = { email: 'test@example.com', password: 'Password123!', role: 'agent' };
      const res = await request(app).post('/manager/users').send(userData);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(userData);
    });

    it('should handle PUT /users/:id', async () => {
      const res = await request(app).put('/manager/users/67890').send({ email: 'updated@example.com' });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle DELETE /users/:id', async () => {
      const res = await request(app).delete('/manager/users/67890');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle POST /users/:id/status', async () => {
      const res = await request(app).post('/manager/users/67890/status').send({ status: 'active' });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle POST /users/:id/role', async () => {
      const res = await request(app).post('/manager/users/67890/role').send({ role: 'agent' });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });
  });

  describe('Profile management routes', () => {
    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      app.use('/manager', fakeAuth, managerRouter);
    });

    it('should handle GET /profiles', async () => {
      const res = await request(app).get('/manager/profiles');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('All profiles retrieved');
    });

    it('should handle GET /profiles/:id', async () => {
      const res = await request(app).get('/manager/profiles/67890');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle PUT /profiles/:id', async () => {
      const res = await request(app).put('/manager/profiles/67890').send({ firstname: 'John' });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle DELETE /profiles/:id', async () => {
      const res = await request(app).delete('/manager/profiles/67890');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle POST /profiles/:id/restore', async () => {
      const res = await request(app).post('/manager/profiles/67890/restore');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle GET /profiles/stats', async () => {
      const res = await request(app).get('/manager/profiles/stats');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Profile stats retrieved');
    });
  });

  describe('Booking management routes', () => {
    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      app.use('/manager', fakeAuth, managerRouter);
    });

    it('should handle GET /bookings', async () => {
      const res = await request(app).get('/manager/bookings');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('All bookings retrieved');
    });

    it('should handle GET /bookings/:id', async () => {
      const res = await request(app).get('/manager/bookings/67890');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle POST /bookings', async () => {
      const bookingData = { customerId: '123', journeyId: '456', travelDate: '2024-01-01' };
      const res = await request(app).post('/manager/bookings').send(bookingData);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(bookingData);
    });

    it('should handle PUT /bookings/:id', async () => {
      const res = await request(app).put('/manager/bookings/67890').send({ status: 'confirmed' });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle DELETE /bookings/:id', async () => {
      const res = await request(app).delete('/manager/bookings/67890');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle GET /bookings/stats', async () => {
      const res = await request(app).get('/manager/bookings/stats');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Booking stats retrieved');
    });
  });

  describe('Journey management routes', () => {
    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      app.use('/manager', fakeAuth, managerRouter);
    });

    it('should handle GET /journeys', async () => {
      const res = await request(app).get('/manager/journeys');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('All journeys retrieved');
    });

    it('should handle GET /journeys/:id', async () => {
      const res = await request(app).get('/manager/journeys/67890');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle POST /journeys', async () => {
      const journeyData = { name: 'New Journey', price: 200.00, duration: '2 days' };
      const res = await request(app).post('/manager/journeys').send(journeyData);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(journeyData);
    });

    it('should handle PUT /journeys/:id', async () => {
      const res = await request(app).put('/manager/journeys/67890').send({ name: 'Updated Journey' });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle DELETE /journeys/:id', async () => {
      const res = await request(app).delete('/manager/journeys/67890');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle POST /journeys/:id/assign-guide', async () => {
      const res = await request(app).post('/manager/journeys/67890/assign-guide').send({ guideId: '123' });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle GET /journeys/stats', async () => {
      const res = await request(app).get('/manager/journeys/stats');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Journey stats retrieved');
    });
  });

  describe('Provider management routes', () => {
    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      app.use('/manager', fakeAuth, managerRouter);
    });

    it('should handle GET /providers', async () => {
      const res = await request(app).get('/manager/providers');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('All providers retrieved');
    });

    it('should handle GET /providers/:id', async () => {
      const res = await request(app).get('/manager/providers/67890');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle POST /providers', async () => {
      const providerData = { name: 'New Provider', type: 'hotel' };
      const res = await request(app).post('/manager/providers').send(providerData);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(providerData);
    });

    it('should handle PUT /providers/:id', async () => {
      const res = await request(app).put('/manager/providers/67890').send({ name: 'Updated Provider' });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle DELETE /providers/:id', async () => {
      const res = await request(app).delete('/manager/providers/67890');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle POST /providers/:id/restore', async () => {
      const res = await request(app).post('/manager/providers/67890/restore');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe('67890');
    });

    it('should handle GET /providers/stats', async () => {
      const res = await request(app).get('/manager/providers/stats');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Provider stats retrieved');
    });

    it('should handle GET /providers/search', async () => {
      const res = await request(app).get('/manager/providers/search?q=hotel');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Providers searched');
    });
  });

  describe('System management routes', () => {
    beforeEach(() => {
      const fakeAuth = (req, res, next) => {
        req.user = { id: '12345', role: 'manager' };
        next();
      };
      app.use('/manager', fakeAuth, managerRouter);
    });

    it('should handle GET /system/stats', async () => {
      const res = await request(app).get('/manager/system/stats');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('System stats retrieved');
    });

    it('should handle GET /system/health', async () => {
      const res = await request(app).get('/manager/system/health');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('System health checked');
    });
  });
});
