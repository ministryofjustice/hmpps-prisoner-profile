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
  arrayIncludes,
  contactAddressToHtml,
  findError,
  formatMoney,
  formatName,
  formatPhoneNumber,
  formatScheduleItem,
  initialiseName,
  isInUsersCaseLoad,
  latestImageId,
  lengthOfService,
  neurodiversityEnabled,
  prependBaseUrl,
  prependHmppsAuthBaseUrl,
  prisonerIsOut,
  prisonerIsTRN,
  sortByLatestAndUuid,
  summaryListOneHalfWidth,
  toNonAssociationRows,
  userHasRoles,
} from './utils'
import { checkboxFieldDataToInputs } from './checkboxUtils'
import { pluralise } from './pluralise'
import {
  formatAddressDate,
  formatDate,
  formatDateTime,
  formatDateToPattern,
  formatDateWithAge,
  timeFormat,
} from './dateHelpers'
import config from '../config'
import releaseDatesToSummaryRows from '../views/dataUtils/releaseDatesToSummaryRows'
import mapCsraReviewToSummaryList from '../mappers/csraReviewToSummaryListMapper'
import mapCsraQuestionsToSummaryList from '../mappers/csraQuestionsToSummaryListMapper'
import visitsWithVisitorsToListMapper from '../mappers/visitsWithVisitorsToListMapper'
import moneySummaryToMiniSummary from '../views/dataUtils/moneySummaryToMiniSummary'
import adjudicationsSummaryToMiniSummary from '../views/dataUtils/adjudicationsSummaryToMiniSummary'
import visitsSummaryToMiniSummary from '../views/dataUtils/visitsSummaryToMiniSummary'
import csraSummaryToMiniSummary from '../views/dataUtils/csraSummaryToMiniSummary'
import categorySummaryToMiniSummary from '../views/dataUtils/categorySummaryToMiniSummary'
import incentiveSummaryToMiniSummary from '../views/dataUtils/incentiveSummaryToMiniSummary'
import summaryListRowWithOptionalChangeLink, {
  listToSummaryListRows,
} from '../views/dataUtils/summaryListRowWithOptionalChangeLink'
import groupDistinguishingMarks, {
  getBodyPartDescription,
  getBodyPartToken,
  getMarkLocationDescription,
} from '../views/dataUtils/groupDistinguishingMarksForView'
import distinguishingMarkBodyPartsToDisplay from '../views/dataUtils/distinguishingMarkBodyPartsToDisplay'
import getDistinguishingFeatureDetailsFormData from '../views/dataUtils/getDistinguishingMarkDetailsFormConfig'
import currentCsipDetailToMiniCardContent from '../views/dataUtils/currentCsipDetailToMiniCardContent'
import {
  externalContactsEnabled,
  militaryHistoryEnabled,
  newOverviewPageLayoutEnabled,
  bvlsMasterPublicPrivateNotesEnabled,
} from './featureToggles'
import nonAssociationSummaryToMiniSummary from '../views/dataUtils/nonAssociationSummaryToMiniSummary'
import categorySummaryToMiniSummaryOldLayout from '../views/dataUtils/categorySummaryToMiniSummaryOldLayout'
import incentiveSummaryToMiniSummaryOldLayout from '../views/dataUtils/incentiveSummaryToMiniSummaryOldLayout'
import visitsSummaryToMiniSummaryOldLayout from '../views/dataUtils/visitsSummaryToMiniSummaryOldLayout'
import appendRefererToUrl from './appendRefererToUrl'

const production = process.env.NODE_ENV === 'production'

