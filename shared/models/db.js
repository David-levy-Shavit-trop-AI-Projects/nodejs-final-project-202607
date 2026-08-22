'use strict';

const mongoose = require('mongoose');
const config = require('../lib/config');

let connectionPromise = null;

/**
 * Connects to MongoDB Atlas exactly once per process and reuses the same
 * connection for every subsequent call. Each of the four microservices calls
 * this on startup; tests call it too, after pointing MONGODB_URI at an
 * in-memory server.
 */
function connect() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(config.mongodbUri, { dbName: config.mongodbDbName })
      .then((instance) => instance.connection)
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

async function disconnect() {
  connectionPromise = null;
  await mongoose.disconnect();
}

module.exports = { connect, disconnect, mongoose };
