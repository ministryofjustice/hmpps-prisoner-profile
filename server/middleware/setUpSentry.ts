/* eslint-disable no-param-reassign */

import express from 'express'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import * as Sentry from '@sentry/node'
import config from '../config'
import { errorHasStatus } from '../utils/errorHelpers'

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
        // ignore 404 errors, wherever they originate
        if (errorHasStatus(error, 404)) {
          return null
        }
        if (error instanceof SanitisedError && error.data) {
          // add extra context from third-party apis when available
          event.contexts = {
            ...event.contexts,
            DPS: {
              sanitisedError: error.data.userMessage ?? error.data.developerMessage,
            },
          }
        }

        // Don’t send PII
        if (event.transaction) {
          event.transaction = anonymise(event.transaction)
        }
        if (event.request?.url) {
          event.request.url = anonymise(event.request.url)
        }
        if (event.user) {
          delete event.user?.email
          delete event.user?.username
          delete event.request?.data
          delete event.request?.cookies
          delete event.request?.headers
        }

        return event
      },
    })
  }
}

/** Replaces sensitive data in URL-like text, eg. transaction name and request url */
export function anonymise(urlLike: string | undefined): string | undefined {
  if (!urlLike) {
    return urlLike
  }
  const replacements: [RegExp, string][] = [
    // prisoner number
    [/[A-Z]\d{4}[A-Z]{2}/gi, ':prisonerNumber'],

    // address autosuggest lookup
    [/\/api\/addresses\/find\/[A-Za-z0-9.+%' _-]+/, '/api/addresses/find/:query'],
  ]
  return replacements.reduce((anonymisedUrlLike, [match, replacement]) => {
    if (match.global) {
      return anonymisedUrlLike.replaceAll(match, replacement)
    }
    return anonymisedUrlLike.replace(match, replacement)
  }, urlLike)
}

export function setUpSentryErrorHandler(app: express.Express): void {
  if (config.sentry.dsn) {
    Sentry.setupExpressErrorHandler(app)
  }
}