export default function nunjucksSetup(app: express.Express, path: pathModule.PlatformPath): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'DPS'
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
      'node_modules/@ministryofjustice/hmpps-connect-dps-components/dist/assets/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-shared-items/dist/assets/',
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
  njkEnv.addGlobal('isInUsersCaseLoad', isInUsersCaseLoad)
  njkEnv.addGlobal('userHasRoles', userHasRoles)
  njkEnv.addGlobal('prisonerIsTRN', prisonerIsTRN)
  njkEnv.addGlobal('prisonerIsOut', prisonerIsOut)
  njkEnv.addGlobal('neurodiversityEnabled', neurodiversityEnabled)
  njkEnv.addGlobal('standardApiErrorText', () => apiErrorMessage)
  njkEnv.addGlobal('toSummaryListRows', listToSummaryListRows)
  njkEnv.addGlobal('militaryHistoryEnabled', militaryHistoryEnabled)
  njkEnv.addGlobal('externalContactsEnabled', externalContactsEnabled)
  njkEnv.addGlobal('useNewOverviewPageLayout', newOverviewPageLayoutEnabled)
  njkEnv.addGlobal('currentTimeMillis', () => Date.now().toString())
  njkEnv.addGlobal('bvlsMasterPublicPrivateNotesEnabled', bvlsMasterPublicPrivateNotesEnabled)

  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('formatMoney', formatMoney)
  njkEnv.addFilter('formatDate', formatDate)
  njkEnv.addFilter('formatDateTime', formatDateTime)
  njkEnv.addFilter('formatScheduleItem', formatScheduleItem)
  njkEnv.addFilter('summaryListOneHalfWidth', summaryListOneHalfWidth)
  njkEnv.addFilter('pluralise', pluralise)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  njkEnv.addFilter('filterNot', (l: any[], iteratee: string, eq: unknown) => l.filter(o => o[iteratee] !== eq))
  njkEnv.addFilter('addressToLines', addressToLines)
  njkEnv.addFilter('contactAddressToHtml', contactAddressToHtml)
  njkEnv.addFilter('find', (l: never[], iteratee: string, eq: unknown) => l.find(o => o[iteratee] === eq))
  njkEnv.addFilter('findError', findError)
  njkEnv.addFilter('addDefaultSelectedValue', addDefaultSelectedValue)
  njkEnv.addFilter('containsSelected', (items: { selected: boolean }[]) => items && items.some(item => item.selected))

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
  njkEnv.addFilter('toMoneySummaryDisplay', moneySummaryToMiniSummary)
  njkEnv.addFilter('toAdjudicationsSummaryDisplay', adjudicationsSummaryToMiniSummary)
  njkEnv.addFilter('toNonAssociationSummaryDisplay', nonAssociationSummaryToMiniSummary)
  njkEnv.addFilter('toVisitsSummaryDisplay', visitsSummaryToMiniSummary)
  njkEnv.addFilter('toVisitsSummaryDisplayOldLayout', visitsSummaryToMiniSummaryOldLayout)
  njkEnv.addFilter('toCsraSummaryDisplay', csraSummaryToMiniSummary)
  njkEnv.addFilter('toCsipMiniCardContent', currentCsipDetailToMiniCardContent)
  njkEnv.addFilter('toCategorySummaryDisplay', categorySummaryToMiniSummary)
  njkEnv.addFilter('toCategorySummaryDisplayOldLayout', categorySummaryToMiniSummaryOldLayout)
  njkEnv.addFilter('toIncentiveSummaryDisplay', incentiveSummaryToMiniSummary)
  njkEnv.addFilter('toIncentiveSummaryDisplayOldLayout', incentiveSummaryToMiniSummaryOldLayout)
  njkEnv.addFilter('summaryListRowWithOptionalChangeLink', summaryListRowWithOptionalChangeLink)
  njkEnv.addFilter('checkboxFieldDataToInputs', checkboxFieldDataToInputs)
  njkEnv.addFilter('groupDistinguishingMarks', groupDistinguishingMarks)
  njkEnv.addFilter('toBodyPartDisplayText', distinguishingMarkBodyPartsToDisplay)
  njkEnv.addFilter('toBodyPartSpecificFormData', getDistinguishingFeatureDetailsFormData)
  njkEnv.addFilter('toMarkLocationDescription', getMarkLocationDescription)
  njkEnv.addFilter('toBodyPartDescription', getBodyPartDescription)
  njkEnv.addFilter('toBodyPartToken', getBodyPartToken)
  njkEnv.addFilter('sortByLatestAndUuid', sortByLatestAndUuid)
  njkEnv.addFilter('latestImageId', latestImageId)
  njkEnv.addFilter('lengthOfService', lengthOfService)
  njkEnv.addFilter('formatDateToPattern', formatDateToPattern)
  njkEnv.addFilter('formatDateWithAge', formatDateWithAge)
  njkEnv.addFilter('formatPhoneNumber', formatPhoneNumber)
  njkEnv.addFilter('includes', arrayIncludes)
  njkEnv.addFilter('appendRefererToUrl', appendRefererToUrl)
}
