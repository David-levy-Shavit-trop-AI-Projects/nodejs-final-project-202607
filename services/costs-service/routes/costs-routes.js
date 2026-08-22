'use strict';

const express = require('express');
const { addCost } = require('../controllers/add-cost');
const { getReport } = require('../controllers/report');

const router = express.Router();

router.post('/add', addCost);
router.get('/report', getReport);

module.exports = router;
