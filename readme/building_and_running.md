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
* [hmpps-prisoner-search](https://github.com/ministryofjustice/hmpps-prisoner-search) - an OpenSearch backed API for
  quickly retrieving commonly requested prisoner details
* [offender-management-allocation-manager](https://github.com/ministryofjustice/offender-management-allocation-manager) -
  allocation service for associating Prison Offender Managers with Offenders
* [keyworker-api](https://github.com/ministryofjustice/keyworker-api) - an API providing backend functionality for
  keyworkers
* [whereabouts-api](https://github.com/ministryofjustice/whereabouts-api) - an API providing backend functionality for
  the location of prisoners
* [offender-case-notes](https://github.com/ministryofjustice/offender-case-notes) - an API managing storage of offender
  case notes
* [hmpps-incentives-api](https://github.com/ministryofjustice/hmpps-incentives-api) - an API managing offender
  incentives data
* [curious-api](https://github.com/ministryofjustice/curious-API) - Curious is a 3rd party supplied system for Education
  Delivery Contract Management
* [pathfinder-api](https://github.com/ministryofjustice/pathfinder-api) - an API for retrieving Pathfinder data
* [manage-soc-cases-api](https://github.com/ministryofjustice/manage-soc-cases-api) - an API for retrieving SOC case
  data

### Developing against the development environment

Development of this application has mainly relied on configuring `hmpps-prisoner-profile` to point at the development
environment instances of the above dependencies (redis being the exception, a local instance of this was used).

Here's the process.

1/ Create a .env file with environment variables pointing to the development environment
<details>
<summary>Click here for an example of the .env file</summary>
<br>
Note, client credentials and contentful details need to be retrieved from the dev kubernetes secrets to provide the missing client id and secret variables.

```
PORT=3000
NODE_ENV=development
ENVIRONMENT_NAME=DEV
SYSTEM_PHASE=DEV
TOKEN_VERIFICATION_ENABLED=false
API_CLIENT_ID=
API_CLIENT_SECRET=
SYSTEM_CLIENT_ID=
SYSTEM_CLIENT_SECRET=
ACTIVITIES_URL=https://activities-dev.prison.service.justice.gov.uk/activities
ADJUDICATIONS_UI_URL=https://manage-adjudications-dev.hmpps.service.justice.gov.uk
ALLOCATION_MANAGER_ENDPOINT_URL=https://dev.moic.service.justice.gov.uk
APPOINTMENTS_URL=https://activities-dev.prison.service.justice.gov.uk/appointments
ASSESS_FOR_EARLY_RELEASE_UI_URL=https:https://assess-for-early-release-dev.hmpps.service.justice.gov.uk
BOOK_A_VIDEO_LINK_API_URL=https://book-a-video-link-api-dev.prison.service.justice.gov.uk
CALCULATE_RELEASE_DATES_UI_URL=https://calculate-release-dates-dev.hmpps.service.justice.gov.uk
CASE_NOTES_API_URL=https://dev.offender-case-notes.service.justice.gov.uk
COMPONENT_API_LATEST=true
COMPONENT_API_URL=https://frontend-components-dev.hmpps.service.justice.gov.uk
DEV__COMPONENT_API_URL=https://frontend-components-dev.hmpps.service.justice.gov.uk
LOCAL__COMPONENT_API_URL=http://localhost:3123
CREATE_AND_VARY_A_LICENCE_UI_URL=https://create-and-vary-a-licence-dev.hmpps.service.justice.gov.uk
CURIOUS_API_URL=https://testservices.sequation.net/sequation-virtual-campus2-api
DPS_HOME_PAGE_URL=https://digital-dev.prison.service.justice.gov.uk
HMPPS_AUTH_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth
HMPPS_NON_ASSOCIATIONS_API_URL=https://non-associations-api-dev.hmpps.service.justice.gov.uk
INCENTIVES_API_URL=https://incentives-api-dev.hmpps.service.justice.gov.uk
INGRESS_URL=http://localhost:3000
KEYWORKER_API_URL=https://keyworker-api-dev.prison.service.justice.gov.uk
MANAGE_ADJUDICATIONS_API_URL=https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk
MANAGE_A_WARRANT_FOLDER_UI_URL=https://manage-a-warrant-folder-dev.hmpps.service.justice.gov.uk
MANAGE_SOC_CASES_API_URL=https://manage-soc-cases-api-dev.hmpps.service.justice.gov.uk
MANAGE_SOC_CASES_UI_URL=https://manage-soc-cases-dev.hmpps.service.justice.gov.uk
NON_ASSOCIATIONS_UI_URL=https://non-associations-dev.hmpps.service.justice.gov.uk
OFFENDER_CATEGORISATION_UI_URL=https://dev.offender-categorisation.service.justice.gov.uk
PATHFINDER_API_URL=https://dev-api.pathfinder.service.justice.gov.uk
PATHFINDER_UI_URL=https://dev.pathfinder.service.justice.gov.uk
PRISONER_PROFILE_DELIUS_API_URL=https://prisoner-profile-and-delius-dev.hmpps.service.justice.gov.uk
PRISONER_SEARCH_API_URL=https://prisoner-search-dev.prison.service.justice.gov.uk
PRISON_API_URL=https://prison-api-dev.prison.service.justice.gov.uk
LOCATIONS_INSIDE_PRISON_API_URL=https://locations-inside-prison-api-dev.hmpps.service.justice.gov.uk
NOMIS_SYNC_PRISONER_MAPPING_API_URL=https://nomis-sync-prisoner-mapping-dev.hmpps.service.justice.gov.uk
USE_OF_FORCE_UI_URL=https://dev.use-of-force.service.justice.gov.uk
WELCOME_PEOPLE_INTO_PRISON_UI_URL=https://welcome-dev.prison.service.justice.gov.uk
WHEREABOUTS_API_URL=https://whereabouts-api-dev.service.justice.gov.uk
LEARNING_AND_WORK_PROGRESS_UI_URL=https://learning-and-work-progress-dev.hmpps.service.justice.gov.uk
EDUCATION_AND_WORK_PLAN_API_URL=https://learningandworkprogress-api-dev.hmpps.service.justice.gov.uk
CONTENTFUL_HOST=https://graphql.eu.contentful.com
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_SPACE_ID=
CONTENTFUL_ACCESS_TOKEN=
PERSON_COMMUNICATION_NEEDS_API_URL=https://communication-needs-api-dev.hmpps.service.justice.gov.uk
HEALTH_AND_MEDICATION_API_URL=https://health-and-medication-api-dev.hmpps.service.justice.gov.uk
ALERTS_API_URL=https://alerts-api-dev.hmpps.service.justice.gov.uk
PERSON_INTEGRATION_API_URL=https://person-integration-api-dev.hmpps.service.justice.gov.uk
PERSONAL_RELATIONSHIPS_API_URL=https://personal-relationships-api-dev.hmpps.service.justice.gov.uk
```

</details>

Secrets can be extracted from the relevant kubernetes namespace on Cloud Platform using the follow example command
below. The values are base64 encoded and this command uses the `jq` CLI tool to decode the values.

```
kubectl get secret <INSERT_SECRET_NAME> -n hmpps-prisoner-profile-dev -o json | jq '.data|map_values(@base64d)'
```

2/ Run a local version of Redis:

```
docker-compose up redis
```

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

**NOTE** - This requires wiremock responses to be setup (in `wiremock-local/mappings`) for the required API calls.

### Run linter

After making code changes eslint can be used to ensure code style is maintained
(although husky ensures this is run as part of the pre-commit hook too)

```
npm run lint
```

## Feature Toggles

Features can be toggled by setting the relevant environment variable.

| Name                | Default Value | Type    | Description                                         |
|---------------------|---------------|---------|-----------------------------------------------------|
| SOME_TOGGLE_ENABLED | false         | Boolean | Example feature toggle, for demonstration purposes. |
