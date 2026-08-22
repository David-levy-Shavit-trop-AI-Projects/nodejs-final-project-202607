'use strict';

const { config } = require('@cost-manager/shared');

// Used only if TEAM_MEMBERS is not set in the environment. The names of the
// developers must never be stored in the database, per the specification.
const FALLBACK_TEAM = [
  { first_name: 'Shavit', last_name: 'Trop' },
  { first_name: 'David', last_name: 'Levy' }
];

/**
 * Parses a "First:Last,First:Last" string from the TEAM_MEMBERS
 * environment variable into the array of { first_name, last_name } objects
 * the endpoint returns.
 */
function parseTeamMembers(raw) {
  if (!raw) {
    return null;
  }

  const members = raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [firstName, lastName] = entry.split(':').map((part) => part.trim());
      return { first_name: firstName, last_name: lastName };
    })
    .filter((member) => member.first_name && member.last_name);

  return members.length > 0 ? members : null;
}

/**
 * GET /api/about - returns only first_name/last_name for each team member.
 */
async function getAbout(req, res, next) {
  try {
    req.app.locals.logger.info({ msg: 'GET /api/about endpoint accessed' });

    const team = parseTeamMembers(config.teamMembers) || FALLBACK_TEAM;
    res.json(team);
  } catch (error) {
    next(error);
  }
}

module.exports = { getAbout, parseTeamMembers };
