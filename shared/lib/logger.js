'use strict';

const pino = require('pino');
const config = require('./config');
const Log = require('../models/log');

/**
 * A minimal writable stream that Pino writes each NDJSON log line to. Every
 * line is parsed and persisted into the `logs` collection, satisfying the
 * requirement that log messages be saved to MongoDB. Persisting is
 * fire-and-forget: a MongoDB hiccup must never crash the process or the
 * request that produced the log line (stdout output already preserves it
 * for local debugging).
 */
function createMongoStream() {
  return {
    write(chunk) {
      let entry;
      try {
        entry = JSON.parse(chunk);
      } catch {
        return;
      }

      Log.create({
        level: entry.level,
        time: entry.time ? new Date(entry.time) : new Date(),
        service: entry.service,
        msg: entry.msg,
        method: entry.method,
        url: entry.url,
        status_code: entry.status_code,
        response_time_ms: entry.response_time_ms,
        ip: entry.ip
      }).catch(() => {});
    }
  };
}

/**
 * Builds a Pino logger for a given microservice. Every log line is written
 * to stdout (for local development and hosting-provider log viewers) and to
 * the MongoDB `logs` collection.
 */
function createLogger(serviceName) {
  const destination = pino.multistream([
    { stream: process.stdout },
    { stream: createMongoStream() }
  ]);

  return pino(
    {
      level: config.logLevel,
      base: { service: serviceName },
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level(label) {
          return { level: label };
        }
      }
    },
    destination
  );
}

module.exports = { createLogger };
