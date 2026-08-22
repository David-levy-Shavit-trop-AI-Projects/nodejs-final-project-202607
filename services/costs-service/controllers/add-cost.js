'use strict';

const { models, AppError, CATEGORIES } = require('@cost-manager/shared');

const { User, Cost } = models;

/**
 * Returns the first instant of the current calendar month, used as the
 * cutoff for rejecting cost items dated in the past.
 */
function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * POST /api/add - creates a new cost item.
 *
 * Also implements half of the Computed Design Pattern for this project: the
 * owning user's `total` is incremented atomically in the same request, so
 * the users service never has to re-aggregate the whole costs collection to
 * answer GET /api/users/:id.
 */
async function addCost(req, res, next) {
  try {
    req.app.locals.logger.info({ msg: 'POST /api/add (cost) endpoint accessed' });

    const { description, category, userid, sum, date } = req.body;

    if (!description || typeof description !== 'string') {
      throw new AppError(400, 'description is required and must be a string');
    }
    if (!CATEGORIES.includes(category)) {
      throw new AppError(400, `category must be one of: ${CATEGORIES.join(', ')}`);
    }
    if (userid === undefined || userid === null || Number.isNaN(Number(userid))) {
      throw new AppError(400, 'userid is required and must be a number');
    }

    const numericUserId = Number(userid);
    const numericSum = Number(sum);
    if (!Number.isFinite(numericSum) || numericSum <= 0) {
      throw new AppError(400, 'sum is required and must be a positive number');
    }

    const user = await User.findOne({ id: numericUserId }).lean();
    if (!user) {
      throw new AppError(404, `User ${numericUserId} was not found`);
    }

    const costDate = date ? new Date(date) : new Date();
    if (Number.isNaN(costDate.getTime())) {
      throw new AppError(400, 'date must be a valid date');
    }
    if (costDate < startOfCurrentMonth()) {
      throw new AppError(400, 'Cannot add a cost item dated in a past month');
    }

    const cost = await Cost.create({
      description,
      category,
      userid: numericUserId,
      sum: numericSum,
      date: costDate
    });

    await User.updateOne({ id: numericUserId }, { $inc: { total: numericSum } });

    res.status(201).json({
      description: cost.description,
      category: cost.category,
      userid: cost.userid,
      sum: cost.sum,
      date: cost.date
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { addCost };
