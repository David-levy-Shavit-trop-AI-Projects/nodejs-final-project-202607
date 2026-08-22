'use strict';

/**
 * A recognized, "expected" application error. Route handlers throw this (or
 * pass it to next()) whenever a client request cannot be satisfied, and the
 * shared error-handling middleware turns it into the required
 * { id, message } JSON error document.
 */
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

module.exports = { AppError };
