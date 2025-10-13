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

      beforeSend(event) {
        if (event.user) {
          // Don't send username
          // eslint-disable-next-line no-param-reassign
          delete event.user.username
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
