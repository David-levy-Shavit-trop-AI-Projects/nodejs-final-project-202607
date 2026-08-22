'use strict';

const { createLogger, createService } = require('@cost-manager/shared');
const logsRoutes = require('./routes/logs-routes');

const SERVICE_NAME = 'logs-service';

const logger = createLogger(SERVICE_NAME);

const app = createService({
  name: SERVICE_NAME,
  logger,
  registerRoutes: (expressApp) => {
    expressApp.use('/api', logsRoutes);
  }
});

module.exports = { app, logger };
