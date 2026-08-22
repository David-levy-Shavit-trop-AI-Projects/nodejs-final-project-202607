'use strict';

const { app, logger } = require('./app');
const { models, config } = require('@cost-manager/shared');

const port = process.env.PORT || config.ports.users;

models
  .connect()
  .then(() => {
    app.listen(port, () => {
      logger.info(`users-service listening on port ${port}`);
    });
  })
  .catch((error) => {
    logger.error(`users-service failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  });
