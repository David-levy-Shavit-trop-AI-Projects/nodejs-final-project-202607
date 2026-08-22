'use strict';

const { AppError } = require('./errors');

/**
 * Logs one line for every HTTP request received by the server, once the
 * response has finished, so the recorded response time and status code are
 * accurate. This satisfies the "log message for every HTTP request"
 * requirement independently of the per-endpoint logging each controller
 * also performs.
 */
function requestLogger(logger) {
  return (req, res, next) => {
    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
      const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

      logger.info({
        method: req.method,
        url: req.originalUrl,
        status_code: res.statusCode,
        response_time_ms: Math.round(elapsedMs * 100) / 100,
        ip: req.ip,
        msg: `${req.method} ${req.originalUrl} ${res.statusCode}`
      });
    });

    next();
  };
}

/**
 * Catches any request that did not match a route and turns it into the
 * standard { id, message } error document instead of Express's default
 * HTML 404 page.
 */
function notFoundHandler(req, res, next) {
  next(new AppError(404, `Not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Single place where every error thrown or passed to next() in any route
 * handler is turned into the { id, message } JSON document required by the
 * specification, and logged.
 */
function errorHandler(logger) {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, next) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = statusCode === 500 && !(err instanceof AppError)
      ? 'Internal server error'
      : err.message;

    logger.error({
      method: req.method,
      url: req.originalUrl,
      status_code: statusCode,
      msg: `Error handling ${req.method} ${req.originalUrl}: ${err.message}`
    });

    res.status(statusCode).json({ id: statusCode, message });
  };
}

module.exports = { requestLogger, notFoundHandler, errorHandler };
