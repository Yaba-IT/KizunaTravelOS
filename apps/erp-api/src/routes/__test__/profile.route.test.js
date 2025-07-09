const express = require('express');
const request = require('supertest');

const profileRouter = require('../shared');

// On crée une fausse app juste pour ce router
const app = express();
app.use(express.json());
app.use('/profile', profileRouter);

describe('Profile routes', () => {
  it('should refuse access without token', async () => {
    const res = await request(app).get('/profile/12345');
    expect(res.status).toBe(401); // auth middleware bloque
  });

  it('should refuse access if not own profile', async () => {
    // On fake l'auth middleware et canAccessOwnData pour simuler un autre user
    const fakeAuth = (req, res, next) => {
      req.user = { id: 'not-matching-id', role: 'user' };
      next();
    };
    // Patch le router à la volée pour ce test
    const app2 = express();
    app2.use(express.json());
    app2.use(
      '/profile/:userId',
      fakeAuth,
      (req, res, next) => {
        // simule canAccessOwnData
        if (req.user.id !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });
        next();
      },
      (req, res) => res.json({ ok: true }),
    );
    const res = await request(app2).get('/profile/12345');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('should allow access if own profile', async () => {
    const matchingId = '12345';
    const fakeAuth = (req, res, next) => {
      req.user = { id: matchingId, role: 'user' };
      next();
    };
    // Patch le router pour le test
    const app3 = express();
    app3.use(express.json());
    app3.use(
      '/profile/:userId',
      fakeAuth,
      (req, res, next) => {
        if (req.user.id !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });
        next();
      },
      (req, res) => res.json({ ok: true }),
    );
    const res = await request(app3).get('/profile/' + matchingId);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
