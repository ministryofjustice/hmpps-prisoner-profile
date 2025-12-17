import {
  Contracts,
  defaultClient,
  DistributedTracingModes,
  getCorrelationContext,
  setup,
  TelemetryClient,
} from 'applicationinsights'
import { CorrelationContext } from 'applicationinsights/out/AutoCollection/CorrelationContextManager'
import { EnvelopeTelemetry } from 'applicationinsights/out/Declarations/Contracts'
import { Request, RequestHandler } from 'express'
import { ApplicationInfo } from '../applicationInfo'
import { HmppsUser } from '../interfaces/HmppsUser'

const requestPrefixesToIgnore = ['GET /assets/', 'GET /health', 'GET /ping', 'GET /info', 'GET /api/addresses/find']
const dependencyPrefixesToIgnore = ['sqs', 'api.os.uk']

const SECONDS_IN_A_MINUTE = 60
const SECONDS_IN_AN_HOUR = SECONDS_IN_A_MINUTE * 60
const SECONDS_IN_A_DAY = SECONDS_IN_AN_HOUR * 24

const MINIMUM_SUCCESSFUL_DURATION_SECONDS = 3

export type ContextObject = {
  ['http.ServerRequest']?: Request
  correlationContext?: CorrelationContext
}

export function initialiseAppInsights(): void {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
  }
}

export function buildAppInsightsClient({ applicationName, buildNumber }: ApplicationInfo): TelemetryClient {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    defaultClient.context.tags['ai.cloud.role'] = applicationName
    defaultClient.context.tags['ai.application.ver'] = buildNumber
    defaultClient.addTelemetryProcessor(addUserDataToRequests)
    defaultClient.addTelemetryProcessor(parameterisePaths)
    defaultClient.addTelemetryProcessor(ignoredRequestsProcessor)
    defaultClient.addTelemetryProcessor(ignoredDependenciesProcessor)
    return defaultClient
  }
  return null
}

function addUserDataToRequests(envelope: EnvelopeTelemetry, contextObjects: ContextObject) {
  const isRequest = envelope.data.baseType === Contracts.TelemetryTypeString.Request
  if (isRequest) {
    const user = contextObjects?.['http.ServerRequest']?.res?.locals?.user || ({} as HmppsUser)
    const { username, authSource } = user
    if (username) {
      let activeCaseLoadId: string | undefined
      if ('activeCaseLoadId' in user) {
        activeCaseLoadId = user.activeCaseLoadId
      }
      const { properties } = envelope.data.baseData
      // eslint-disable-next-line no-param-reassign
      envelope.data.baseData.properties = {
        username,
        authSource,
        activeCaseLoadId,
        ...properties,
      }
    }
  }
  return true
}

function parameterisePaths(envelope: EnvelopeTelemetry, contextObjects: ContextObject) {
  const operationNameOverride = contextObjects.correlationContext?.customProperties?.getProperty('operationName')
  if (operationNameOverride) {
    envelope.tags['ai.operation.name'] = envelope.data.baseData.name = operationNameOverride // eslint-disable-line no-param-reassign,no-multi-assign
  }
  return true
}

function ignoredRequestsProcessor(envelope: EnvelopeTelemetry) {
  if (envelope.data.baseType === Contracts.TelemetryTypeString.Request) {
    const requestData = envelope.data.baseData
    if (requestData instanceof Contracts.RequestData) {
      const { name } = requestData
      return requestPrefixesToIgnore.every(prefix => !name.startsWith(prefix))
    }
  }
  return true
}

function ignoredDependenciesProcessor(envelope: EnvelopeTelemetry) {
  if (envelope.data.baseType === Contracts.TelemetryTypeString.Dependency) {
    const dependencyData = envelope.data.baseData
    if (dependencyData instanceof Contracts.RemoteDependencyData) {
      const { target, success, duration } = dependencyData

      return (
        dependencyPrefixesToIgnore.every(prefix => !target.startsWith(prefix)) &&
        (parseDurationToSeconds(duration) > MINIMUM_SUCCESSFUL_DURATION_SECONDS || !success)
      )
    }
  }
  return true
}

export function appInsightsMiddleware(): RequestHandler {
  return (req, res, next) => {
    res.prependOnceListener('finish', () => {
      const context = getCorrelationContext()
      if (context && req.route) {
        context.customProperties.setProperty('operationName', `${req.method} ${req.route?.path}`)
      }
    })
    next()
  }
}

function parseDurationToSeconds(value: string): number {
  const withoutMillis = value.split('.')[0]
  const tokens = withoutMillis.split(':').reverse()
  return (
    parseInt(tokens[0], 10) +
    parseInt(tokens[1], 10) * SECONDS_IN_A_MINUTE +
    parseInt(tokens[2], 10) * SECONDS_IN_AN_HOUR +
    (tokens.length > 3 ? parseInt(tokens[3], 10) * SECONDS_IN_A_DAY : 0)
  )
}
