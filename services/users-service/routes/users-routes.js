'use strict';

const express = require('express');
const { listUsers, getUserDetails, addUser } = require('../controllers/users-controller');

const router = express.Router();

router.get('/users', listUsers);
router.get('/users/:id', getUserDetails);
router.post('/add', addUser);

module.exports = router;
