'use strict';

const { mongoose } = require('./db');

const { Schema } = mongoose;

// Stores the computed result of a monthly report exactly as it is returned
// to the client. Only ever written for months that have already fully
// passed, which is what makes the cached document safe to reuse forever -
// the source cost items for a past month can no longer change, because the
// costs service refuses to add costs dated in the past.
const reportSchema = new Schema(
  {
    userid: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    month: {
      type: Number,
      required: true
    },
    costs: {
      type: Schema.Types.Mixed,
      required: true
    },
    generated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false,
    collection: 'reports'
  }
);

reportSchema.index({ userid: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.models.Report || mongoose.model('Report', reportSchema);
