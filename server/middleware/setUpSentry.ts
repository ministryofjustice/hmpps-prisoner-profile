/* eslint-disable no-param-reassign */

import express from 'express'
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
        if (error instanceof SanitisedError && error.data) {
          const sanitisedError = anonymise(error.data.userMessage || error.data.developerMessage)
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
  ]
  return replacements.reduce((anonymisedText, [match, replacement]) => {
    if (match.global) {
      return anonymisedText.replaceAll(match, replacement)
    }
    return anonymisedText.replace(match, replacement)
  }, text)
}

export function setUpSentryErrorHandler(app: express.Express): void {
  if (config.sentry.dsn) {
    Sentry.setupExpressErrorHandler(app)
  }
}
