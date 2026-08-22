'use strict';

const express = require('express');
const { requestLogger, notFoundHandler, errorHandler } = require('./middleware');

/**
 * Builds a fully configured Express app for one microservice. `registerRoutes`
 * receives the app so the caller can mount its own routers; every other
 * cross-cutting concern (JSON parsing, request logging, 404 handling, error
 * formatting) is identical across all four services and defined once here.
 */
function createService({ name, logger, registerRoutes }) {
  const app = express();

  app.disable('x-powered-by');
  app.locals.serviceName = name;
  app.locals.logger = logger;

  app.use(express.json());
  app.use(requestLogger(logger));

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler(logger));

  return app;
}

module.exports = { createService };
