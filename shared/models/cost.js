'use strict';

const { mongoose } = require('./db');
const { CATEGORIES } = require('../lib/categories');

const { Schema } = mongoose;

const costSchema = new Schema(
  {
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES
    },
    userid: {
      type: Number,
      required: true
    },
    sum: {
      type: Schema.Types.Double,
      required: true
    },
    // When the client does not supply a date, the controller defaults it to
    // "now" before the document is created, per the specification.
    date: {
      type: Date,
      required: true
    }
  },
  {
    versionKey: false,
    collection: 'costs'
  }
);

costSchema.index({ userid: 1, date: 1 });

module.exports = mongoose.models.Cost || mongoose.model('Cost', costSchema);
