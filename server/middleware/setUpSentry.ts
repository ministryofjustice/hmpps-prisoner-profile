/* eslint-disable no-param-reassign */

import express from 'express'
import superagent from 'superagent'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import * as Sentry from '@sentry/node'
import config from '../config'
import NotFoundError from '../utils/notFoundError'

export function setUpSentry() {
  if (config.sentry.dsn) {
    // Prevent usernames which are PII from being sent to Sentry
    // https://docs.sentry.io/platforms/javascript/data-management/sensitive-data#examples
    const anonymousId = Math.random().toString()
    Sentry.setUser({ id: anonymousId })

    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.sentry.environment,
      release: config.gitRef,
      sendDefaultPii: false,

      ignoreErrors: [
        // ignore timeouts; already logged in Application Insights
        /Timeout of .* exceeded/,
        // ignore auth errors; already logged in Application Insights
        'Failed to obtain access token',
      ],

      beforeSend(event, hint) {
        const error = hint.originalException

        // ignore 404 errors as long as they are explicitly thrown in application code
        if (error instanceof NotFoundError) {
          return null
        }

        // add extra context from third-party apis when available
        if (error instanceof SanitisedError) {
          const sanitisedError = anonymisedErrorMessage(error.data)
          if (sanitisedError) {
            event.contexts = {
              ...event.contexts,
              DPS: {
                ...event.contexts?.DPS,
                sanitisedError,
              },
            }
          }
        }

        // Don’t send PII
        if (event.transaction) {
          event.transaction = anonymise(event.transaction)!
        }
        if (event.request?.url) {
          event.request.url = anonymise(event.request.url)!
        }
        delete event.user?.email
        delete event.user?.username
        delete event.request?.data
        delete event.request?.cookies
        delete event.request?.headers

        return event
      },
    })

    monkeyPatchSuperagent()
  }
}

/** Replaces sensitive data, eg. in event’s transaction name and request url */
export function anonymise(text: string | undefined): string | undefined {
  if (!text) {
    return text
  }
  const replacements: [RegExp, string][] = [
    // prisoner number
    [/[A-Z]\d{4}[A-Z]{2}/gi, ':prisonerNumber'],

    // address autosuggest lookup
    [/\/api\/addresses\/find\/[A-Za-z0-9.+%' _-]+/, '/api/addresses/find/:query'],

    // add url patterns here which might reveal user-entered sensitive details
    // [/\/some-url\/[^/]+/, '/some-url/:query'],
  ]
  return replacements.reduce((anonymisedText, [match, replacement]) => {
    if (match.global) {
      return anonymisedText.replaceAll(match, replacement)
    }
    return anonymisedText.replace(match, replacement)
  }, text)
}

/** DPS apis often supply messages in the JSON response body */
function anonymisedErrorMessage(data?: { userMessage?: string; developerMessage?: string }): string | undefined {
  return data && anonymise(data.userMessage || data.developerMessage)
}

/** Submit uncaught errors */
export function setUpSentryErrorHandler(app: express.Express): void {
  if (config.sentry.dsn) {
    Sentry.setupExpressErrorHandler(app)
  }
}

/** Sentry client does not automatically integrate into superagent */
function monkeyPatchSuperagent(): void {
  if ('__sentryPatch' in superagent) return

  const endSuper = superagent.Request.prototype.end
  superagent.Request.prototype.end = function end(callback) {
    const req = this as superagent.Request
    const { method, url: unsafeUrl } = req
    const url = anonymise(unsafeUrl)

    req.on('response', (res: superagent.Response) => {
      const { status } = res
      Sentry.addBreadcrumb({
        type: 'http',
        category: 'http',
        level: typeof status !== 'number' || (status > 400 && status !== 404) ? 'error' : 'info',
        message: `${method} ${url} ${status}`,
        data: {
          url,
          'http.method': method,
          status_code: status,
        },
      })
    })

    req.on('error', (error: Error | superagent.ResponseError | superagent.HTTPError) => {
      const status = 'status' in error && error.status
      const errorMessage =
        ('response' in error &&
          error.response &&
          'body' in error.response &&
          anonymisedErrorMessage(error.response.body)) ||
        anonymise(error.message) ||
        `Unknown ${error?.constructor?.name ?? 'error'}`
      Sentry.addBreadcrumb({
        type: 'http',
        category: 'http',
        level: 'error',
        message: `${method} ${url} ${status}`,
        data: {
          url,
          'http.method': method,
          status_code: status,
          error: errorMessage,
        },
      })
    })

    return endSuper.call(this, callback)
  }

  // @ts-expect-error monkey patch flag
  // eslint-disable-next-line no-underscore-dangle
  superagent.__sentryPatch = true
}
