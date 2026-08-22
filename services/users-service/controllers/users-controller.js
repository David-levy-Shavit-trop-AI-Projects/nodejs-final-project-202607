'use strict';

const { models, AppError } = require('@cost-manager/shared');

const { User, Cost } = models;

/**
 * GET /api/users - lists every user with the same field names used in the
 * `users` collection.
 */
async function listUsers(req, res, next) {
  try {
    req.app.locals.logger.info({ msg: 'GET /api/users endpoint accessed' });

    const users = await User.find({}, 'id first_name last_name birthday -_id').lean();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/:id - returns first_name, last_name, id, and the
 * Computed-Design-Pattern `total`. `total` is normally read straight off the
 * user document (kept up to date by the costs service on every add); if it
 * is ever missing, it is recomputed on the fly from the costs collection as
 * a safety net.
 */
async function getUserDetails(req, res, next) {
  try {
    req.app.locals.logger.info({ msg: `GET /api/users/${req.params.id} endpoint accessed` });

    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      throw new AppError(400, 'User id must be a number');
    }

    const user = await User.findOne({ id }).lean();
    if (!user) {
      throw new AppError(404, `User ${id} was not found`);
    }

    let total = user.total;
    if (total === undefined || total === null) {
      const [aggregate] = await Cost.aggregate([
        { $match: { userid: id } },
        { $group: { _id: null, total: { $sum: '$sum' } } }
      ]);
      total = aggregate ? aggregate.total : 0;
    }

    res.json({
      first_name: user.first_name,
      last_name: user.last_name,
      id: user.id,
      total
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/add - creates a new user. Rejects a second document for the
 * same `id` with an error instead of allowing a duplicate.
 */
async function addUser(req, res, next) {
  try {
    req.app.locals.logger.info({ msg: 'POST /api/add (user) endpoint accessed' });

    const { id, first_name, last_name, birthday } = req.body;

    if (id === undefined || id === null || Number.isNaN(Number(id))) {
      throw new AppError(400, 'id is required and must be a number');
    }
    if (!first_name || typeof first_name !== 'string') {
      throw new AppError(400, 'first_name is required and must be a string');
    }
    if (!last_name || typeof last_name !== 'string') {
      throw new AppError(400, 'last_name is required and must be a string');
    }
    if (!birthday || Number.isNaN(new Date(birthday).getTime())) {
      throw new AppError(400, 'birthday is required and must be a valid date');
    }

    const numericId = Number(id);
    const existing = await User.findOne({ id: numericId }).lean();
    if (existing) {
      throw new AppError(409, `User with id ${numericId} already exists`);
    }

    let user;
    try {
      user = await User.create({
        id: numericId,
        first_name,
        last_name,
        birthday: new Date(birthday)
      });
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError(409, `User with id ${numericId} already exists`);
      }
      throw error;
    }

    res.status(201).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      birthday: user.birthday
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { listUsers, getUserDetails, addUser };
