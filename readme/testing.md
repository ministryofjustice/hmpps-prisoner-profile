[< Back](../README.md)
---

## Testing

This project uses Jest for unit testing and Cypress for integration testing.

### Unit Tests

To run: `npm run test`

### Integration Tests

For local running, start a test db, redis, and wiremock instance by:

`docker compose -f docker-compose-test.yml up`

Then run the server in test mode by:

`npm run start-feature` (or `npm run start-feature:dev` to run with auto-start on changes)

And then either, run tests in headless mode with:

`npm run int-test`

Or run tests with the cypress UI:

`npm run int-test-ui`

When running in CI the tests are split into groups and run in parallel. When writing Cypress tests, if you
add any new folders or modify the directory structure you'll need to check the file glob patterns in the `integration-test-*`
jobs within `package.json` cover all the tests properly.
