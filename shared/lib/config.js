'use strict';

const path = require('node:path');
const dotenv = require('dotenv');

// Every service lives two levels below the repo root (services/<name>/...),
// so we always load the single .env file at the repo root instead of relying
// on each service's own working directory.
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env'), quiet: true });

/**
 * Reads an environment variable, throwing when it is required but missing.
 * Keeping this in one place means every service fails fast with the same
 * clear error message instead of crashing later with a confusing stack trace.
 */
function readEnv(name, { required = false, defaultValue } = {}) {
  const value = process.env[name];

  if (value === undefined || value === '') {
    if (required) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return defaultValue;
  }

  return value;
}

const config = {
  mongodbUri: readEnv('MONGODB_URI', { required: true }),
  mongodbDbName: readEnv('MONGODB_DB_NAME', { defaultValue: 'cost_manager' }),
  logLevel: readEnv('LOG_LEVEL', { defaultValue: 'info' }),
  teamMembers: readEnv('TEAM_MEMBERS', { defaultValue: '' }),
  ports: {
    logs: Number(readEnv('LOGS_SERVICE_PORT', { defaultValue: '3001' })),
    users: Number(readEnv('USERS_SERVICE_PORT', { defaultValue: '3002' })),
    costs: Number(readEnv('COSTS_SERVICE_PORT', { defaultValue: '3003' })),
    about: Number(readEnv('ABOUT_SERVICE_PORT', { defaultValue: '3004' }))
  }
};

module.exports = config;
