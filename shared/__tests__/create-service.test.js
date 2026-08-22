'use strict';

const request = require('supertest');
const { createService } = require('../lib/create-service');

const SERVICE_NAMES = [
  'logs-service',
  'users-service',
  'costs-service',
  'about-service'
];

describe.each(SERVICE_NAMES)('%s health check', (serviceName) => {
  const logger = { info: jest.fn(), error: jest.fn() };
  const app = createService({
    name: serviceName,
    logger,
    registerRoutes: () => {}
  });

  it('returns service health information from the root path', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', service: serviceName });
  });

  it('supports the HEAD probe used by Render', async () => {
    const response = await request(app).head('/');

    expect(response.status).toBe(200);
  });
});
