'use strict';

const { mongoose } = require('./db');

const { Schema } = mongoose;

// `id` is the user-facing identifier used throughout the API and is
// intentionally distinct from Mongoose's own `_id`. `total` is the Computed
// Design Pattern field: it is kept up to date by the costs service every time
// a cost item is added, so GET /api/users/:id never has to aggregate the
// entire costs collection on read.
const userSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      required: true
    },
    birthday: {
      type: Date,
      required: true
    },
    total: {
      type: Schema.Types.Double,
      default: 0
    }
  },
  {
    versionKey: false,
    collection: 'users'
  }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
