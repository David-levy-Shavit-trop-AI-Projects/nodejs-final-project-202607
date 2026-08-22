'use strict';

const request = require('supertest');
const { startTestDb, stopTestDb } = require('../../../tests/setup-test-db');

describe('about-service', () => {
  let mongod;
  let app;
  let models;
  let parseTeamMembers;

  beforeAll(async () => {
    process.env.TEAM_MEMBERS = 'Shavit:Trop,David:Levy';
    mongod = await startTestDb();
    ({ app } = require('../app'));
    ({ models } = require('@cost-manager/shared'));
    ({ parseTeamMembers } = require('../controllers/about-controller'));
    await models.connect();
  });

  afterAll(async () => {
    await models.disconnect();
    await stopTestDb(mongod);
  });

  describe('GET /api/about', () => {
    it('returns only first_name and last_name for each team member', async () => {
      const response = await request(app).get('/api/about');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      for (const member of response.body) {
        expect(Object.keys(member).sort()).toEqual(['first_name', 'last_name']);
      }

      expect(response.body).toEqual([
        { first_name: 'Shavit', last_name: 'Trop' },
        { first_name: 'David', last_name: 'Levy' }
      ]);
    });

    it('also accepts the request when sent with a trailing slash', async () => {
      const response = await request(app).get('/api/about/');

      expect(response.status).toBe(200);
    });

    it('never reads from the database', async () => {
      const logCountBefore = await models.Log.estimatedDocumentCount();

      await request(app).get('/api/about');

      // The endpoint itself must not persist anything besides the request
      // log that every endpoint on every service writes.
      const usersCount = await models.User.estimatedDocumentCount();
      expect(usersCount).toBe(0);
      const logCountAfter = await models.Log.estimatedDocumentCount();
      expect(logCountAfter).toBeGreaterThanOrEqual(logCountBefore);
    });
  });

  describe('unknown routes', () => {
    it('returns a { id, message } error document for a 404', async () => {
      const response = await request(app).get('/api/nope');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ id: 404, message: expect.any(String) });
    });
  });

  describe('parseTeamMembers', () => {
    it('returns null for an empty or missing string, so the fallback team is used', () => {
      expect(parseTeamMembers('')).toBeNull();
      expect(parseTeamMembers(undefined)).toBeNull();
    });

    it('parses a "First:Last,First:Last" string into first_name/last_name objects', () => {
      expect(parseTeamMembers('Shavit:Trop, David:Levy')).toEqual([
        { first_name: 'Shavit', last_name: 'Trop' },
        { first_name: 'David', last_name: 'Levy' }
      ]);
    });
  });
});
