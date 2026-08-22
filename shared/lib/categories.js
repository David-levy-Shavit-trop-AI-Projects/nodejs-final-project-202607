'use strict';

// The five cost categories required by the project specification. Order here
// is the order in which they are always emitted in the monthly report, even
// when a category has no cost items for that month.
const CATEGORIES = Object.freeze(['food', 'health', 'housing', 'sports', 'education']);

module.exports = { CATEGORIES };
