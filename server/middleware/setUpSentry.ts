/* eslint-disable no-param-reassign */

import * as Sentry from '@sentry/node'
import express from 'express'
import config from '../config'

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

      beforeSend(event) {
        if (event.user) {
          // Don't send PII:
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

export function setUpSentryErrorHandler(app: express.Express): void {
  if (config.sentry.dsn) {
    Sentry.setupExpressErrorHandler(app)
  }
}
