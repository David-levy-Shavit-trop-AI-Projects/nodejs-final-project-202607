'use strict';

const request = require('supertest');
const { startTestDb, stopTestDb } = require('../../../tests/setup-test-db');

describe('users-service', () => {
  let mongod;
  let app;
  let models;

  beforeAll(async () => {
    mongod = await startTestDb();
    ({ app } = require('../app'));
    ({ models } = require('@cost-manager/shared'));
    await models.connect();
  });

  afterAll(async () => {
    await models.disconnect();
    await stopTestDb(mongod);
  });

  beforeEach(async () => {
    await models.User.deleteMany({});
    await models.Cost.deleteMany({});
  });

  describe('GET /api/users', () => {
    it('returns an empty array when there are no users', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('lists every user using the users collection field names', async () => {
      await models.User.create({
        id: 123123,
        first_name: 'mosh',
        last_name: 'israeli',
        birthday: new Date('1990-05-10')
      });

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: 123123,
        first_name: 'mosh',
        last_name: 'israeli'
      });
      expect(response.body[0]).toHaveProperty('birthday');
    });
  });

  describe('GET /api/users/:id', () => {
    it('returns first_name, last_name, id, and total for an existing user', async () => {
      await models.User.create({
        id: 123123,
        first_name: 'mosh',
        last_name: 'israeli',
        birthday: new Date('1990-05-10'),
        total: 42.5
      });

      const response = await request(app).get('/api/users/123123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        first_name: 'mosh',
        last_name: 'israeli',
        id: 123123,
        total: 42.5
      });
    });

    it('returns a 404 error document for a user that does not exist', async () => {
      const response = await request(app).get('/api/users/999999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ id: 404, message: expect.any(String) });
    });

    it('returns a 400 error document when the id is not a number', async () => {
      const response = await request(app).get('/api/users/not-a-number');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('id', 400);
    });
  });

  describe('POST /api/add', () => {
    const newUser = {
      id: 555,
      first_name: 'David',
      last_name: 'Levy',
      birthday: '1995-03-20'
    };

    it('creates a new user and returns it using the users collection field names', async () => {
      const response = await request(app).post('/api/add').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: 555,
        first_name: 'David',
        last_name: 'Levy'
      });

      const stored = await models.User.findOne({ id: 555 }).lean();
      expect(stored).not.toBeNull();
    });

    it('also accepts the request when sent with a trailing slash', async () => {
      const response = await request(app).post('/api/add/').send(newUser);

      expect(response.status).toBe(201);
    });

    it.each(['id', 'first_name', 'last_name', 'birthday'])(
      'rejects a request missing %s with a 400 error document',
      async (missingField) => {
        const payload = { ...newUser };
        delete payload[missingField];

        const response = await request(app).post('/api/add').send(payload);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('id', 400);
        expect(response.body).toHaveProperty('message');
      }
    );

    it('rejects an attempt to add a user that already exists', async () => {
      await request(app).post('/api/add').send(newUser);

      const response = await request(app).post('/api/add').send(newUser);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('id', 409);
      expect(response.body).toHaveProperty('message');

      const count = await models.User.countDocuments({ id: 555 });
      expect(count).toBe(1);
    });
  });
});
