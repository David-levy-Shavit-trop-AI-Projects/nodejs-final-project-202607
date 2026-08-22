'use strict';

const { createLogger, createService } = require('@cost-manager/shared');
const usersRoutes = require('./routes/users-routes');

const SERVICE_NAME = 'users-service';

const logger = createLogger(SERVICE_NAME);

const app = createService({
  name: SERVICE_NAME,
  logger,
  registerRoutes: (expressApp) => {
    expressApp.use('/api', usersRoutes);
  }
});

module.exports = { app, logger };
