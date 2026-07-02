import {
  flushTelemetry,
  initialiseTelemetry,
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
  .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
  .addModifier(scrubAddressLookupUrls())
  .startRecording()

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
