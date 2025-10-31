import { AgentConfig } from '@ministryofjustice/hmpps-rest-client'

const production = process.env.NODE_ENV === 'production'

const toBoolean = (value: unknown): boolean => {
  return value === 'true'
}

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name] !== undefined) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export default {
  buildNumber: get('BUILD_NUMBER', '1_0_0', requiredInProduction),
  productId: get('PRODUCT_ID', 'UNASSIGNED', requiredInProduction),
  gitRef: get('GIT_REF', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  branchName: get('GIT_BRANCH', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  appInsightsConnectionString: get('APPLICATIONINSIGHTS_CONNECTION_STRING', '', requiredInProduction),
  production,
  https: production,
  staticResourceCacheDuration: '1h',
  redis: {
    enabled: get('REDIS_ENABLED', 'false', requiredInProduction) === 'true',
    host: get('REDIS_HOST', 'localhost', requiredInProduction),
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 120)),
  },
  apis: {
    audit: {
      queueUrl: get('AUDIT_SQS_QUEUE_URL', 'http://localhost:4566/000000000000/mainQueue', requiredInProduction),
      region: get('AUDIT_SQS_REGION', 'eu-west-2', requiredInProduction),
      serviceName: get('AUDIT_SERVICE_NAME', 'hmpps-prisoner-profile', requiredInProduction),
      enabled: get('AUDIT_ENABLED', 'false') === 'true',
    },
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 3000))),
      apiClientId: get('API_CLIENT_ID', 'hmpps-prisoner-profile', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'hmpps-prisoner-profile-system', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientIdCurious: get(
        'SYSTEM_CLIENT_ID_CURIOUS',
        'hmpps-prisoner-profile-system-curious',
        requiredInProduction,
      ),
      systemClientSecretCurious: get('SYSTEM_CLIENT_SECRET_CURIOUS', 'clientsecret', requiredInProduction),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 3000))),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
    prisonApi: {
      url: get('PRISON_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PRISON_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('PRISON_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('PRISON_API_TIMEOUT_DEADLINE', 10000))),
    },
    locationsInsidePrisonApi: {
      url: get('LOCATIONS_INSIDE_PRISON_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('LOCATIONS_INSIDE_PRISON_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('LOCATIONS_INSIDE_PRISON_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('LOCATIONS_INSIDE_PRISON_API_TIMEOUT_DEADLINE', 3000))),
    },
    nomisSyncPrisonerMappingApi: {
      url: get('NOMIS_SYNC_PRISONER_MAPPING_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('NOMIS_SYNC_PRISONER_MAPPING_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('NOMIS_SYNC_PRISONER_MAPPING_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('NOMIS_SYNC_PRISONER_MAPPING_API_TIMEOUT_DEADLINE', 3000))),
    },
    prisonerSearchApi: {
      url: get('PRISONER_SEARCH_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PRISONER_SEARCH_API_TIMEOUT_SECONDS', 3000)),
        deadline: Number(get('PRISONER_SEARCH_API_TIMEOUT_SECONDS', 3000)),
      },
      agent: new AgentConfig(Number(get('PRISONER_SEARCH_API_TIMEOUT_DEADLINE', 3000))),
    },
    allocationManager: {
      url: get('ALLOCATION_MANAGER_ENDPOINT_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('ALLOCATION_MANAGER_API_TIMEOUT_SECONDS', 3000)),
        deadline: Number(get('ALLOCATION_MANAGER_API_TIMEOUT_SECONDS', 3000)),
      },
      agent: new AgentConfig(Number(get('ALLOCATION_MANAGER_API_TIMEOUT_DEADLINE', 3000))),
    },
    keyworker: {
      url: get('KEYWORKER_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('KEYWORKER_API_TIMEOUT_SECONDS', 3000)),
        deadline: Number(get('AKEYWORKER_API_TIMEOUT_SECONDS', 3000)),
      },
      agent: new AgentConfig(Number(get('KEYWORKER_API_TIMEOUT_DEADLINE', 3000))),
    },
    curiousApiUrl: {
      url: get('CURIOUS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('CURIOUS_API_URL_TIMEOUT_SECONDS', 3000)),
        deadline: Number(get('CURIOUS_API_URL_TIMEOUT_SECONDS', 3000)),
      },
      agent: new AgentConfig(Number(get('CURIOUS_API_URL_TIMEOUT_DEADLINE', 3000))),
    },
    whereaboutsApi: {
      url: get('WHEREABOUTS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('WHEREABOUTS_API_URL_TIMEOUT_SECONDS', 3000)),
        deadline: Number(get('WHEREABOUTS_API_URL_TIMEOUT_SECONDS', 3000)),
      },
      agent: new AgentConfig(Number(get('WHEREABOUTS_API_URL_TIMEOUT_DEADLINE', 3000))),
    },
    bookAVideoLinkApi: {
      url: get('BOOK_A_VIDEO_LINK_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('BOOK_A_VIDEO_LINK_API_TIMEOUT_SECONDS', 3000)),
        deadline: Number(get('BOOK_A_VIDEO_LINK_API_TIMEOUT_SECONDS', 3000)),
      },
      agent: new AgentConfig(Number(get('BOOK_A_VIDEO_LINK_API_TIMEOUT_DEADLINE', 3000))),
    },
    caseNotesApi: {
      url: get('CASE_NOTES_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('CASE_NOTES_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('CASE_NOTES_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('CASE_NOTES_API_TIMEOUT_DEADLINE', 3000))),
    },
    incentivesApi: {
      url: get('INCENTIVES_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('INCENTIVES_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('INCENTIVES_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('INCENTIVES_API_TIMEOUT_DEADLINE', 3000))),
    },
    pathfinderApi: {
      url: get('PATHFINDER_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PATHFINDER_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('PATHFINDER_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('PATHFINDER_API_TIMEOUT_DEADLINE', 3000))),
    },
    manageSocCasesApi: {
      url: get('MANAGE_SOC_CASES_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('MANAGE_SOC_CASES_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('MANAGE_SOC_CASES_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('MANAGE_SOC_CASES_API_TIMEOUT_DEADLINE', 3000))),
    },
    adjudicationsApi: {
      url: get('MANAGE_ADJUDICATIONS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('MANAGE_ADJUDICATIONS_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('MANAGE_ADJUDICATIONS_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('MANAGE_ADJUDICATIONS_API_TIMEOUT_DEADLINE', 3000))),
    },
    nonAssociationsApi: {
      url: get('HMPPS_NON_ASSOCIATIONS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('HMPPS_NON_ASSOCIATIONS_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('HMPPS_NON_ASSOCIATIONS_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_NON_ASSOCIATIONS_API_TIMEOUT_DEADLINE', 3000))),
    },
    prisonerProfileDeliusApi: {
      url: get('PRISONER_PROFILE_DELIUS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PRISONER_PROFILE_DELIUS_API_TIMEOUT_RESPONSE', 2000)),
        deadline: Number(get('PRISONER_PROFILE_DELIUS_API_TIMEOUT_DEADLINE', 2000)),
      },
      agent: new AgentConfig(Number(get('PRISONER_PROFILE_DELIUS_API_TIMEOUT_DEADLINE', 2000))),
    },
    complexityApi: {
      url: get('COMPLEXITY_OF_NEED_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('COMPLEXITY_OF_NEED_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('COMPLEXITY_OF_NEED_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('COMPLEXITY_OF_NEED_API_TIMEOUT_DEADLINE', 3000))),
    },
    educationAndWorkPlanApi: {
      url: get('EDUCATION_AND_WORK_PLAN_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('EDUCATION_AND_WORK_PLAN_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('EDUCATION_AND_WORK_PLAN_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(),
    },
    restrictedPatientApi: {
      url: get('RESTRICTED_PATIENT_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('RESTRICTED_PATIENT_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('RESTRICTED_PATIENT_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(),
    },
    prisonRegisterApi: {
      url: get('PRISON_REGISTER_API_URL', 'http://localhost:8083', requiredInProduction),
      timeout: {
        response: Number(get('PRISON_REGISTER_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('PRISON_REGISTER_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('PRISON_REGISTER_API_TIMEOUT_RESPONSE', 3000))),
    },
    calculateReleaseDatesApi: {
      url: get('CALCULATE_RELEASE_DATES_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('CALCULATE_RELEASE_DATES_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('CALCULATE_RELEASE_DATES_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('CALCULATE_RELEASE_DATES_API_TIMEOUT_DEADLINE', 3000))),
    },
    contentful: {
      host: get('CONTENTFUL_HOST', '', requiredInProduction),
      spaceId: get('CONTENTFUL_SPACE_ID', 'spaceId', requiredInProduction),
      environment: get('CONTENTFUL_ENVIRONMENT', 'environment', requiredInProduction),
      accessToken: get('CONTENTFUL_ACCESS_TOKEN', 'token', requiredInProduction),
    },
    alertsApi: {
      url: get('ALERTS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('ALERTS_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('ALERTS_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('ALERTS_API_TIMEOUT_DEADLINE', 5000))),
    },
    personIntegrationApi: {
      url: get('PERSON_INTEGRATION_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PERSON_INTEGRATION_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('PRISON_INTEGRATION_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('PERSON_INTEGRATION_TIMEOUT_DEADLINE', 10000))),
    },
    csipApi: {
      url: get('CSIP_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('CSIP_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('CSIP_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('CSIP_TIMEOUT_DEADLINE', 3000))),
    },
    healthAndMedicationApi: {
      url: get('HEALTH_AND_MEDICATION_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('HEALTH_AND_MEDICATION_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('HEALTH_AND_MEDICATION_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('HEALTH_AND_MEDICATION_TIMEOUT_DEADLINE', 3000))),
    },
    osPlacesApi: {
      url: get('OS_PLACES_API_URL', 'https://api.os.uk/search/places/v1', requiredInProduction),
      apiKey: get('OS_PLACES_API_KEY', '', requiredInProduction),
      timeout: {
        response: Number(get('OS_PLACES_API_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('OS_PLACES_API_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('OS_PLACES_API_TIMEOUT_DEADLINE', 3000))),
    },
    personCommunicationNeedsApi: {
      url: get('PERSON_COMMUNICATION_NEEDS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PERSON_COMMUNICATION_NEEDS_TIMEOUT_RESPONSE', 3000)),
        deadline: Number(get('PERSON_COMMUNICATION_NEEDS_TIMEOUT_DEADLINE', 3000)),
      },
      agent: new AgentConfig(Number(get('PERSON_COMMUNICATION_NEEDS_TIMEOUT_DEADLINE', 3000))),
    },
    personalRelationshipsApi: {
      url: get('PERSONAL_RELATIONSHIPS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PERSONAL_RELATIONSHIPS_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('PERSONAL_RELATIONSHIPS_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('PERSONAL_RELATIONSHIPS_TIMEOUT_DEADLINE', 10000))),
    },
    componentApi: {
      url: get('COMPONENT_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('COMPONENT_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('COMPONENT_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('COMPONENT_TIMEOUT_DEADLINE', 10000))),
    },
  },
  serviceUrls: {
    offenderCategorisation: get('OFFENDER_CATEGORISATION_UI_URL', 'http://localhost:3001', requiredInProduction),
    useOfForce: get('USE_OF_FORCE_UI_URL', 'http://localhost:3001', requiredInProduction),
    manageAWarrantFolder: get('MANAGE_A_WARRANT_FOLDER_UI_URL', 'http://localhost:3001', requiredInProduction),
    digitalPrison: get('DPS_CORE_URL', 'http://localhost:3001', requiredInProduction),
    dpsHomepage: get('DPS_HOME_PAGE_URL', 'http://localhost:3001', requiredInProduction),
    pathfinder: get('PATHFINDER_UI_URL', 'http://localhost:3001', requiredInProduction),
    manageSocCases: get('MANAGE_SOC_CASES_UI_URL', 'http://localhost:3001', requiredInProduction),
    welcomePeopleIntoPrison: get('WELCOME_PEOPLE_INTO_PRISON_UI_URL', 'http://localhost:3001', requiredInProduction),
    createAndVaryALicence: get('CREATE_AND_VARY_A_LICENCE_UI_URL', 'http://localhost:3001', requiredInProduction),
    calculateReleaseDates: get('CALCULATE_RELEASE_DATES_UI_URL', 'http://localhost:3001', requiredInProduction),
    activities: get('ACTIVITIES_URL', 'http://localhost:3001', requiredInProduction),
    appointments: get('APPOINTMENTS_URL', 'http://localhost:3001', requiredInProduction),
    nonAssociations: get('NON_ASSOCIATIONS_UI_URL', 'http://localhost:3001', requiredInProduction),
    adjudications: get('ADJUDICATIONS_UI_URL', 'http://localhost:3001', requiredInProduction),
    learningAndWorkProgress: get('LEARNING_AND_WORK_PROGRESS_UI_URL', 'http://localhost:3001', requiredInProduction),
    changeSomeonesCell: get('CHANGE_SOMEONES_CELL_UI_URL', 'http://localhost:3001', requiredInProduction),
    incentives: get('INCENTIVES_UI_URL', 'http://localhost:3001', requiredInProduction),
    courtCaseReleaseDates: get('CCRD_UI_URL', 'http://localhost:3001', requiredInProduction),
    csip: get('CSIP_UI_URL', 'http://localhost:3001', requiredInProduction),
    assessForEarlyRelease: get('ASSESS_FOR_EARLY_RELEASE_UI_URL', 'http://localhost:3001', requiredInProduction),
    contacts: get('CONTACTS_UI_URL', 'http://localhost:3001', requiredInProduction),
    allocateKeyWorkers: get('ALLOCATE_KEY_WORKERS_UI_URL', 'http://localhost:3001', requiredInProduction),
    allocatePersonalOfficers: get('ALLOCATE_PERSONAL_OFFICERS_UI_URL', 'http://localhost:3001', requiredInProduction),
  },
  analytics: {
    tagManagerContainerId: get('TAG_MANAGER_CONTAINER_ID', ''),
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  environmentName: get('ENVIRONMENT_NAME', ''),
  featureToggles: {
    appInsightsWebAnalyticsEnabledPrisons: get('APPLICATIONINSIGHTS_WEB_ANALYTICS_ENABLED_PRISONS', []),
    neurodiversityEnabledPrisons: get('NEURODIVERSITY_ENABLED_PRISONS', ['BLI', 'NHI', 'LII', 'SLI']),
    complexityEnabledPrisons: get(
      'PRISONS_WITH_OFFENDERS_THAT_HAVE_COMPLEX_NEEDS',
      ['AGI', 'BZI', 'DHI', 'DWI', 'ESI', 'EWI', 'FHI', 'LNI', 'NHI', 'PFI', 'SDI', 'STI'],
      requiredInProduction,
    ),
    useOfForceDisabledPrisons: get('USE_OF_FORCE_DISABLED_PRISONS', [], requiredInProduction) as string[],
    profileAddAppointmentEnabled: toBoolean(get('PROFILE_ADD_APPOINTMENT_ENABLED', 'false')),
    editProfileEnabled: toBoolean(get('EDIT_PROFILE_ENABLED', 'false')),
    editProfileEnabledPrisons: get('EDIT_PROFILE_ENABLED_PRISONS', []),
    editProfilePhotoEnabledPrisons: get('EDIT_PROFILE_PHOTO_ENABLED_PRISONS', []),
    editProfileSimulateFetch: toBoolean(get('EDIT_PROFILE_SIMULATE_FETCH', 'false')),

    personalRelationshipsApiReadEnabled: toBoolean(get('PERSONAL_RELATIONSHIPS_API_READ_ENABLED', 'true')),

    dietAndAllergyEnabledPrisons: get('DIET_AND_ALLERGY_ENABLED_PRISONS', []),
    dietAndAllergyEnabledPrisonsByDate: get('DIET_AND_ALLERGY_ENABLED_PRISONS_BY_DATE', []),
    dietAndAllergyEnabledPrisonsFrom: get('DIET_AND_ALLERGY_ENABLED_FROM', '2099-01-01T00:00:00'),
    healthAndMedicationApiReadEnabled: toBoolean(get('HEALTH_AND_MEDICATION_API_READ_ENABLED', 'false')),
    militaryHistoryEnabledFrom: get('MILITARY_HISTORY_ENABLED_FROM', '2099-01-01T00:00:00'),
    editReligionEnabledFrom: get('EDIT_RELIGION_ENABLED_FROM', '2099-01-01T00:00:00'),
    externalContactsEnabledPrisons: get('EXTERNAL_CONTACTS_ENABLED_PRISONS', []),
    manageAllocationsEnabled: toBoolean(get('MANAGE_ALLOCATIONS_ENABLED', 'false')),
    personEndpointsEnabled: toBoolean(get('PERSON_ENDPOINTS_ENABLED', 'false')),
  },
  defaultCourtVideoUrl: get('DEFAULT_COURT_VIDEO_URL', 'meet.video.justice.gov.uk'),
  sentry: {
    dsn: get('SENTRY_DSN', null, requiredInProduction),
    environment: get('SENTRY_ENVIRONMENT', 'local'),
  },
}
