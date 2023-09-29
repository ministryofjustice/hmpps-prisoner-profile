[< Back](../README.md)
---

## Building and Running

To use the same version of NodeJS locally as is used in CI and production, follow [these notes](nvm.md).

First, build the project by running:

`npm install` and then `npm run build`

The Prisoner Profile service pulls data from a large number of sources and 
therefore has a number of dependencies:

* [redis](https://redis.io/) - session store and token caching
* [hmpps-auth](https://github.com/ministryofjustice/hmpps-auth) - for authentication
* [prison-api](https://github.com/ministryofjustice/prison-api) - the main API for retrieving data from NOMIS 
* [prisoner-offender-search](https://github.com/ministryofjustice/prisoner-offender-search) - an Elastic Search backed API for quickly retrieving commonly requested prisoner details
* [offender-management-allocation-manager](https://github.com/ministryofjustice/offender-management-allocation-manager) - allocation service for associating Prison Offender Managers with Offenders
* [keyworker-api](https://github.com/ministryofjustice/keyworker-api) - an API providing backend functionality for keyworkers
* [whereabouts-api](https://github.com/ministryofjustice/whereabouts-api) - an API providing backend functionality for the location of prisoners
* [offender-case-notes](https://github.com/ministryofjustice/offender-case-notes) - an API managing storage of offender case notes
* [hmpps-incentives-api](https://github.com/ministryofjustice/hmpps-incentives-api) - an API managing offender incentives data
* [curious-api](https://github.com/ministryofjustice/curious-API) - Curious is a 3rd party supplied system for Education Delivery Contract Management
* [pathfinder-api](https://github.com/ministryofjustice/pathfinder-api) - an API for retrieving Pathfinder data
* [manage-soc-cases-api](https://github.com/ministryofjustice/manage-soc-cases-api) - an API for retrieving SOC case data

### Developing against the development environment
Development of this application has mainly relied on configuring `hmpps-prisoner-profile` to point at the development 
environment instances of the above dependencies (redis being the exception, a local instance of this was used).

Here's the process.

1/ Run redis locally using Docker:
```
docker-compose pull && docker-compose up
```

2/ Create a .env file with environment variables pointing to the development environment
<details>
<summary>Click here for an example of the .env file</summary>
<br>
Note, personal client credentials need to be requested from the Auth team
to provide the missing client id and secret variables.

```
PORT=3000
NODE_ENV=development
API_CLIENT_ID=
API_CLIENT_SECRET=
SYSTEM_CLIENT_ID=
SYSTEM_CLIENT_SECRET=
TOKEN_VERIFICATION_ENABLED=true
HMPPS_AUTH_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth
PRISON_API_URL=https://prison-api-dev.prison.service.justice.gov.uk
PRISONER_SEARCH_API_URL=https://prisoner-search-dev.prison.service.justice.gov.uk
DPS_HOME_PAGE_URL=https://digital-dev.prison.service.justice.gov.uk
ALLOCATION_MANAGER_ENDPOINT_URL=https://dev.moic.service.justice.gov.uk
KEYWORKER_API_URL=https://keyworker-api-dev.prison.service.justice.gov.uk
WHEREABOUTS_API_URL=https://whereabouts-api-dev.service.justice.gov.uk
CASE_NOTES_API_URL=https://dev.offender-case-notes.service.justice.gov.uk
INCENTIVES_API_URL=https://incentives-api-dev.hmpps.service.justice.gov.uk
CURIOUS_API_URL=https://testservices.sequation.net/sequation-virtual-campus2-api
PATHFINDER_API_URL=https://dev-api.pathfinder.service.justice.gov.uk
MANAGE_SOC_CASES_API_URL=https://manage-soc-cases-api-dev.hmpps.service.justice.gov.uk
TOKEN_VERIFICATION_API_URL=https://token-verification-api-dev.prison.service.justice.gov.uk
OFFENDER_CATEGORISATION_UI_URL=https://dev.offender-categorisation.service.justice.gov.uk
USE_OF_FORCE_UI_URL=https://dev.use-of-force.service.justice.gov.uk
MANAGE_A_WARRANT_FOLDER_UI_URL=https://manage-a-warrant-folder-dev.hmpps.service.justice.gov.uk
PATHFINDER_UI_URL=https://dev.pathfinder.service.justice.gov.uk
MANAGE_SOC_CASES_UI_URL=https://manage-soc-cases-dev.hmpps.service.justice.gov.uk
NON_ASSOCIATIONS_UI_URL: "https://non-associations-dev.hmpps.service.justice.gov.uk"
```
</details>

3/ And then, to build the assets and start the app with nodemon:
```
npm run start:dev
```

4/ To access the service, navigate in a web browser to http://localhost:3000/prisoner/XYZ
replacing XYZ with the desired offender number in the development environment

### Developing locally

By using a combination of docker instances of dependencies and wiremock to mock 
certain dependencies, we can get the profile working entirely locally, although it is
obviously not as fully functional.

To do this:

1/ Run dependencies in docker:
```
docker-compose -f docker-compose-local-wiremock.yml pull
docker-compose -f docker-compose-local-wiremock.yml up
```

2/ Run the service using the local wiremock env file:
```
export $(cat .env-local-wiremock) && npm run start:dev
```

3/ To access the service, navigate in a web browser to http://localhost:3000/prisoner/A1234AA
and sign in with the following test credentials:

username: `ITAG_USER`
password: `password`

### Run linter

After making code changes eslint can be used to ensure code style is maintained
(although husky ensures this is run as part of the pre-commit hook too)
```
npm run lint
```

