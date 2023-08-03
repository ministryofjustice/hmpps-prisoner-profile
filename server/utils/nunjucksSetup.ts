/* eslint-disable no-param-reassign */
import * as pathModule from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import {
  addressToLines,
  findError,
  formatScheduleItem,
  initialiseName,
  prisonerBelongsToUsersCaseLoad,
  summaryListOneHalfWidth,
  userHasRoles,
  apostrophe,
  prependBaseUrl,
  prependHmppsAuthBaseUrl,
  prisonerIsOut,
  prisonerIsTRN,
} from './utils'
import { pluralise } from './pluralise'
import { formatDate, formatDateTime } from './dateHelpers'
import config from '../config'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Digital Prison Services'

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = Date.now().toString()
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

  // Expose the google tag manager container ID to the nunjucks environment
  const {
    analytics: { tagManagerContainerId },
  } = config
  njkEnv.addGlobal('tagManagerContainerId', tagManagerContainerId.trim())

  njkEnv.addGlobal('prisonerBelongsToUsersCaseLoad', prisonerBelongsToUsersCaseLoad)
  njkEnv.addGlobal('userHasRoles', userHasRoles)

  njkEnv.addGlobal('prisonerIsTRN', prisonerIsTRN)
  njkEnv.addGlobal('prisonerIsOut', prisonerIsOut)

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('formatDate', formatDate)
  njkEnv.addFilter('formatDateTime', formatDateTime)
  njkEnv.addFilter('formatScheduleItem', formatScheduleItem)
  njkEnv.addFilter('summaryListOneHalfWidth', summaryListOneHalfWidth)
  njkEnv.addFilter('pluralise', pluralise)
  njkEnv.addFilter('addressToLines', addressToLines)
  njkEnv.addFilter('findError', findError)
  njkEnv.addFilter('addDefaultSelectedValue', (items, text) => {
    if (!items) return null

    return [
      {
        text,
        value: '',
        selected: true,
      },
      ...items,
    ]
  })

  njkEnv.addFilter(
    'setSelected',
    (items: { value: string; text: string }[], selected) =>
      items &&
      items.map(entry => ({
        ...entry,
        selected: entry && entry.value === selected,
      })),
  )

  njkEnv.addFilter('apostrophe', apostrophe)
  njkEnv.addFilter('prependBaseUrl', prependBaseUrl)
  njkEnv.addFilter('prependHmppsAuthBaseUrl', prependHmppsAuthBaseUrl)
}
