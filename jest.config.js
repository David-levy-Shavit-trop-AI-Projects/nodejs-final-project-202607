'use strict';

module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/services/*/__tests__/**/*.test.js',
    '**/shared/__tests__/**/*.test.js'
  ],
  testTimeout: 30000,
  verbose: true
};
