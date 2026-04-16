/* eslint-disable no-param-reassign */

import * as Sentry from '@sentry/node'
import express from 'express'
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

        // Don’t send PII
        if (event.transaction) {
          event.transaction = anonymisePrisonerNumbers(event.transaction)
        }
        if (event.request?.url) {
          event.request.url = anonymisePrisonerNumbers(event.request.url)
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

function anonymisePrisonerNumbers(urlLike: string | undefined): string | undefined {
  return urlLike?.replaceAll(/[A-Z]\d{4}[A-Z]{2}/gi, ':prisonerNumber') ?? urlLike
}

export function setUpSentryErrorHandler(app: express.Express): void {
  if (config.sentry.dsn) {
    Sentry.setupExpressErrorHandler(app)
  }
}
