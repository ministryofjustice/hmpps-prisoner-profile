import {
  flushTelemetry,
  initialiseTelemetry,
  type SpanModifierFn,
  telemetry,
} from '@ministryofjustice/hmpps-azure-telemetry'
import logger from '../../logger'
import config from '../config'

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const addressFindUrlPattern = new RegExp(`(${escapeRegExp(`${config.apis.osPlacesApi.url}/find?query=`)}).*`, 'g')
const addressUprnUrlPattern = new RegExp(`(${escapeRegExp(`${config.apis.osPlacesApi.url}/uprn?uprn=`)}).*`, 'g')

// OpenTelemetry HTTP client spans expose the outgoing URL on `url.full` (current stable
// semantic convention) and `http.url` (legacy). Scrub both to avoid leaking address queries
// and UPRNs into Application Insights dependency telemetry.
const urlAttributesToScrub = ['url.full', 'http.url'] as const

/**
 * Creates a span modifier that redacts OS Places address lookup URLs so query strings
 * containing user-entered addresses or UPRNs are not sent to Application Insights.
 */
function scrubAddressLookupUrls(): SpanModifierFn {
  return span => {
    urlAttributesToScrub.forEach(attribute => {
      const value = span.attributes[attribute]
      if (typeof value !== 'string') return

      const scrubbed = value
        .replace(addressFindUrlPattern, '$1ADDRESS_QUERY')
        .replace(addressUprnUrlPattern, '$1ADDRESS_UPRN')

      if (scrubbed !== value) {
        span.setAttribute(attribute, scrubbed)
      }
    })
  }
}

initialiseTelemetry({
  serviceName: 'hmpps-prisoner-profile',
  serviceVersion: process.env.BUILD_NUMBER || 'unknown',
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  debug: process.env.DEBUG_TELEMETRY === 'true',
})
  .addFilter(
    telemetry.processors.filterSpanWherePath([
      '/health',
      '/ping',
      '/info',
      '/assets/*',
      '/favicon.ico',
      'GET /api/addresses/find',
    ]),
  )
  .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
  .addModifier(scrubAddressLookupUrls())
  .startRecording()

const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down...`)
  await flushTelemetry()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
