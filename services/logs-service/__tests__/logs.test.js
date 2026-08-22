'use strict';

const request = require('supertest');
const { startTestDb, stopTestDb } = require('../../../tests/setup-test-db');

describe('logs-service', () => {
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
    await models.Log.deleteMany({});
  });

  describe('GET /api/logs', () => {
    it('returns 200 and an empty array when there are no logs', async () => {
      const response = await request(app).get('/api/logs');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('returns previously stored logs using the log collection field names', async () => {
      await models.Log.create({
        level: 'info',
        time: new Date('2026-01-01T00:00:00.000Z'),
        service: 'logs-service',
        msg: 'seeded log entry',
        method: 'GET',
        url: '/api/logs',
        status_code: 200,
        response_time_ms: 1.5,
        ip: '127.0.0.1'
      });

      const response = await request(app).get('/api/logs');

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      const seeded = response.body.find((log) => log.msg === 'seeded log entry');
      expect(seeded).toMatchObject({
        level: 'info',
        service: 'logs-service',
        method: 'GET',
        url: '/api/logs',
        status_code: 200,
        ip: '127.0.0.1'
      });
    });

    it('orders logs newest first', async () => {
      await models.Log.create({
        level: 'info',
        time: new Date('2026-01-01T00:00:00.000Z'),
        service: 'logs-service',
        msg: 'older'
      });
      await models.Log.create({
        level: 'info',
        time: new Date('2026-02-01T00:00:00.000Z'),
        service: 'logs-service',
        msg: 'newer'
      });

      const response = await request(app).get('/api/logs');
      const messages = response.body.map((log) => log.msg);

      expect(messages.indexOf('newer')).toBeLessThan(messages.indexOf('older'));
    });

    it('honors the optional limit query parameter', async () => {
      await models.Log.create({ level: 'info', service: 'logs-service', msg: 'one' });
      await models.Log.create({ level: 'info', service: 'logs-service', msg: 'two' });
      await models.Log.create({ level: 'info', service: 'logs-service', msg: 'three' });

      const response = await request(app).get('/api/logs?limit=2');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });
  });

  describe('unknown routes', () => {
    it('returns a { id, message } error document for a 404', async () => {
      const response = await request(app).get('/api/does-not-exist');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('id', 404);
      expect(response.body).toHaveProperty('message');
    });
  });
});
