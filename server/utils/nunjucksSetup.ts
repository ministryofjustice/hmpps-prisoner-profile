/* eslint-disable no-param-reassign */
import * as pathModule from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import {
  addDefaultSelectedValue,
  addressToLines,
  addressToSummaryItems,
  apiErrorMessage,
  apostrophe,
  findError,
  formatMoney,
  formatName,
  formatScheduleItem,
  initialiseName,
  neurodiversityEnabled,
  prependBaseUrl,
  prependHmppsAuthBaseUrl,
  prisonerBelongsToUsersCaseLoad,
  prisonerIsOut,
  prisonerIsTRN,
  summaryListOneHalfWidth,
  toNonAssociationRows,
  userHasRoles,
} from './utils'
import { pluralise } from './pluralise'
import { formatAddressDate, formatDate, formatDateTime, timeFormat } from './dateHelpers'
import config from '../config'
import releaseDatesToSummaryRows from '../views/dataUtils/releaseDatesToSummaryRows'
import mapCsraReviewToSummaryList from '../mappers/csraReviewToSummaryListMapper'
import mapCsraQuestionsToSummaryList from '../mappers/csraQuestionsToSummaryListMapper'
import visitsWithVisitorsToListMapper from '../mappers/visitsWithVisitorsToListMapper'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'Digital Prison Services'
  app.locals.config = config

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
      'node_modules/govuk-frontend/dist/',
      'node_modules/govuk-frontend/dist/components/',
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
  njkEnv.addGlobal('neurodiversityEnabled', neurodiversityEnabled)
  njkEnv.addGlobal('standardApiErrorText', () => apiErrorMessage)

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('formatMoney', formatMoney)
  njkEnv.addFilter('formatDate', formatDate)
  njkEnv.addFilter('formatDateTime', formatDateTime)
  njkEnv.addFilter('formatScheduleItem', formatScheduleItem)
  njkEnv.addFilter('summaryListOneHalfWidth', summaryListOneHalfWidth)
  njkEnv.addFilter('pluralise', pluralise)
  njkEnv.addFilter('addressToLines', addressToLines)
  njkEnv.addFilter('findError', findError)
  njkEnv.addFilter('addDefaultSelectedValue', addDefaultSelectedValue)

  njkEnv.addFilter(
    'setSelected',
    (items: { value: string; text: string }[], selected) =>
      items &&
      items.map(entry => ({
        ...entry,
        selected: entry && String(entry.value) === String(selected),
      })),
  )

  njkEnv.addFilter(
    'setChecked',
    (items: { value: string; text: string }[], checked: string[]) =>
      items &&
      items.map(entry => ({
        ...entry,
        checked: entry && checked.includes(String(entry.value)),
      })),
  )

  njkEnv.addFilter('apostrophe', apostrophe)
  njkEnv.addFilter('prependBaseUrl', prependBaseUrl)
  njkEnv.addFilter('prependHmppsAuthBaseUrl', prependHmppsAuthBaseUrl)
  njkEnv.addFilter('toNonAssociationTableRows', toNonAssociationRows)
  njkEnv.addFilter('timeFormat', timeFormat)
  njkEnv.addFilter('toTextValue', (array: string[], selected: string) => {
    if (!array) return null

    const items = array.map(entry => ({
      text: entry,
      value: entry,
      selected: entry && entry === selected,
    }))

    return [
      {
        text: '--',
        value: '',
        selected: true,
        attributes: {
          hidden: 'hidden',
        },
      },
      ...items,
    ]
  })
  njkEnv.addFilter('releaseDatesToSummaryRows', releaseDatesToSummaryRows)
  njkEnv.addFilter('formatName', formatName)
  njkEnv.addFilter('toCsraAssessmentSummaryList', mapCsraReviewToSummaryList)
  njkEnv.addFilter('toCsraQuestionsSummaryList', mapCsraQuestionsToSummaryList)
  njkEnv.addFilter('toVisitsWithVisitorsList', visitsWithVisitorsToListMapper)
  njkEnv.addFilter('formatAddressDate', formatAddressDate)
  njkEnv.addFilter('addressToSummaryItems', addressToSummaryItems)
}
