'use strict';

const { createLogger, createService } = require('@cost-manager/shared');
const aboutRoutes = require('./routes/about-routes');

const SERVICE_NAME = 'about-service';

const logger = createLogger(SERVICE_NAME);

const app = createService({
  name: SERVICE_NAME,
  logger,
  registerRoutes: (expressApp) => {
    expressApp.use('/api', aboutRoutes);
  }
});

module.exports = { app, logger };
