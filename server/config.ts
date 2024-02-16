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

export class AgentConfig {
  timeout: number

  constructor(timeout = 8000) {
    this.timeout = timeout
  }
}

export interface ApiConfig {
  url: string
  timeout: {
    response: number
    deadline: number
  }
  agent: AgentConfig
}

export default {
  buildNumber: get('BUILD_NUMBER', '1_0_0', requiredInProduction),
  productId: get('PRODUCT_ID', 'UNASSIGNED', requiredInProduction),
  gitRef: get('GIT_REF', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  branchName: get('GIT_BRANCH', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  production,
  https: production,
  staticResourceCacheDuration: 20,
  redis: {
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
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      apiClientId: get('API_CLIENT_ID', 'hmpps-prisoner-profile', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'hmpps-prisoner-profile-system', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000))),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
    prisonApi: {
      url: get('PRISON_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PRISON_API_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('PRISON_API_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(Number(get('PRISON_API_TIMEOUT_DEADLINE', 20000))),
    },
    prisonerSearchApi: {
      url: get('PRISONER_SEARCH_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PRISONER_SEARCH_API_TIMEOUT_SECONDS', 20000)),
        deadline: Number(get('PRISONER_SEARCH_API_TIMEOUT_SECONDS', 20000)),
      },
      agent: new AgentConfig(Number(get('PRISONER_SEARCH_API_TIMEOUT_DEADLINE', 20000))),
    },
    dpsHomePageUrl: get('DPS_HOME_PAGE_URL', 'http://localhost:3001', requiredInProduction),
    allocationManager: {
      url: get('ALLOCATION_MANAGER_ENDPOINT_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('ALLOCATION_MANAGER_API_TIMEOUT_SECONDS', 20000)),
        deadline: Number(get('ALLOCATION_MANAGER_API_TIMEOUT_SECONDS', 20000)),
      },
      agent: new AgentConfig(Number(get('ALLOCATION_MANAGER_API_TIMEOUT_DEADLINE', 20000))),
    },
    keyworker: {
      url: get('KEYWORKER_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('KEYWORKER_API_TIMEOUT_SECONDS', 20000)),
        deadline: Number(get('AKEYWORKER_API_TIMEOUT_SECONDS', 20000)),
      },
      agent: new AgentConfig(Number(get('KEYWORKER_API_TIMEOUT_DEADLINE', 20000))),
    },
    curiousApiUrl: {
      url: get('CURIOUS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('CURIOUS_API_URL_TIMEOUT_SECONDS', 20000)),
        deadline: Number(get('CURIOUS_API_URL_TIMEOUT_SECONDS', 20000)),
      },
      agent: new AgentConfig(Number(get('CURIOUS_API_URL_TIMEOUT_DEADLINE', 20000))),
    },
    whereaboutsApi: {
      url: get('WHEREABOUTS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('WHEREABOUTS_API_URL_TIMEOUT_SECONDS', 20000)),
        deadline: Number(get('WHEREABOUTS_API_URL_TIMEOUT_SECONDS', 20000)),
      },
      agent: new AgentConfig(Number(get('WHEREABOUTS_API_URL_TIMEOUT_DEADLINE', 20000))),
    },
    caseNotesApi: {
      url: get('CASE_NOTES_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('CASE_NOTES_API_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('CASE_NOTES_API_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(Number(get('CASE_NOTES_API_TIMEOUT_DEADLINE', 20000))),
    },
    incentivesApi: {
      url: get('INCENTIVES_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('INCENTIVES_API_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('INCENTIVES_API_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(Number(get('INCENTIVES_API_TIMEOUT_DEADLINE', 20000))),
    },
    pathfinderApi: {
      url: get('PATHFINDER_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PATHFINDER_API_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('PATHFINDER_API_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(Number(get('PATHFINDER_API_TIMEOUT_DEADLINE', 20000))),
    },
    manageSocCasesApi: {
      url: get('MANAGE_SOC_CASES_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('MANAGE_SOC_CASES_API_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('MANAGE_SOC_CASES_API_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(Number(get('MANAGE_SOC_CASES_API_TIMEOUT_DEADLINE', 20000))),
    },
    adjudicationsApi: {
      url: get('MANAGE_ADJUDICATIONS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('MANAGE_ADJUDICATIONS_API_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('MANAGE_ADJUDICATIONS_API_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(Number(get('MANAGE_ADJUDICATIONS_API_TIMEOUT_DEADLINE', 20000))),
    },
    nonAssociationsApi: {
      url: get('HMPPS_NON_ASSOCIATIONS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('HMPPS_NON_ASSOCIATIONS_API_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('HMPPS_NON_ASSOCIATIONS_API_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_NON_ASSOCIATIONS_API_TIMEOUT_DEADLINE', 20000))),
    },
    frontendComponents: {
      url: get('COMPONENT_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('COMPONENT_API_TIMEOUT_SECONDS', 20000)),
        deadline: Number(get('COMPONENT_API_TIMEOUT_SECONDS', 20000)),
      },
      agent: new AgentConfig(Number(get('COMPONENT_API_TIMEOUT_SECONDS', 20000))),
      latest: get('COMPONENT_API_LATEST', 'false') === 'true',
    },
    prisonerProfileDeliusApi: {
      url: get('PRISONER_PROFILE_DELIUS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('PRISONER_PROFILE_DELIUS_API_TIMEOUT_RESPONSE', 2000)),
        deadline: Number(get('PRISONER_PROFILE_DELIUS_API_TIMEOUT_DEADLINE', 2000)),
      },
      agent: new AgentConfig(Number(get('PRISONER_PROFILE_DELIUS_API_TIMEOUT_DEADLINE', 2000))),
    },
    manageUsersApi: {
      url: get('MANAGE_USERS_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('MANAGE_USERS_API_TIMEOUT_RESPONSE', 2000)),
        deadline: Number(get('MANAGE_USERS_API_TIMEOUT_DEADLINE', 2000)),
      },
      agent: new AgentConfig(Number(get('MANAGE_USERS_API_TIMEOUT_DEADLINE', 2000))),
    },
    complexityApi: {
      url: get('COMPLEXITY_OF_NEED_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('COMPLEXITY_OF_NEED_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('COMPLEXITY_OF_NEED_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(Number(get('COMPLEXITY_OF_NEED_API_TIMEOUT_DEADLINE', 5000))),
    },
    educationAndWorkPlanApi: {
      url: get('EDUCATION_AND_WORK_PLAN_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('EDUCATION_AND_WORK_PLAN_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('EDUCATION_AND_WORK_PLAN_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
    },
    restrictedPatientApi: {
      url: get('RESTRICTED_PATIENT_API_URL', 'http://localhost:8082', requiredInProduction),
      timeout: {
        response: Number(get('RESTRICTED_PATIENT_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('RESTRICTED_PATIENT_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
    },
  },
  serviceUrls: {
    offenderCategorisation: get('OFFENDER_CATEGORISATION_UI_URL', 'http://localhost:3001', requiredInProduction),
    useOfForce: get('USE_OF_FORCE_UI_URL', 'http://localhost:3001', requiredInProduction),
    manageAWarrantFolder: get('MANAGE_A_WARRANT_FOLDER_UI_URL', 'http://localhost:3001', requiredInProduction),
    digitalPrison: get('DPS_HOME_PAGE_URL', 'http://localhost:3001', requiredInProduction),
    pathfinder: get('PATHFINDER_UI_URL', 'http://localhost:3001', requiredInProduction),
    manageSocCases: get('MANAGE_SOC_CASES_UI_URL', 'http://localhost:3001', requiredInProduction),
    welcomePeopleIntoPrison: get('WELCOME_PEOPLE_INTO_PRISON_UI_URL', 'http://localhost:3001', requiredInProduction),
    createAndVaryALicence: get('CREATE_AND_VARY_A_LICENCE_UI_URL', 'http://localhost:3001', requiredInProduction),
    calculateReleaseDates: get('CALCULATE_RELEASE_DATES_UI_URL', 'http://localhost:3001', requiredInProduction),
    activities: get('ACTIVITIES_URL', 'http://localhost:3001', requiredInProduction),
    appointments: get('APPOINTMENTS_URL', 'http://localhost:3001', requiredInProduction),
    nonAssociations: get('NON_ASSOCIATIONS_UI_URL', 'http://localhost:3001', requiredInProduction),
    adjudications: get('ADJUDICATIONS_UI_URL', '', requiredInProduction),
    learningAndWorkProgress: get('LEARNING_AND_WORK_PROGRESS_UI_URL', 'http://localhost:3001', requiredInProduction),
  },
  analytics: {
    tagManagerContainerId: get('TAG_MANAGER_CONTAINER_ID', ''),
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  environmentName: get('ENVIRONMENT_NAME', ''),

  notifications: {
    enabled: process.env.NOTIFY_ENABLED ? process.env.NOTIFY_ENABLED === 'true' : true,
    notifyKey: process.env.NOTIFY_API_KEY || '',
    confirmBookingPrisonTemplateId: '391bb0e0-89b3-4aef-b11e-c6550b71fee8',
    emails: {
      WWI: {
        omu: process.env.WANDSWORTH_OMU_EMAIL,
      },
      TSI: {
        omu: process.env.THAMESIDE_OMU_EMAIL,
      },
      HEI: {
        omu: process.env.HEWELL_OMU_EMAIL,
      },
      BWI: {
        omu: process.env.BERWYN_OMU_EMAIL,
      },
      NMI: {
        omu: process.env.NOTTINGHAM_OMU_EMAIL,
      },
      EYI: {
        omu: process.env.ELMLEY_OMU_EMAIL,
      },
      BNI: {
        omu: process.env.BULLINGDON_OMU_EMAIL,
      },
      PBI: {
        omu: process.env.PETERBOROUGH_OMU_EMAIL,
      },
      BMI: {
        omu: process.env.BIRMINGHAM_OMU_EMAIL,
      },
      NWI: {
        omu: process.env.NORWICH_OMU_EMAIL,
      },
      PNI: {
        omu: process.env.PRESTON_OMU_EMAIL,
      },
      BZI: {
        omu: process.env.BRONZEFIELD_OMU_EMAIL,
      },
      PVI: {
        omu: process.env.PENTONVILLE_OMU_EMAIL,
      },
      EXI: {
        omu: process.env.EXETER_OMU_EMAIL,
      },
    },
  },
  featureToggles: {
    neurodiversityEnabledPrisons: process.env.NEURODIVERSITY_ENABLED_PRISONS || [],
    complexityEnabledPrisons: get('PRISONS_WITH_OFFENDERS_THAT_HAVE_COMPLEX_NEEDS', [], requiredInProduction),
    useOfForceDisabledPrisons: get('USE_OF_FORCE_DISABLED_PRISONS', [], requiredInProduction),
    profileAddAppointmentEnabled: toBoolean(get('PROFILE_ADD_APPOINTMENT_ENABLED', 'false')),
  },
}
