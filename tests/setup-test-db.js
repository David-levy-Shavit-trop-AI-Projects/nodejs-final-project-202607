'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');

/**
 * Spins up an in-memory MongoDB instance and points MONGODB_URI (and a
 * couple of other environment variables) at it *before* any shared module
 * is required, so shared/lib/config.js picks up the temporary database
 * instead of the real Atlas cluster.
 *
 * Must be called inside beforeAll, before requiring the service's app
 * module - Jest gives every test file its own module registry, so the very
 * first `require('../app')` in a test file is what actually evaluates
 * config.js and reads these environment variables.
 */
async function startTestDb() {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.MONGODB_DB_NAME = 'cost_manager_test';
  if (!process.env.TEAM_MEMBERS) {
    process.env.TEAM_MEMBERS = 'Shavit:Trop,David:Levy';
  }
  return mongod;
}

async function stopTestDb(mongod) {
  if (mongod) {
    await mongod.stop();
  }
}

module.exports = { startTestDb, stopTestDb };
