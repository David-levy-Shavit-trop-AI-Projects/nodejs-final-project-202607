'use strict';

const { mongoose } = require('./db');

const { Schema } = mongoose;

// One document per HTTP request handled by any of the four services, plus
// one extra "endpoint accessed" entry written explicitly by each controller,
// as required by the specification.
const logSchema = new Schema(
  {
    level: {
      type: String,
      required: true
    },
    time: {
      type: Date,
      required: true,
      default: Date.now
    },
    service: {
      type: String,
      required: true
    },
    msg: {
      type: String,
      required: true
    },
    method: String,
    url: String,
    status_code: Number,
    response_time_ms: Number,
    ip: String
  },
  {
    versionKey: false,
    collection: 'logs'
  }
);

module.exports = mongoose.models.Log || mongoose.model('Log', logSchema);
