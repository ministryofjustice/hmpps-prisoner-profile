const production = process.env.NODE_ENV === 'production'
const toNumber = (value: string | undefined): number | undefined => {
  const result = parseInt(value, 10)
  return Number.isSafeInteger(result) && result
}

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
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
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000))),
      apiClientId: get('API_CLIENT_ID', 'clientid', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'clientid', requiredInProduction),
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
    dpsHomePageUrl: get('DPS_HOME_PAGE_URL', 'http://localhost:3001', requiredInProduction),
    prisonApi: {
      url: process.env.API_ENDPOINT_URL || 'http://localhost:8080/',
      timeoutSeconds: toNumber(process.env.API_ENDPOINT_TIMEOUT_SECONDS) || 30,
    },
    oauth2: {
      url: process.env.OAUTH_ENDPOINT_URL || 'http://localhost:9090/auth/',
      ui_url: process.env.OAUTH_ENDPOINT_UI_URL || process.env.OAUTH_ENDPOINT_URL || 'http://localhost:9090/auth/',
      timeoutSeconds: toNumber(process.env.API_ENDPOINT_TIMEOUT_SECONDS) || 30,
      clientId: process.env.API_CLIENT_ID || 'prisonapiclient',
      clientSecret: process.env.API_CLIENT_SECRET || 'clientsecret',
      systemClientId: process.env.API_SYSTEM_CLIENT_ID || 'prisonstaffhubclient',
      systemClientSecret: process.env.API_SYSTEM_CLIENT_SECRET || 'clientsecret',
    },
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  localMockData: get('LOCAL_MOCK_DATA', false),
}
