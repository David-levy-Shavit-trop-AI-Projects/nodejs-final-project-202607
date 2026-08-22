'use strict';

const { models, AppError, CATEGORIES } = require('@cost-manager/shared');

const { Cost, Report } = models;

/**
 * A requested month is "past" once the current calendar month has moved
 * beyond it. Past-month reports are safe to cache forever because the costs
 * service refuses to add any cost item dated in a past month.
 */
function isPastMonth(year, month) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year < currentYear || (year === currentYear && month < currentMonth);
}

/**
 * Reads every cost item for the user/month/year directly from the costs
 * collection and groups it into the required report shape: one entry per
 * category, in a fixed order, always present even when empty.
 */
async function computeMonthlyReport(userid, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const costs = await Cost.find({
    userid,
    date: { $gte: startDate, $lt: endDate }
  }).lean();

  const byCategory = new Map(CATEGORIES.map((category) => [category, []]));

  for (const cost of costs) {
    const bucket = byCategory.get(cost.category);
    if (bucket) {
      bucket.push({
        sum: cost.sum,
        description: cost.description,
        day: cost.date.getDate()
      });
    }
  }

  return CATEGORIES.map((category) => ({ [category]: byCategory.get(category) }));
}

/**
 * GET /api/report?id=&year=&month= - implements the Computed Design
 * Pattern: a report for a month that has already fully passed is computed
 * once, persisted in the `reports` collection, and served straight from
 * that cache on every later request instead of being recomputed.
 */
async function getReport(req, res, next) {
  try {
    req.app.locals.logger.info({ msg: 'GET /api/report endpoint accessed' });

    const userid = Number(req.query.id);
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (!Number.isFinite(userid)) {
      throw new AppError(400, 'id is required and must be a number');
    }
    if (!Number.isInteger(year)) {
      throw new AppError(400, 'year is required and must be a number');
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new AppError(400, 'month is required and must be an integer between 1 and 12');
    }

    const past = isPastMonth(year, month);

    if (past) {
      const cached = await Report.findOne({ userid, year, month }).lean();
      if (cached) {
        return res.json({ userid, year, month, costs: cached.costs });
      }
    }

    const costs = await computeMonthlyReport(userid, year, month);

    if (past) {
      await Report.findOneAndUpdate(
        { userid, year, month },
        { userid, year, month, costs, generated_at: new Date() },
        { upsert: true }
      );
    }

    res.json({ userid, year, month, costs });
  } catch (error) {
    next(error);
  }
}

module.exports = { getReport, computeMonthlyReport, isPastMonth };
