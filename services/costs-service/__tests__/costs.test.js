'use strict';

const request = require('supertest');
const { startTestDb, stopTestDb } = require('../../../tests/setup-test-db');

const USER_ID = 123123;

function currentYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function previousYearMonth() {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 1-12 for the previous calendar month
  if (month === 0) {
    month = 12;
    year -= 1;
  }
  return { year, month };
}

describe('costs-service', () => {
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
    await models.Report.deleteMany({});
    await models.User.create({
      id: USER_ID,
      first_name: 'mosh',
      last_name: 'israeli',
      birthday: new Date('1990-01-01')
    });
  });

  describe('POST /api/add', () => {
    it('creates a cost item and returns it using the costs collection field names', async () => {
      const response = await request(app).post('/api/add').send({
        userid: USER_ID,
        description: 'milk',
        category: 'food',
        sum: 8
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        description: 'milk',
        category: 'food',
        userid: USER_ID,
        sum: 8
      });
      expect(response.body).toHaveProperty('date');
    });

    it('increments the owning user total (Computed Design Pattern)', async () => {
      await request(app).post('/api/add').send({
        userid: USER_ID,
        description: 'milk',
        category: 'food',
        sum: 8
      });
      await request(app).post('/api/add').send({
        userid: USER_ID,
        description: 'bread',
        category: 'food',
        sum: 4.5
      });

      const user = await models.User.findOne({ id: USER_ID }).lean();
      expect(user.total).toBe(12.5);
    });

    it('also accepts the request when sent with a trailing slash', async () => {
      const response = await request(app).post('/api/add/').send({
        userid: USER_ID,
        description: 'milk',
        category: 'food',
        sum: 8
      });

      expect(response.status).toBe(201);
    });

    it('rejects an unknown category with a 400 error document', async () => {
      const response = await request(app).post('/api/add').send({
        userid: USER_ID,
        description: 'milk',
        category: 'groceries',
        sum: 8
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('id', 400);
    });

    it('rejects a missing description with a 400 error document', async () => {
      const response = await request(app).post('/api/add').send({
        userid: USER_ID,
        category: 'food',
        sum: 8
      });

      expect(response.status).toBe(400);
    });

    it('rejects a non-positive sum with a 400 error document', async () => {
      const response = await request(app).post('/api/add').send({
        userid: USER_ID,
        description: 'milk',
        category: 'food',
        sum: 0
      });

      expect(response.status).toBe(400);
    });

    it('rejects a cost item for a user that does not exist', async () => {
      const response = await request(app).post('/api/add').send({
        userid: 1,
        description: 'milk',
        category: 'food',
        sum: 8
      });

      expect(response.status).toBe(404);
    });

    it('rejects a cost item dated in a past month', async () => {
      const { year, month } = previousYearMonth();

      const response = await request(app).post('/api/add').send({
        userid: USER_ID,
        description: 'milk',
        category: 'food',
        sum: 8,
        date: new Date(year, month - 1, 15).toISOString()
      });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/report', () => {
    it('rejects a request missing required query parameters', async () => {
      const response = await request(app).get('/api/report').query({ id: USER_ID });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('id', 400);
    });

    it('always lists all five categories, including empty ones, for the current month', async () => {
      const { year, month } = currentYearMonth();

      await request(app).post('/api/add').send({
        userid: USER_ID,
        description: 'choco',
        category: 'food',
        sum: 12
      });

      const response = await request(app)
        .get('/api/report')
        .query({ id: USER_ID, year, month });

      expect(response.status).toBe(200);
      expect(response.body.userid).toBe(USER_ID);
      expect(response.body.year).toBe(year);
      expect(response.body.month).toBe(month);

      const categoryNames = response.body.costs.map((entry) => Object.keys(entry)[0]);
      expect(categoryNames.sort()).toEqual(
        ['education', 'food', 'health', 'housing', 'sports'].sort()
      );

      const food = response.body.costs.find((entry) => entry.food)?.food;
      expect(food).toEqual([{ sum: 12, description: 'choco', day: expect.any(Number) }]);

      const health = response.body.costs.find((entry) => entry.health)?.health;
      expect(health).toEqual([]);
    });

    it('computes and caches a report for a month that has already passed', async () => {
      const { year, month } = previousYearMonth();
      const day = 10;

      await models.Cost.create({
        userid: USER_ID,
        description: 'old rent',
        category: 'housing',
        sum: 900,
        date: new Date(year, month - 1, day)
      });

      const firstResponse = await request(app)
        .get('/api/report')
        .query({ id: USER_ID, year, month });

      expect(firstResponse.status).toBe(200);
      const housing = firstResponse.body.costs.find((entry) => entry.housing)?.housing;
      expect(housing).toEqual([{ sum: 900, description: 'old rent', day }]);

      const cached = await models.Report.findOne({ userid: USER_ID, year, month }).lean();
      expect(cached).not.toBeNull();

      // Mutate the underlying cost item directly; a cached report must not
      // reflect this change, proving the second request is served from the
      // `reports` collection instead of being recomputed.
      await models.Cost.updateMany({ userid: USER_ID }, { $set: { sum: 1 } });

      const secondResponse = await request(app)
        .get('/api/report')
        .query({ id: USER_ID, year, month });

      const housingAfterMutation = secondResponse.body.costs.find(
        (entry) => entry.housing
      )?.housing;
      expect(housingAfterMutation).toEqual([{ sum: 900, description: 'old rent', day }]);
    });
  });
});
