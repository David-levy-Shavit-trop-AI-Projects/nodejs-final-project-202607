'use strict';

const { app, logger } = require('./app');
const { models, config } = require('@cost-manager/shared');

const port = process.env.PORT || config.ports.costs;

models
  .connect()
  .then(() => {
    app.listen(port, () => {
      logger.info(`costs-service listening on port ${port}`);
    });
  })
  .catch((error) => {
    logger.error(`costs-service failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  });
