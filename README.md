# Cost Manager RESTful Web Services

**Authors**

| Name | ID | Phone | Email |
|------|----|-------|-------|
| Shavit Trop | 208121723 | 054-6146117 | shavittrop@gmail.com |
| David Levy | 206540387 | 054-2250161 | dudi.levy25@gmail.com |

Final project for the Asynchronous Server-Side Development course: a Cost Manager
built as four independent Express/Mongoose/Pino microservices sharing one MongoDB
Atlas database.

## Architecture

```
package.json                 npm workspaces: shared, services/*
render.yaml                  Render blueprint (4 web services)
shared/                      @cost-manager/shared - everything the services have in common
  models/                    ALL MongoDB code (Mongoose schemas + connection helper)
    db.js  user.js  cost.js  log.js  report.js  index.js
  lib/
    config.js                loads .env, validates required variables
    categories.js            the five required cost categories
    logger.js                Pino logger that also writes every line to MongoDB
    errors.js                AppError - the only way routes report a failure
    middleware.js             request logger / 404 handler / error formatter
    create-service.js        builds a fully wired Express app for one service
services/
  logs-service/              port 3001 - GET /api/logs
  users-service/             port 3002 - GET /api/users, GET /api/users/:id, POST /api/add
  costs-service/             port 3003 - POST /api/add, GET /api/report
  about-service/             port 3004 - GET /api/about
scripts/
  seed.js                    resets the DB to the single required user (123123)
  start-all.js               runs all four services locally for development
tests/
  setup-test-db.js           mongodb-memory-server helper shared by every test suite
  python/test_project.py     the course's sample grading script (4 URLs filled in)
```

Each service is a fully separate Node.js process with its own `package.json` and
`server.js` entry point - not just a route mounted inside one shared app. They all
import the same `@cost-manager/shared` package for their Mongoose models, logger,
and error handling, which keeps the code DRY without merging the processes.

`POST /api/add` intentionally exists on both the users service and the costs
service; the port (or, once deployed, the URL) determines which kind of
document is being added, exactly as described in the assignment.

## Computed Design Pattern

The project implements the Computed Design Pattern in two independent places:

1. **User total.** Every `users` document has a `total` field. `POST /api/add` on
   the costs service increments it atomically (`$inc`) in the same request that
   creates the cost item, so `GET /api/users/:id` never has to re-aggregate the
   entire `costs` collection - it just reads the precomputed value (see
   [`services/costs-service/controllers/add-cost.js`](services/costs-service/controllers/add-cost.js)
   and
   [`services/users-service/controllers/users-controller.js`](services/users-service/controllers/users-controller.js)).
2. **Monthly report cache.** `GET /api/report` for a month that has already fully
   passed is computed once and persisted into the `reports` collection
   (see [`services/costs-service/controllers/report.js`](services/costs-service/controllers/report.js)).
   Every later request for that same user/year/month is served straight from the
   cache. This is safe because `POST /api/add` refuses to create a cost item
   dated in a past month, so a past month's data can never change again.

## Running locally

1. Install dependencies once at the repo root (npm workspaces installs every
   service and the shared package together):

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your MongoDB Atlas connection
   string:

   ```bash
   cp .env.example .env
   ```

3. Reset the database to the required submission state (empties every
   collection, then inserts the single user `123123 / mosh / israeli`):

   ```bash
   npm run seed
   ```

4. Start all four services at once:

   ```bash
   node scripts/start-all.js
   ```

   or start them individually in separate terminals:

   ```bash
   npm run start:logs    # port 3001
   npm run start:users   # port 3002
   npm run start:costs   # port 3003
   npm run start:about   # port 3004
   ```

## Running the tests

```bash
npm test
```

Every endpoint has a Jest + Supertest suite under each service's `__tests__/`
folder. Each suite starts its own `mongodb-memory-server` instance (see
[`tests/setup-test-db.js`](tests/setup-test-db.js)), so the tests never touch the
real Atlas cluster and can run offline.

## Running the sample grading script

[`tests/python/test_project.py`](tests/python/test_project.py) is the course's
sample test program with the four microservice URLs already filled in for local
testing (`http://localhost:3001..3004`). With all four services running:

```bash
python tests/python/test_project.py tests/python/test_project_output.txt
```

Update the `a`, `b`, `c`, `d` variables at the top of the file with the deployed
URLs before using it for the final online verification.

## Deployment (Render)

[`render.yaml`](render.yaml) is a Render Blueprint that deploys the four
services as separate free web services from this one repository. To use it:

1. Push this repository to GitHub (or another Git provider Render can access).
2. In the Render dashboard, choose **New > Blueprint** and point it at the repo.
   Render will read `render.yaml` and create all four services.
3. When prompted, set `MONGODB_URI` (the shared environment group asks for it
   once) to your Atlas connection string. Never commit this value.
4. After the first deploy, note the four public URLs Render assigns - these are
   the four addresses required by the submission form and by
   `tests/python/test_project.py`.

Free Render web services spin down after a period of inactivity and take a
few seconds to wake back up on the first request - open each URL once before
running the grading script so none of the four cold-start mid-test.

Each of the four processes is fully independent; if you would rather deploy
them as four separate Render services created by hand (or on a different host
entirely), just point each one at the corresponding `services/<name>` folder
with `npm ci` as the build command and `node server.js` as the start command,
and set the same environment variables from `.env.example`.

## Environment variables

See [`.env.example`](.env.example) for the full list. The only one that must be
set for the app to boot at all is `MONGODB_URI`; everything else has a sensible
default.

## Before submission

- [ ] Run `npm run seed` one final time so the Atlas database contains nothing
      but the single user `123123 / mosh / israeli`.
- [ ] Run `npm test` and confirm every suite passes.
- [ ] Run `tests/python/test_project.py` against the four deployed URLs.
- [ ] Delete `node_modules/` before zipping the project for Moodle.
- [ ] Never commit `.env` or `atlas-credentials.env` - both are gitignored.
