'use strict';

const { models } = require('@cost-manager/shared');

/**
 * GET /api/logs - returns every log document, newest first. An optional
 * ?limit= query parameter caps how many documents are returned.
 */
async function listLogs(req, res, next) {
  try {
    req.app.locals.logger.info({ msg: 'GET /api/logs endpoint accessed' });

    const limit = Number.parseInt(req.query.limit, 10);
    let query = models.Log.find().sort({ time: -1 });
    if (Number.isInteger(limit) && limit > 0) {
      query = query.limit(limit);
    }

    const logs = await query.lean();
    res.json(logs);
  } catch (error) {
    next(error);
  }
}

module.exports = { listLogs };
