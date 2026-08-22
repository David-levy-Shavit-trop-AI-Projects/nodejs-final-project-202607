'use strict';

// Resets the database to the state required at submission time: empty
// except for a single imaginary user (id 123123, mosh israeli). Run with:
//   npm run seed

const { models } = require('@cost-manager/shared');

async function seed() {
  await models.connect();

  await Promise.all([
    models.User.deleteMany({}),
    models.Cost.deleteMany({}),
    models.Log.deleteMany({}),
    models.Report.deleteMany({})
  ]);

  await models.User.create({
    id: 123123,
    first_name: 'mosh',
    last_name: 'israeli',
    birthday: new Date('1990-01-01'),
    total: 0
  });

  console.log('Database reset: all collections cleared, user 123123 (mosh israeli) created.');

  await models.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
