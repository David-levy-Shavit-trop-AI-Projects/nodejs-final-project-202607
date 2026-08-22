'use strict';

const { app, logger } = require('./app');
const { models, config } = require('@cost-manager/shared');

const port = process.env.PORT || config.ports.about;

// Even though /api/about itself never touches the database, every request
// still needs to be written to the `logs` collection, so the connection is
// established before the HTTP server starts accepting traffic.
models
  .connect()
  .then(() => {
    app.listen(port, () => {
      logger.info(`about-service listening on port ${port}`);
    });
  })
  .catch((error) => {
    logger.error(`about-service failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  });
