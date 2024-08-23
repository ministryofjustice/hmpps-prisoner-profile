import { serviceCheckFactory } from '../data/healthCheck'
import type { AgentConfig } from '../config'
import config from '../config'
import type { ApplicationInfo } from '../applicationInfo'

interface HealthCheckStatus {
  name: string
  status: string
  message: unknown
}

interface HealthCheckResult extends Record<string, unknown> {
  status: string
  components: Record<string, unknown>
}

export type HealthCheckService = () => Promise<HealthCheckStatus>
export type HealthCheckCallback = (result: HealthCheckResult) => void

function service(name: string, url: string, agentConfig: AgentConfig): HealthCheckService {
  const check = serviceCheckFactory(name, url, agentConfig)
  return () =>
    check()
      .then(result => ({ name, status: 'UP', message: result }))
      .catch(err => ({ name, status: 'DOWN', message: err }))
}

function addAppInfo(result: HealthCheckResult, applicationInfo: ApplicationInfo): HealthCheckResult {
  const buildInfo = {
    uptime: process.uptime(),
    build: {
      buildNumber: applicationInfo.buildNumber,
      gitRef: applicationInfo.gitRef,
    },
    version: applicationInfo.buildNumber,
  }

  return { ...result, ...buildInfo }
}

function gatherCheckInfo(aggregateStatus: Record<string, unknown>, currentStatus: HealthCheckStatus) {
  return { ...aggregateStatus, [currentStatus.name]: { status: currentStatus.status, details: currentStatus.message } }
}

const nonResilientApiChecks = [
  ...(config.apis.tokenVerification.enabled
    ? [
        service(
          'tokenVerification',
          `${config.apis.tokenVerification.url}/health/ping`,
          config.apis.tokenVerification.agent,
        ),
      ]
    : []),
  service('hmppsAuth', `${config.apis.hmppsAuth.url}/health/ping`, config.apis.hmppsAuth.agent),
  service('prisonApi', `${config.apis.adjudicationsApi.url}/health/ping`, config.apis.adjudicationsApi.agent),
  service('alertsApi', `${config.apis.alertsApi.url}/health/ping`, config.apis.alertsApi.agent),
  service('bookAVideoLinkApi', `${config.apis.bookAVideoLinkApi.url}/health/ping`, config.apis.bookAVideoLinkApi.agent),
  service(
    'calculateReleaseDatesApi',
    `${config.apis.calculateReleaseDatesApi.url}/health/ping`,
    config.apis.calculateReleaseDatesApi.agent,
  ),
  service('caseNotesApi', `${config.apis.caseNotesApi.url}/health/ping`, config.apis.caseNotesApi.agent),
  service('complexityApi', `${config.apis.complexityApi.url}/health/ping`, config.apis.complexityApi.agent),
  service(
    'educationAndWorkPlanApi',
    `${config.apis.educationAndWorkPlanApi.url}/health/ping`,
    config.apis.educationAndWorkPlanApi.agent,
  ),
  service(
    'frontendComponents',
    `${config.apis.frontendComponents.url}/health/ping`,
    config.apis.frontendComponents.agent,
  ),
  service('incentivesApi', `${config.apis.incentivesApi.url}/health/ping`, config.apis.incentivesApi.agent),
  service('manageSocCasesApi', `${config.apis.manageSocCasesApi.url}/health/ping`, config.apis.manageSocCasesApi.agent),
  service('manageUsersApi', `${config.apis.manageUsersApi.url}/health/ping`, config.apis.manageUsersApi.agent),
  service('pathfinderApi', `${config.apis.pathfinderApi.url}/health/ping`, config.apis.pathfinderApi.agent),
  service('prisonerSearchApi', `${config.apis.prisonerSearchApi.url}/health/ping`, config.apis.prisonerSearchApi.agent),
  service('prisonPersonApi', `${config.apis.prisonPersonApi.url}/health/ping`, config.apis.prisonPersonApi.agent),
  service('prisonRegisterApi', `${config.apis.prisonRegisterApi.url}/health/ping`, config.apis.prisonRegisterApi.agent),
  service(
    'restrictedPatientApi',
    `${config.apis.restrictedPatientApi.url}/health/ping`,
    config.apis.restrictedPatientApi.agent,
  ),
  service('whereaboutsApi', `${config.apis.whereaboutsApi.url}/health/ping`, config.apis.whereaboutsApi.agent),
]

const resilientApiChecks = [
  service('allocationManager', `${config.apis.allocationManager.url}/health/ping`, config.apis.allocationManager.agent),
  service('curiousApiUrl', `${config.apis.curiousApiUrl.url}/health/ping`, config.apis.curiousApiUrl.agent),
  service('keyworkerApi', `${config.apis.keyworker.url}/health/ping`, config.apis.keyworker.agent),
  service(
    'nonAssociationsApi',
    `${config.apis.nonAssociationsApi.url}/health/ping`,
    config.apis.nonAssociationsApi.agent,
  ),
  service(
    'prisonerProfileDeliusApi',
    `${config.apis.prisonerProfileDeliusApi.url}/health/ping`,
    config.apis.prisonerProfileDeliusApi.agent,
  ),
]

export default function healthCheck(
  applicationInfo: ApplicationInfo,
  callback: HealthCheckCallback,
  nonResilientChecks = nonResilientApiChecks,
  resilientChecks = resilientApiChecks,
): void {
  Promise.all(resilientChecks.map(fn => fn())).then(resilientCheckResults => {
    Promise.all(nonResilientChecks.map(fn => fn())).then(nonResilientCheckResults => {
      let allOk = nonResilientCheckResults.every(item => item.status === 'UP') ? 'UP' : 'DOWN'

      if (allOk === 'UP') {
        allOk = resilientCheckResults.every(item => item.status === 'UP') ? 'UP' : 'DEGRADED'
      }

      const result = {
        status: allOk,
        components: [...nonResilientCheckResults, ...resilientCheckResults]
          .sort((a, b) => a.name.localeCompare(b.name))
          .reduce(gatherCheckInfo, {}),
      }

      callback(addAppInfo(result, applicationInfo))
    })
  })
}
