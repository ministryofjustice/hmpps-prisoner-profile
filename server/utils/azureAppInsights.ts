import {
  flushTelemetry,
  initialiseTelemetry,
  SpanKind,
  type SpanModifierFn,
  telemetry,
} from '@ministryofjustice/hmpps-azure-telemetry'
import config from '../config'

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const addressFindUrlPattern = new RegExp(`(${escapeRegExp(`${config.apis.osPlacesApi.url}/find?query=`)}).*`, 'g')
const addressUprnUrlPattern = new RegExp(`(${escapeRegExp(`${config.apis.osPlacesApi.url}/uprn?uprn=`)}).*`, 'g')
const urlAttributesToScrub = ['url.full', 'http.url', 'http.target']

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
      '/api/addresses/find/*',
    ]),
  )
  .addModifier(scrubAddressLookupUrls())
  .addModifier(ensureHttpRouteIsSet())
  .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
  .startRecording()

/**
 * Fix for when nested routes can't resolve the full path
 */
function ensureHttpRouteIsSet(): SpanModifierFn {
  const prisonerNumberPattern = /\b[A-Z]\d{4}[A-Z]{2}\b/g
  const uuidPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi

  const parameterise = (value: string) =>
    value //
      ?.replace(prisonerNumberPattern, ':prisonerNumber')
      ?.replace(uuidPattern, ':id')

  return span => {
    if (span.kind === SpanKind.SERVER && !span.attributes['http.route']) {
      const parameterisedUrl = parameterise(span.attributes['http.target'] as string)
      span.setAttribute('http.route', parameterisedUrl)
    }
  }
}

/**
 * Scrubs any address lookup URLs from the span attributes to avoid leaking PII.
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

const shutdown = async () => {
  await flushTelemetry()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown())
process.on('SIGINT', () => shutdown())
