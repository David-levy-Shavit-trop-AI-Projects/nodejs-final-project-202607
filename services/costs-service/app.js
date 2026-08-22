'use strict';

const { createLogger, createService } = require('@cost-manager/shared');
const costsRoutes = require('./routes/costs-routes');

const SERVICE_NAME = 'costs-service';

const logger = createLogger(SERVICE_NAME);

const app = createService({
  name: SERVICE_NAME,
  logger,
  registerRoutes: (expressApp) => {
    expressApp.use('/api', costsRoutes);
  }
});

module.exports = { app, logger };
